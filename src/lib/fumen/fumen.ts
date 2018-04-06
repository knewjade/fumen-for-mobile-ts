import { FieldConstants, isMinoPiece, Operation, Piece, Rotation } from '../enums';
import { FumenError } from '../errors';
import { Quiz } from '../quiz';
import { Field, FieldLine } from './field';
import { Action, getAction } from './action';

export interface Page {
    Index: number;
    LastPage: boolean;
    Field: Field;
    SentLine: FieldLine;
    Piece?: {
        Lock: boolean;
        Type: Piece;
        Rotation: Rotation;
        Coordinate: {
            x: number,
            y: number,
        };
    };
    Comment: {
        Text?: string;
        Ref?: number;
    };
    Quiz?: {
        Operation: Operation;
    };
    Flags: {
        Send: boolean;
        Mirrored: boolean;
        Colorize: boolean;
    };
}

interface FumenPage {
    index: number;
    action: Action;
    comment?: string;
    commentRef: number;
    field: Piece[];
    blockUp: Piece[];
    quizOperation?: Operation;
    isLastPage: boolean;
}

const ENCODE_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeToValue(v: string): number {
    return ENCODE_TABLE.indexOf(v);
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

export class Values {
    private readonly values: number[];

    constructor(data: string) {
        this.values = data.split('').map(decodeToValue);
    }

    poll(max: number): number {
        let value = 0;
        for (let count = 0; count < max; count += 1) {
            const v = this.values.shift();
            if (v === undefined) {
                throw new FumenError('Unexpected');
            }
            value += v * Math.pow(ENCODE_TABLE.length, count);
        }
        return value;
    }

    isEmpty(): boolean {
        return this.values.length === 0;
    }
}

const FIELD_WIDTH = FieldConstants.Width;
const FIELD_TOP = FieldConstants.Height;
const FIELD_BLOCKS = (FIELD_TOP + FieldConstants.Garbage) * FIELD_WIDTH;

export async function decode(data: string, callback: (page: Page) => void | Promise<void>): Promise<void> {
    let pageIndex = 0;
    const values = new Values(data);
    let [prevField, currentField] = [new Field(), new Field()];
    let blockUp = new FieldLine();

    const store: {
        repeatCount: number,
        lastCommentPageIndex: number;
        quiz?: Quiz,
    } = {
        repeatCount: -1,
        lastCommentPageIndex: -1,
        quiz: undefined,
    };

    while (!values.isEmpty()) {
        // Parse field
        if (store.repeatCount <= 0) {
            let index = 0;
            let isChange = false;
            while (index < FieldConstants.Width) {
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
        let comment: string | undefined = undefined;
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

            comment = unescape(flatten.slice(0, commentLength).join(''));
            store.lastCommentPageIndex = pageIndex;

            if (Quiz.verify(comment)) {
                store.quiz = new Quiz(comment);
            } else {
                store.quiz = undefined;
            }
        } else if (store.quiz !== undefined && store.lastCommentPageIndex + 30 <= pageIndex) {
            comment = store.quiz.format().toString();
            store.lastCommentPageIndex = pageIndex;
        } else if (pageIndex === 0) {
            comment = '';
        }

        const page: FumenPage = {
            action,
            comment,
            index: pageIndex,
            field: currentField.toArray(),
            blockUp: blockUp.toArray(),
            commentRef: store.lastCommentPageIndex,
            isLastPage: values.isEmpty(),
        };

        let quizOperation: Operation | undefined = undefined;
        if (store.quiz !== undefined && action.isLock && isMinoPiece(action.piece)) {
            const operation = store.quiz.getOperation(action.piece);
            store.quiz = store.quiz.operate(operation);
            quizOperation = operation;
        }

        if (quizOperation !== undefined) {
            page.quizOperation = quizOperation;
        }

        // 加工
        let piece2;
        if (action.piece !== Piece.Empty) {
            piece2 = {
                Lock: action.isLock,
                Type: action.piece,
                Rotation: action.rotation,
                Coordinate: action.coordinate,
            };
        }

        const com: {
            Text?: string;
            Ref?: number;
        } = {};

        if (action.isComment) {
            com.Text = comment;
        } else {
            com.Ref = store.lastCommentPageIndex;
        }

        await callback({
            Index: pageIndex,
            LastPage: values.isEmpty(),
            Field: currentField,
            SentLine: blockUp,
            Piece: piece2,
            Comment: com,
            Flags: {
                Send: action.isBlockUp,
                Mirrored: action.isMirror,
                Colorize: action.isColor,
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
                blockUp = new FieldLine();
            }

            if (action.isMirror) {
                currentField.mirror();
            }
        }

        prevField = currentField;
    }
}
