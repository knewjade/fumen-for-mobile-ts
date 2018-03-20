import { Piece, Rotate } from '../view';

export function decodeToValue(v: string) {
    return ENCODE_TABLE.indexOf(v);
}

function decodeCommentChar(index: number) {
    return COMMENT_TABLE[index];
}

type Field = Piece[];

const ENCODE_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const COMMENT_TABLE =
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

const FIELD_BLOCKS = 240;
const FIELD_WIDTH = 10;
const FIELD_TOP = 23;

function createField(): Field {
    return Array.from({ length: FIELD_BLOCKS }).map(() => Piece.Empty);
}

interface Page {
    field: Field;
    comment: string;
    action: FumenAction;
    blockUp: Field;
}

function isMino(b: Piece) {
    return b !== Piece.Empty && b !== Piece.Gray;
}

export function decode(data: string) {
    const values = data.split('').map(decodeToValue);

    function poll(max: number) {
        let value = 0;
        for (let count = 0; count < max; count += 1) {
            const v = values.shift()!;
            if (v === undefined) {
                throw new MyError();
            }
            value += v * Math.pow(ENCODE_TABLE.length, count);
        }
        console.log(values);
        return value;
    }

    const pages: Page[] = [];
    let prevField: Field = createField();
    let currentField: Field = createField();

    const blockUp: Field = Array.from({ length: FIELD_WIDTH }).map(() => Piece.Empty);
    let repeatCount = -1;
    while (0 < values.length) {
        if (repeatCount <= 0) {
            let index = 0;
            let isChange = false;
            while (index < FIELD_BLOCKS) {
                const diffBlock = poll(2);
                const diff = Math.floor(diffBlock / FIELD_BLOCKS);
                const block = diffBlock % FIELD_BLOCKS;
                if (block !== FIELD_BLOCKS - 1) {
                    isChange = true;
                }

                console.log('#' + block);

                for (let b = 0; b < block + 1; b += 1) {
                    const x = index % 10;
                    const y = FIELD_TOP - Math.floor(index / 10) - 1;
                    if (0 <= y) {
                        const prevBlockNumber = prevField[x + 10 * y];
                        currentField[x + y * 10] = diff + prevBlockNumber - 8;
                    } else {
                        blockUp[x] += diff - 8;
                    }

                    index += 1;
                }
            }
            if (!isChange) {
                repeatCount = poll(1);
            }
        } else {
            currentField = prevField;
            repeatCount -= 1;
        }
        console.log(currentField);

        const actionValue = poll(3);
        const action = getAction(actionValue);

        let comment = '';
        if (action.isComment) {
            const commentValues: number[] = [];
            const commentLength = poll(2);
            for (let commentCounter = 0; commentCounter < (commentLength + 3) / 4; commentCounter += 1) {
                const commentValue = poll(5);
                commentValues.push(commentValue);
            }

            const flatten: number[] = [];
            const max = COMMENT_TABLE.length + 1;
            for (let v of commentValues) {
                for (let count = 0; count < 4; count += 1) {
                    flatten.push(v % max);
                    v = Math.floor(v / max);
                }
            }

            comment = flatten.slice(0, commentLength).map(decodeCommentChar).join('');
        }

        const page = {
            action,
            comment,
            field: currentField.concat(),
            blockUp: blockUp.concat(),
        };
        console.log(page);
        pages.push(page);

        if (action.isLock) {
            if (isMino(action.piece)) {
                currentField = put(currentField, action.piece, action.rotate, action.coordinate);
            }

            currentField = clearLine(currentField);

            if (action.isBlockUp) {
                currentField = up(currentField, blockUp);
            }

            if (action.isMirror) {
                currentField = mirror(currentField);
            }
        }

        prevField = currentField;
    }

    return pages;
}

interface Coordinate {
    x: number;
    y: number;
}

interface FumenAction {
    piece: Piece;
    rotate: Rotate;
    coordinate: Coordinate;
    isBlockUp: boolean;
    isMirror: boolean;
    isColor: boolean;
    isComment: boolean;
    isLock: boolean;
}

