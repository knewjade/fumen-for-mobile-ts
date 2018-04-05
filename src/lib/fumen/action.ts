import { FieldConstants, Piece, Rotation } from '../enums';
import { FumenError } from '../errors';

const FIELD_WIDTH = FieldConstants.Width;
const FIELD_TOP = FieldConstants.Height;
const FIELD_BLOCKS = (FIELD_TOP + FieldConstants.Garbage) * FIELD_WIDTH;

export interface Action {
    piece: Piece;
    rotation: Rotation;
    coordinate: {
        x: number,
        y: number,
    };
    isBlockUp: boolean;
    isMirror: boolean;
    isColor: boolean;
    isComment: boolean;
    isLock: boolean;
}

export function getAction(v: number): Action {
    let value = v;
    const piece = parsePiece(value % 8);
    value = Math.floor(value / 8);
    const rotation = parseRotation(value % 4);
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

function parseRotation(n: number) {
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
