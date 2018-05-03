import { FieldConstants, isMinoPiece, Piece, Rotation } from '../enums';
import { FumenError } from '../errors';

const FIELD_WIDTH = FieldConstants.Width;
const FIELD_TOP = FieldConstants.Height;
const FIELD_BLOCKS = (FIELD_TOP + FieldConstants.SentLine) * FIELD_WIDTH;

export interface Action {
    piece: {
        type: Piece;
        rotation: Rotation;
        coordinate: {
            x: number,
            y: number,
        };
    };
    isBlockUp: boolean;
    isMirror: boolean;
    isColor: boolean;
    isComment: boolean;
    isLock: boolean;
}

export function decodeAction(v: number): Action {
    let value = v;
    const type = decodePiece(value % 8);
    value = Math.floor(value / 8);
    const rotation = decodeRotation(value % 4);
    value = Math.floor(value / 4);
    const coordinate = decodeCoordinate(value % FIELD_BLOCKS, type, rotation);
    value = Math.floor(value / FIELD_BLOCKS);
    const isBlockUp = decodeBool(value % 2);
    value = Math.floor(value / 2);
    const isMirror = decodeBool(value % 2);
    value = Math.floor(value / 2);
    const isColor = decodeBool(value % 2);
    value = Math.floor(value / 2);
    const isComment = decodeBool(value % 2);
    value = Math.floor(value / 2);
    const isLock = !decodeBool(value % 2);

    return {
        isBlockUp,
        isMirror,
        isColor,
        isComment,
        isLock,
        piece: {
            type,
            rotation,
            coordinate,
        },
    };
}

function decodePiece(n: number) {
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

function decodeRotation(n: number) {
    switch (n) {
    case 0:
        return Rotation.Reverse;
    case 1:
        return Rotation.Right;
    case 2:
        return Rotation.Spawn;
    case 3:
        return Rotation.Left;
    }
    throw new FumenError('Unexpected rotation');
}

function decodeCoordinate(n: number, piece: Piece, rotation: Rotation) {
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

function decodeBool(n: number) {
    return n !== 0;
}

export function encodeAction(action: Action): number {
    const { isLock, isComment, isColor, isMirror, isBlockUp, piece } = action;

    let value = encodeBool(!isLock);
    value *= 2;
    value += encodeBool(isComment);
    value *= 2;
    value += (encodeBool(isColor));
    value *= 2;
    value += encodeBool(isMirror);
    value *= 2;
    value += encodeBool(isBlockUp);
    value *= FIELD_BLOCKS;
    value += encodePosition(piece);
    value *= 4;
    value += encodeRotation(piece);
    value *= 8;
    value += piece.type;

    return value;
}

function encodeBool(flag: boolean): number {
    return flag ? 1 : 0;
}

function encodePosition(
    { coordinate, type, rotation }: { coordinate: { x: number, y: number }, type: Piece, rotation: Rotation },
): number {
    let { x, y } = coordinate;

    if (!isMinoPiece(type)) {
        x = 0;
        y = 22;
    } else if (type === Piece.O && rotation === Rotation.Left) {
        x -= 1;
        y += 1;
    } else if (type === Piece.O && rotation === Rotation.Reverse) {
        x -= 1;
    } else if (type === Piece.O && rotation === Rotation.Spawn) {
        y += 1;
    } else if (type === Piece.I && rotation === Rotation.Reverse) {
        x -= 1;
    } else if (type === Piece.I && rotation === Rotation.Left) {
        y += 1;
    } else if (type === Piece.S && rotation === Rotation.Spawn) {
        y += 1;
    } else if (type === Piece.S && rotation === Rotation.Right) {
        x += 1;
    } else if (type === Piece.Z && rotation === Rotation.Spawn) {
        y += 1;
    } else if (type === Piece.Z && rotation === Rotation.Left) {
        x -= 1;
    }

    return (FIELD_TOP - y - 1) * FIELD_WIDTH + x;
}

function encodeRotation({ type, rotation }: { type: Piece, rotation: Rotation }): number {
    if (!isMinoPiece(type)) {
        return 0;
    }

    switch (rotation) {
    case Rotation.Reverse:
        return 0;
    case Rotation.Right:
        return 1;
    case Rotation.Spawn:
        return 2;
    case Rotation.Left:
        return 3;
    }

    throw new FumenError('No reachable');
}