function getAction(v: number): FumenAction {
    console.log(`action: ${v}`);

    function parsePiece(n: number) {
        console.log(`piece: ${n}`);

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
        throw new MyError();
    }

    function parseRotate(n: number, piece: Piece) {
        console.log(`rotate: ${n}`);
        switch (n) {
        case 0:
            return Rotate.Reverse;
        case 1:
            return piece !== Piece.I ? Rotate.Right : Rotate.Left;
        case 2:
            return Rotate.Spawn;
        case 3:
            return piece !== Piece.I ? Rotate.Left : Rotate.Right;
        }
        throw new MyError();
    }

    function parseCoordinate(n: number, piece: Piece, rotate: Rotate) {
        let x = n % FIELD_WIDTH;
        const originY = Math.floor(n / 10);
        let y = FIELD_TOP - originY - 1;

        if (piece === Piece.O && rotate === Rotate.Left) {
            x += 1;
            y -= 1;
        } else if (piece === Piece.O && rotate === Rotate.Reverse) {
            x += 1;
        } else if (piece === Piece.O && rotate === Rotate.Spawn) {
            y -= 1;
        } else if (piece === Piece.I && rotate === Rotate.Reverse) {
            x += 1;
        } else if (piece === Piece.I && rotate === Rotate.Left) {
            y -= 1;
        } else if (piece === Piece.S && rotate === Rotate.Spawn) {
            y -= 1;
        } else if (piece === Piece.S && rotate === Rotate.Right) {
            x -= 1;
        } else if (piece === Piece.Z && rotate === Rotate.Spawn) {
            y -= 1;
        } else if (piece === Piece.Z && rotate === Rotate.Left) {
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
    const rotate = parseRotate(value % 4, piece);
    value = Math.floor(value / 4);
    const coordinate = parseCoordinate(value % FIELD_BLOCKS, piece, rotate);
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
        rotate,
        coordinate,
        isBlockUp,
        isMirror,
        isColor,
        isComment,
        isLock,
    };
}

function put(field: Field, piece: Piece, rotate: Rotate, coordinate: Coordinate) {
    const newField = field.concat();
    const blocks = getBlocks(piece, rotate);
    for (const block of blocks) {
        const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
        newField[x + y * FIELD_WIDTH] = piece;
    }
    return newField;
}

function getBlocks(piece: Piece, rotate: Rotate): number[][] {
    const blocks = getPieces(piece);
    switch (rotate) {
    case Rotate.Spawn:
        return blocks;
    case Rotate.Left:
        return rotateLeft(blocks);
    case Rotate.Reverse:
        return rotateReverse(blocks);
    case Rotate.Right:
        return rotateRight(blocks);
    }
    throw new MyError();
}

function getPieces(piece: Piece): number[][] {
    switch (piece) {
    case Piece.I:
        return [[0, 0], [-1, 0], [1, 0], [2, 0]];
    case Piece.T:
        return [[0, 0], [-1, 0], [1, 0], [0, 1]];
    case Piece.O:
        return [[0, 0], [-1, 0], [1, 0], [0, 1]];
    case Piece.L:
        return [[0, 0], [-1, 0], [1, 0], [1, 1]];
    case Piece.J:
        return [[0, 0], [-1, 0], [1, 0], [-1, 1]];
    case Piece.S:
        return [[0, 0], [-1, 0], [0, 1], [1, 1]];
    case Piece.Z:
        return [[0, 0], [1, 0], [0, 1], [-1, 1]];
    }
    throw new MyError();
}

function rotateRight(positions: number[][]): number[][] {
    return positions.concat().map(current => [current[1], -current[0]]);
}

function rotateLeft(positions: number[][]): number[][] {
    return positions.concat().map(current => [-current[1], current[0]]);
}

function rotateReverse(positions: number[][]): number[][] {
    return positions.concat().map(current => [-current[0], -current[1]]);
}

function clearLine(field: Field): Field {
    let newField: Field = field;
    const top = field.length / FIELD_WIDTH - 1;
    for (let y = top; 0 <= y; y -= 1) {
        const line = field.slice(y * FIELD_WIDTH, (y + 1) * FIELD_WIDTH);
        const isFilled = line.every(value => value !== Piece.Empty);
        if (isFilled) {
            const bottom = newField.slice(0, y * FIELD_WIDTH);
            const over = newField.slice((y + 1) * FIELD_WIDTH);
            newField = bottom.concat(over, Array.from({ length: FIELD_WIDTH }));
        }
    }
    return newField;
}

function up(field: Field, blockUp: Field): Field {
    return blockUp.concat(field);
}

function mirror(field: Field): Field {
    let newField: Field = [];
    for (let y = 0; y < field.length; y += 1) {
        const line = field.slice(y * FIELD_WIDTH, (y + 1) * FIELD_WIDTH);
        line.reverse();
        newField = newField.concat(line);
    }
    return newField;
}
