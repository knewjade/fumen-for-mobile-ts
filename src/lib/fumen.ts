import { getBlocks, isMinoPiece, parsePieceName, Piece, Rotation } from './enums';
import { FumenError } from './errors';
import { Quiz } from './quiz';

export interface Page {
    index: number;
    action: Action;
    comment?: string;
    commentRef: number;
    field: Piece[];
    blockUp: Piece[];
    quizOperation?: Operation;
    isLastPage: boolean;
}

interface Action {
    piece: Piece;
    rotation: Rotation;
    coordinate: Coordinate;
    isBlockUp: boolean;
    isMirror: boolean;
    isColor: boolean;
    isComment: boolean;
    isLock: boolean;
}

interface Coordinate {
    x: number;
    y: number;
}

export enum Operation {
    Direct = 'direct',
    Swap = 'swap',
    Stock = 'stock',
}

const FIELD_BLOCKS = 240;
const FIELD_WIDTH = 10;
const FIELD_TOP = 23;

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
        array.push(COMMENT_TABLE[value % MAX_COMMENT_CHAR_VALUE]);
        value = Math.floor(value / MAX_COMMENT_CHAR_VALUE);
    }
    return array;
}

class Values {
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

class Field {
    private pieces: Piece[];

    constructor(num: number = FIELD_BLOCKS) {
        this.pieces = Array.from({ length: num }).map(() => Piece.Empty);
    }

    get(x: number, y: number): Piece {
        return this.pieces[x + y * FIELD_WIDTH];
    }

    add(x: number, y: number, value: number) {
        this.pieces[x + y * FIELD_WIDTH] += value;
    }

    put(piece: Piece, rotation: Rotation, coordinate: Coordinate) {
        const blocks = getBlocks(piece, rotation);
        for (const block of blocks) {
            const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
            this.pieces[x + y * FIELD_WIDTH] = piece;
        }
    }

    clearLine() {
        let newField = this.pieces.concat();
        const top = this.pieces.length / FIELD_WIDTH - 1;
        for (let y = top; 0 <= y; y -= 1) {
            const line = this.pieces.slice(y * FIELD_WIDTH, (y + 1) * FIELD_WIDTH);
            const isFilled = line.every(value => value !== Piece.Empty);
            if (isFilled) {
                const bottom = newField.slice(0, y * FIELD_WIDTH);
                const over = newField.slice((y + 1) * FIELD_WIDTH);
                newField = bottom.concat(over, Array.from({ length: FIELD_WIDTH }).map(() => Piece.Empty));
            }
        }
        this.pieces = newField;
    }

    up(blockUp: Field) {
        this.pieces = blockUp.pieces.concat(this.pieces);
    }

    mirror() {
        const newField: Piece[] = [];
        for (let y = 0; y < this.pieces.length; y += 1) {
            const line = this.pieces.slice(y * FIELD_WIDTH, (y + 1) * FIELD_WIDTH);
            line.reverse();
            for (const obj of line) {
                newField.push(obj);
            }
        }
        this.pieces = newField;
    }

    toArray(): Piece[] {
        return this.pieces.concat();
    }
}

class FieldLine {
    private field: Field;

    constructor() {
        this.field = new Field(FIELD_WIDTH);
    }

    add(x: number, value: number) {
        this.field.add(x, 0, value);
    }

    toShallowField() {
        return this.field;
    }

    toArray(): Piece[] {
        return this.field.toArray();
    }
}

export function decode(data: string, callback: (page: Page) => void) {
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
        lastCommentPageIndex: 0,
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
        let comment = undefined;
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

            if (comment.startsWith('#Q=')) {
                store.quiz = new Quiz(comment);
            } else {
                store.quiz = undefined;
            }
        } else if (store.quiz !== undefined && store.lastCommentPageIndex + 30 <= pageIndex) {
            comment = store.quiz.toStr();
            store.lastCommentPageIndex = pageIndex;
        } else if (pageIndex === 0) {
            comment = '';
            store.lastCommentPageIndex = pageIndex;
        }

        const page: Page = {
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

        callback(page);

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

function getAction(v: number): Action {
    function parsePiece(n: number) {
        switch (n) {
        case 0:
            return Piece.Empty;
        case 1:
            return Piece.I;
        case 2:
            return Piece.L;
        case 3:
            return Piece.O;
        case 4:
            return Piece.Z;
        case 5:
            return Piece.T;
        case 6:
            return Piece.J;
        case 7:
            return Piece.S;
        case 8:
            return Piece.Gray;
        }
        throw new FumenError('Unexpected piece');
    }

    function parseRotation(n: number, piece: Piece) {
        switch (n) {
        case 0:
            return Rotation.Reverse;
        case 1:
            return piece !== Piece.I ? Rotation.Right : Rotation.Left;
        case 2:
            return Rotation.Spawn;
        case 3:
            return piece !== Piece.I ? Rotation.Left : Rotation.Right;
        }
        throw new FumenError('Unexpected rotation');
    }

    function parseCoordinate(n: number, piece: Piece, rotation: Rotation) {
        let x = n % FIELD_WIDTH;
        const originY = Math.floor(n / 10);
        let y = FIELD_TOP - originY - 1;

        if (piece === Piece.O && rotation === Rotation.Left) {
            x += 1;
            y -= 1;
        } else if (piece === Piece.O && rotation === Rotation.Reverse) {
            x += 1;
        } else if (piece === Piece.O && rotation === Rotation.Spawn) {
            y -= 1;
        } else if (piece === Piece.I && rotation === Rotation.Reverse) {
            x += 1;
        } else if (piece === Piece.I && rotation === Rotation.Left) {
            y -= 1;
        } else if (piece === Piece.S && rotation === Rotation.Spawn) {
            y -= 1;
        } else if (piece === Piece.S && rotation === Rotation.Right) {
            x -= 1;
        } else if (piece === Piece.Z && rotation === Rotation.Spawn) {
            y -= 1;
        } else if (piece === Piece.Z && rotation === Rotation.Left) {
            x += 1;
        }

        return { x, y };
    }

    function parseBool(n: number) {
        return n !== 0;
    }

    let value = v;
    const piece = parsePiece(value % 8);
    value = Math.floor(value / 8);
    const rotation = parseRotation(value % 4, piece);
    value = Math.floor(value / 4);
    const coordinate = parseCoordinate(value % FIELD_BLOCKS, piece, rotation);
    value = Math.floor(value / FIELD_BLOCKS);
    const isBlockUp = parseBool(value % 2);
    value = Math.floor(value / 2);
    const isMirror = parseBool(value % 2);
    value = Math.floor(value / 2);
    const isColor = parseBool(value % 2);
    value = Math.floor(value / 2);
    const isComment = parseBool(value % 2);
    value = Math.floor(value / 2);
    const isLock = !parseBool(value % 2);

    return {
        piece,
        rotation,
        coordinate,
        isBlockUp,
        isMirror,
        isColor,
        isComment,
        isLock,
    };
}

const get = (value?: string) => {
    if (value === undefined || value === ']' || value === ')') {
        throw new FumenError('Unexpected value in quiz');
    }
    return value;
};
