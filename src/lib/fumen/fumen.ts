import { FieldConstants, isMinoPiece, Operation, Piece, Rotation } from '../enums';
import { Quiz } from './quiz';
import { Field } from './field';
import { decodeAction, encodeAction } from './action';
import { ENCODE_TABLE_LENGTH, Values } from './values';
import { FumenError } from '../errors';
import { Pages } from '../pages';

export interface Move {
    type: Piece;
    rotation: Rotation;
    coordinate: {
        x: number;
        y: number;
    };
}

export interface Page {
    index: number;
    field: {
        obj?: Field;
        ref?: number;
    };
    piece?: Move;
    comment: {
        text?: string;
        ref?: number;
    };
    quiz?: {
        operation?: Operation;
    };
    commands?: {
        pre: {
            [key in string]: PreCommand;
        };
    };
    flags: {
        lock: boolean;
        mirror: boolean;
        colorize: boolean;
        rise: boolean;
    };
}

export type PreCommand = BlockAction;

export interface BlockAction {
    type: 'block' | 'sentBlock';
    x: number;
    y: number;
    piece: Piece;
}

const COMMENT_TABLE =
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const MAX_COMMENT_CHAR_VALUE = COMMENT_TABLE.length + 1;

function decodeToCommentChars(v: number): string[] {
    const array: string[] = [];
    let value = v;
    for (let count = 0; count < 4; count += 1) {
        const index = value % MAX_COMMENT_CHAR_VALUE;
        array.push(COMMENT_TABLE[index]);
        value = Math.floor(value / MAX_COMMENT_CHAR_VALUE);
    }
    return array;
}

function enodeFromCommentChars(ch: string): number {
    return COMMENT_TABLE.indexOf(ch);
}

const FIELD_WIDTH = FieldConstants.Width;

export function extract(str: string): { version: '115' | '110', data: string } {
    const format = (version: '115' | '110', data: string) => {
        const trim = data.trim().replace(/[?\s]+/g, '');
        return { version, data: trim };
    };

    let data = str;

    // url parameters
    const paramIndex = data.indexOf('&');
    if (0 <= paramIndex) {
        data = data.substring(0, paramIndex);
    }

    // v115@~
    {
        const prefix = '115@';
        const prefixIndex = str.indexOf(prefix);
        if (0 <= prefixIndex) {
            const sub = data.substr(prefixIndex + prefix.length);
            return format('115', sub);
        }
    }

    // v110@~
    {
        const prefix = '110@';
        const prefixIndex = str.indexOf(prefix);
        if (0 <= prefixIndex) {
            const sub = data.substr(prefixIndex + prefix.length);
            return format('110', sub);
        }
    }

    throw new FumenError('Fumen is not supported');
}

type Callback = (field: Field, move: Move | undefined, comment: string) => void;

export async function decode(fumen: string, callback: Callback = () => {
}): Promise<Page[]> {
    const { version, data } = extract(fumen);
    switch (version) {
    case '115':
        return innerDecode(data, 23, callback);
    case '110':
        return innerDecode(data, 21, callback);
    }
    throw new FumenError('Not support decode');
}

