import { FieldConstants, isMinoPiece, Operation, Piece, Rotation } from '../enums';
import { Quiz } from './quiz';
import { Field, FieldLine } from './field';
import { decodeAction, encodeAction } from './action';
import { ENCODE_TABLE_LENGTH, Values } from './values';
import { FumenError } from '../errors';

export interface Page {
    index: number;
    lastPage: boolean;
    field: Field;
    sentLine: FieldLine;
    piece?: {
        type: Piece;
        rotation: Rotation;
        coordinate: {
            x: number,
            y: number,
        };
    };
    comment: {
        text?: string;
        ref?: number;
    };
    quiz?: {
        operation?: Operation;
    };
    flags: {
        lock: boolean;
        send: boolean;
        mirrored: boolean;
        colorize: boolean;
        blockUp: boolean;
    };
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
const FIELD_TOP = FieldConstants.Height;
const FIELD_SENT_LINE = FieldConstants.SentLine;
const FIELD_BLOCKS = (FIELD_TOP + FIELD_SENT_LINE) * FIELD_WIDTH;

export function extract(str: string): string {
    let data = str;

    // v115@~
    const prefix = '115@';
    const prefixIndex = str.indexOf(prefix);
    if (0 <= prefixIndex) {
        data = data.substr(prefixIndex + prefix.length);
    }

    // url parameters
    const paramIndex = data.indexOf('&');
    if (0 <= paramIndex) {
        data = data.substring(0, paramIndex);
    }

    // v114@~
    if (data.includes('@')) {
        throw new FumenError('Fumen is supported v115 only');
    }

    return data.trim().replace(/[?\s]+/g, '');
}

export async function decode(fumen: string, callback: (page: Page) => void | Promise<void>): Promise<void> {
    const data = extract(fumen);

    let pageIndex = 0;
    const values = new Values(data);
    let [prevField, currentField] = [new Field({}), new Field({})];
    let blockUp = new FieldLine({});

    const store: {
        repeatCount: number,
        lastRefIndex: number;
        quiz?: Quiz,
    } = {
        repeatCount: -1,
        lastRefIndex: 0,
        quiz: undefined,
    };

    while (!values.isEmpty()) {
        // Parse field
        if (store.repeatCount <= 0) {
            let index = 0;
            let isChange = false;
            while (index < FIELD_BLOCKS) {
                const diffBlock = values.poll(2);
                const diff = Math.floor(diffBlock / FIELD_BLOCKS);

                const numOfBlocks = diffBlock % FIELD_BLOCKS;

                if (numOfBlocks !== FIELD_BLOCKS - 1) {
                    isChange = true;
                }

                for (let block = 0; block < numOfBlocks + 1; block += 1) {
                    const x = index % FIELD_WIDTH;
                    const y = FIELD_TOP - Math.floor(index / FIELD_WIDTH) - 1;
                    if (0 <= y) {
                        currentField.add(x, y, diff - 8);
                    } else {
                        blockUp.add(x, diff - 8);
                    }

                    index += 1;
                }
            }
            if (!isChange) {
                store.repeatCount = values.poll(1);
            }
        } else {
            currentField = prevField;
            store.repeatCount -= 1;
        }

        // Parse action
        const actionValue = values.poll(3);
        const action = decodeAction(actionValue);

        // Parse comment
        const comment: {
            text?: string;
            ref?: number;
        } = {};
        if (action.isComment) {
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

            comment.text = unescape(flatten.slice(0, commentLength).join(''));
            store.lastRefIndex = pageIndex;

            if (Quiz.verify(comment.text)) {
                store.quiz = new Quiz(comment.text);
            } else {
                store.quiz = undefined;
            }
        } else if (pageIndex === 0) {
            comment.text = '';
        } else {
            comment.ref = store.lastRefIndex;
        }

        // Quiz用の操作を取得し、次ページ開始時点のQuizに1手進める
        let quiz: {
            operation?: Operation;
        } | undefined = undefined;

        if (store.quiz !== undefined) {
            if (action.isLock && isMinoPiece(action.piece.type) && store.quiz.canOperate()) {
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

        await callback({
            comment,
            quiz,
            index: pageIndex,
            lastPage: values.isEmpty(),
            field: currentField.copy(),
            sentLine: blockUp.copy(),
            piece: currentPiece,
            flags: {
                lock: action.isLock,
                send: action.isBlockUp,
                mirrored: action.isMirror,
                colorize: action.isColor,
                blockUp: action.isBlockUp,
            },
        });

        pageIndex += 1;

        if (action.isLock) {
            if (isMinoPiece(action.piece.type)) {
                currentField.put(action.piece);
            }

            currentField.clearLine();

            if (action.isBlockUp) {
                currentField.up(blockUp.toShallowField());
                blockUp = new FieldLine({});
            }

            if (action.isMirror) {
                currentField.mirror();
            }
        }

        prevField = currentField;
    }
}

export async function encode(pages: Page[]): Promise<string> {
    let lastRepeatIndex = -1;
    const allValues = new Values();

    const updateField = (prev: Field, current: Field) => {
        const { changed, values } = encodeField2(prev, current);

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

    for (let index = 0; index < pages.length; index += 1) {
        const prevField = 0 < index ? pages[index - 1].sentLine.concat(pages[index - 1].field) : new Field({});
        const currentPage = pages[index];

        // フィールドの更新
        updateField(prevField, currentPage.sentLine.concat(currentPage.field));

        // アクションの更新
        const isComment = currentPage.comment.text !== undefined && (index !== 0 || currentPage.comment.text !== '');
        const action = {
            isComment,
            piece: {
                type: Piece.Empty,
                rotation: Rotation.Reverse,
                coordinate: {
                    x: 0,
                    y: 0,
                },
            },
            isBlockUp: currentPage.flags.blockUp,
            isMirror: currentPage.flags.mirrored,
            isColor: currentPage.flags.colorize,
            isLock: currentPage.flags.lock,
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
    }

    return allValues.toString();
}

// フィールドをエンコードする
// 前のフィールドがないときは空のフィールドを指定する
// 入力フィールドの高さは23, 幅は10
function encodeField2(prev: Field, current: Field) {
    const values = new Values();

    // 前のフィールドとの差を計算: 0〜16
    const getDiff = (xIndex: number, yIndex: number) => {
        const y: number = FIELD_TOP - yIndex - 1;

        if (y < 0) {
            return 8;
        }

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
    for (let yIndex = 0; yIndex < FIELD_TOP + FIELD_SENT_LINE; yIndex += 1) {
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
