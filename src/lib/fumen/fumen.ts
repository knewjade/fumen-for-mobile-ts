import { FieldConstants, isMinoPiece, Operation, Piece, Rotation } from '../enums';
import { Quiz } from '../quiz';
import { Field, FieldLine } from './field';
import { getAction } from './action';
import { Values } from './values';

export interface Page {
    index: number;
    lastPage: boolean;
    field: Field;
    sentLine: FieldLine;
    piece?: {
        lock: boolean;
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
        send: boolean;
        mirrored: boolean;
        colorize: boolean;
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

const FIELD_WIDTH = FieldConstants.Width;
const FIELD_TOP = FieldConstants.Height;
const FIELD_BLOCKS = (FIELD_TOP + FieldConstants.Garbage) * FIELD_WIDTH;

export async function decode(data: string, callback: (page: Page) => void | Promise<void>): Promise<void> {
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
        lastRefIndex: -1,
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
        const action = getAction(actionValue);

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
        } else {
            comment.ref = store.lastRefIndex;
        }

        // Quiz用の操作を取得し、次ページ開始時点のQuizに1手進める
        let quiz: {
            operation?: Operation;
        } | undefined = undefined;

        if (store.quiz !== undefined) {
            if (action.isLock && isMinoPiece(action.piece)) {
                const operation = store.quiz.getOperation(action.piece);
                quiz = { operation };
                store.quiz = store.quiz.operate(operation);
            } else {
                quiz = {
                    operation: undefined,
                };
            }
        }

        // データ処理用に加工する
        let currentPiece: {
            lock: boolean;
            type: Piece;
            rotation: Rotation;
            coordinate: {
                x: number,
                y: number,
            };
        } | undefined;
        if (action.piece !== Piece.Empty) {
            currentPiece = {
                lock: action.isLock,
                type: action.piece,
                rotation: action.rotation,
                coordinate: action.coordinate,
            };
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
                send: action.isBlockUp,
                mirrored: action.isMirror,
                colorize: action.isColor,
            },
        });

        pageIndex += 1;

        if (action.isLock) {
            if (isMinoPiece(action.piece)) {
                currentField.put(action.piece, action.rotation, action.coordinate);
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