export async function innerDecode(
    fumen: string,
    fieldTop: number,
    callback: Callback = () => {
    },
): Promise<Page[]> {
    const FIELD_MAX_HEIGHT = fieldTop + FieldConstants.SentLine;
    const FIELD_BLOCKS = FIELD_MAX_HEIGHT * FIELD_WIDTH;

    const updateField = (prev: Field) => {
        const result = {
            changed: false,
            field: prev,
        };

        let index = 0;
        while (index < FIELD_BLOCKS) {
            const diffBlock = values.poll(2);
            const diff = Math.floor(diffBlock / FIELD_BLOCKS);

            const numOfBlocks = diffBlock % FIELD_BLOCKS;

            if (numOfBlocks !== FIELD_BLOCKS - 1) {
                result.changed = true;
            }

            for (let block = 0; block < numOfBlocks + 1; block += 1) {
                const x = index % FIELD_WIDTH;
                const y = fieldTop - Math.floor(index / FIELD_WIDTH) - 1;
                result.field.add(x, y, diff - 8);
                index += 1;
            }
        }

        return result;
    };

    let pageIndex = 0;
    const values = new Values(fumen);
    let prevField = new Field({});

    const store: {
        repeatCount: number,
        refIndex: {
            comment: number,
            field: number,
        };
        quiz?: Quiz,
        lastCommentText: string;
    } = {
        repeatCount: -1,
        refIndex: {
            comment: 0,
            field: 0,
        },
        quiz: undefined,
        lastCommentText: '',
    };

    const pages: Page[] = [];

    while (!values.isEmpty()) {
        // Parse field
        let currentFieldObj;
        if (0 < store.repeatCount) {
            currentFieldObj = {
                field: prevField,
                changed: false,
            };

            store.repeatCount -= 1;
        } else {
            currentFieldObj = updateField(prevField.copy());

            if (!currentFieldObj.changed) {
                store.repeatCount = values.poll(1);
            }
        }

        // Parse action
        const actionValue = values.poll(3);
        const action = decodeAction(actionValue, fieldTop);

        // Parse comment
        let comment;
        if (action.comment) {
            // コメントに更新があるとき
            const commentValues: number[] = [];
            const commentLength = values.poll(2);

            for (let commentCounter = 0; commentCounter < Math.floor((commentLength + 3) / 4); commentCounter += 1) {
                const commentValue = values.poll(5);
                commentValues.push(commentValue);
            }

            const flatten: string[] = [];
            for (const value of commentValues) {
                const chars = decodeToCommentChars(value);
                flatten.push(...chars);
            }

            const commentText = unescape(flatten.slice(0, commentLength).join(''));
            store.lastCommentText = commentText;
            comment = { text: commentText };
            store.refIndex.comment = pageIndex;

            try {
                store.quiz = new Quiz(comment.text);
            } catch (e) {
                store.quiz = undefined;
            }
        } else if (pageIndex === 0) {
            // コメントに更新がないが、先頭のページのとき
            comment = { text: '' };
        } else {
            // コメントに更新がないとき
            comment = { ref: store.refIndex.comment };
        }

        // Quiz用の操作を取得し、次ページ開始時点のQuizに1手進める
        let quiz: {
            operation?: Operation;
        } | undefined = undefined;

        if (store.quiz !== undefined) {
            if (action.lock && isMinoPiece(action.piece.type) && store.quiz.canOperate()) {
                try {
                    const operation = store.quiz.getOperation(action.piece.type);
                    quiz = { operation };
                    store.quiz = store.quiz.operate(operation);
                } catch (e) {
                    // Not operate
                    console.error(e.message);
                    quiz = { operation: undefined };
                }
            } else {
                quiz = {
                    operation: undefined,
                };
            }
        }

        // データ処理用に加工する
        let currentPiece: {
            type: Piece;
            rotation: Rotation;
            coordinate: {
                x: number,
                y: number,
            };
        } | undefined;
        if (action.piece.type !== Piece.Empty) {
            currentPiece = action.piece;
        }

        // pageの作成
        let field;
        if (currentFieldObj.changed || pageIndex === 0) {
            // フィールドに変化があったとき
            // フィールドに変化がなかったが、先頭のページだったとき
            field = { obj: currentFieldObj.field.copy() };
            store.refIndex.field = pageIndex;
        } else {
            // フィールドに変化がないとき
            field = { ref: store.refIndex.field };
        }

        const page = {
            field,
            comment,
            quiz,
            index: pageIndex,
            piece: currentPiece,
            flags: {
                lock: action.lock,
                mirror: action.mirror,
                colorize: action.colorize,
                rise: action.rise,
            },
        };
        pages.push(page);

        callback(
            currentFieldObj.field.copy()
            , currentPiece
            , store.quiz !== undefined ? store.quiz.format().toString() : store.lastCommentText,
        );

        pageIndex += 1;

        if (action.lock) {
            if (isMinoPiece(action.piece.type)) {
                currentFieldObj.field.put(action.piece);
            }

            currentFieldObj.field.clearLine();

            if (action.rise) {
                currentFieldObj.field.up();
            }

            if (action.mirror) {
                currentFieldObj.field.mirror();
            }
        }

        prevField = currentFieldObj.field;
    }

    return pages;
}

export async function encode(inputPages: Page[], isAsync: boolean = false): Promise<string> {
    const updateField = (prev: Field, current: Field) => {
        const { changed, values } = encodeField(prev, current);

        if (changed) {
            // フィールドを記録して、リピートを終了する
            allValues.merge(values);
            lastRepeatIndex = -1;
        } else if (lastRepeatIndex < 0 || allValues.get(lastRepeatIndex) === ENCODE_TABLE_LENGTH - 1) {
            // フィールドを記録して、リピートを開始する
            allValues.merge(values);
            allValues.push(0);
            lastRepeatIndex = allValues.length - 1;
        } else if (allValues.get(lastRepeatIndex) < (ENCODE_TABLE_LENGTH - 1)) {
            // フィールドは記録せず、リピートを進める
            const currentRepeatValue = allValues.get(lastRepeatIndex);
            allValues.set(lastRepeatIndex, currentRepeatValue + 1);
        }
    };

    let lastRepeatIndex = -1;
    const allValues = new Values();
    let prevField = new Field({});

    const pages = new Pages(inputPages);

    const innerEncode = (index: number) => {
        const field = pages.getField(index);

        const currentPage = inputPages[index];
        const currentField = field !== undefined ? field.copy() : prevField.copy();

        // コマンドの反映
        const commands = currentPage.commands;
        if (commands !== undefined) {
            Object.keys(commands.pre)
                .map(key => commands.pre[key])
                .forEach((command: PreCommand) => {
                    switch (command.type) {
                    case 'block': {
                        const { x, y, piece } = command;
                        currentField.setToPlayField(x + y * 10, piece);
                        return;
                    }
                    case 'sentBlock': {
                        const { x, y, piece } = command;
                        currentField.setToSentLine(x + y * 10, piece);
                        return;
                    }
                    }
                });
        }

        // フィールドの更新
        updateField(prevField, currentField);

        // アクションの更新
        const isComment = currentPage.comment.text !== undefined && (index !== 0 || currentPage.comment.text !== '');
        const piece = currentPage.piece !== undefined ? currentPage.piece : {
            type: Piece.Empty,
            rotation: Rotation.Reverse,
            coordinate: {
                x: 0,
                y: 22,
            },
        };
        const action = {
            piece,
            rise: currentPage.flags.rise,
            mirror: currentPage.flags.mirror,
            colorize: currentPage.flags.colorize,
            lock: currentPage.flags.lock,
            comment: isComment,
        };

        const actionNumber = encodeAction(action);
        allValues.push(actionNumber, 3);

        // コメントの更新
        if (currentPage.comment.text !== undefined && isComment) {
            const comment = escape(currentPage.comment.text);
            const commentLength = Math.min(comment.length, 4095);

            allValues.push(commentLength, 2);

            // コメントを符号化
            for (let index = 0; index < commentLength; index += 4) {
                let value = 0;
                for (let count = 0; count < 4; count += 1) {
                    const newIndex = index + count;
                    if (commentLength <= newIndex) {
                        break;
                    }
                    const ch = comment.charAt(newIndex);
                    value += enodeFromCommentChars(ch) * Math.pow(MAX_COMMENT_CHAR_VALUE, count);
                }

                allValues.push(value, 5);
            }
        }

        // 地形の更新
        if (action.lock) {
            if (isMinoPiece(action.piece.type)) {
                currentField.put(action.piece);
            }

            currentField.clearLine();

            if (action.rise) {
                currentField.up();
            }

            if (action.mirror) {
                currentField.mirror();
            }
        }

        prevField = currentField;
    };

    const innerEncodeAsync = async (index: number) => {
        innerEncode(index);
    };

    for (let index = 0; index < inputPages.length; index += 1) {
        if (isAsync) {
            await innerEncodeAsync(index);
        } else {
            innerEncode(index);
        }
    }

    // テト譜が短いときはそのまま出力する
    // 47文字ごとに?が挿入されるが、実際は先頭にv115@が入るため、最初の?は42文字後になる
    const data = allValues.toString();
    if (data.length < 41) {
        return data;
    }

    // ?を挿入する
    const head = [data.substr(0, 42)];
    const tails = data.substring(42);
    const split = tails.match(/[\S]{1,47}/g) || [];
    return head.concat(split).join('?');
}

// フィールドをエンコードする
// 前のフィールドがないときは空のフィールドを指定する
// 入力フィールドの高さは23, 幅は10
function encodeField(prev: Field, current: Field) {
    const FIELD_TOP = 23;
    const FIELD_MAX_HEIGHT = FIELD_TOP + 1;
    const FIELD_BLOCKS = FIELD_MAX_HEIGHT * FIELD_WIDTH;

    const values = new Values();

    // 前のフィールドとの差を計算: 0〜16
    const getDiff = (xIndex: number, yIndex: number) => {
        const y: number = FIELD_TOP - yIndex - 1;
        return current.get(xIndex, y) - prev.get(xIndex, y) + 8;
    };

    // データの記録
    const recordBlockCounts = (diff: number, counter: number) => {
        const value: number = diff * FIELD_BLOCKS + counter;
        values.push(value, 2);
    };

    // フィールド値から連続したブロック数に変換
    let changed = false;
    let prev_diff = getDiff(0, 0);
    let counter = -1;
    for (let yIndex = 0; yIndex < FIELD_MAX_HEIGHT; yIndex += 1) {
        for (let xIndex = 0; xIndex < FIELD_WIDTH; xIndex += 1) {
            const diff = getDiff(xIndex, yIndex);
            if (diff !== prev_diff) {
                recordBlockCounts(prev_diff, counter);
                counter = 0;
                prev_diff = diff;
                changed = true;
            } else {
                counter += 1;
            }
        }
    }

    // 最後の連続ブロックを処理
    recordBlockCounts(prev_diff, counter);

    return {
        values,
        changed,
    };
}
