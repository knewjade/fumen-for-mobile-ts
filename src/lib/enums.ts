import { FumenError } from './errors';

export enum Piece {
    Empty = 0,
    I = 1,
    L = 2,
    O = 3,
    Z = 4,
    T = 5,
    J = 6,
    S = 7,
    Gray = 8,
}

export enum Rotation {
    Spawn = 0,
    Right = 1,
    Reverse = 2,
    Left = 3,
}

export enum AnimationState {
    Pause = 'pause',
    Play = 'play',
}

export enum Operation {
    Direct = 'direct',
    Swap = 'swap',
    Stock = 'stock',
}

export enum Action {
    Block = 'block',
}

export enum FieldConstants {
    Width = 10,
    Height = 23,
    SentLine = 1,
}

export enum Screens {
    Reader = 'Reader',
    Editor = 'Editor',
}

export enum ModeTypes {
    Drawing = 'Drawing',
    Piece = 'Piece',
    DrawingTool = 'DrawingTool',
    Flags = 'Flags',
}

export enum TouchTypes {
    Drawing = 'Drawing',
}

export function parsePieceName(piece: Piece) {
    switch (piece) {
    case Piece.I:
        return 'I';
    case Piece.L:
        return 'L';
    case Piece.O:
        return 'O';
    case Piece.Z:
        return 'Z';
    case Piece.T:
        return 'T';
    case Piece.J:
        return 'J';
    case Piece.S:
        return 'S';
    case Piece.Gray:
        return 'Gray';
    case Piece.Empty:
        return 'Empty';
    }
    throw new FumenError('Unexpected piece');
}

export function parsePiece(piece: string) {
    switch (piece.toUpperCase()) {
    case 'I':
        return Piece.I;
    case 'L':
        return Piece.L;
    case 'O':
        return Piece.O;
    case 'Z':
        return Piece.Z;
    case 'T':
        return Piece.T;
    case 'J':
        return Piece.J;
    case 'S':
        return Piece.S;
    case 'X':
        return Piece.Gray;
    case ' ':
    case '_':
        return Piece.Empty;
    }
    throw new FumenError('Unexpected piece: ' + piece);
}

export function isMinoPiece(b: Piece) {
    return b !== Piece.Empty && b !== Piece.Gray;
}

export function getBlocks(piece: Piece, rotation: Rotation): number[][] {
    const blocks = getPieces(piece);
    switch (rotation) {
    case Rotation.Spawn:
        return blocks;
    case Rotation.Left:
        return rotateLeft(blocks);
    case Rotation.Reverse:
        return rotateReverse(blocks);
    case Rotation.Right:
        return rotateRight(blocks);
    }
    throw new FumenError('Unsupported block');
}

export function getPieces(piece: Piece): number[][] {
    switch (piece) {
    case Piece.I:
        return [[0, 0], [-1, 0], [1, 0], [2, 0]];
    case Piece.T:
        return [[0, 0], [-1, 0], [1, 0], [0, 1]];
    case Piece.O:
        return [[0, 0], [1, 0], [0, 1], [1, 1]];
    case Piece.L:
        return [[0, 0], [-1, 0], [1, 0], [1, 1]];
    case Piece.J:
        return [[0, 0], [-1, 0], [1, 0], [-1, 1]];
    case Piece.S:
        return [[0, 0], [-1, 0], [0, 1], [1, 1]];
    case Piece.Z:
        return [[0, 0], [1, 0], [0, 1], [-1, 1]];
    }
    throw new FumenError('Unsupported rotation');
}

function rotateRight(positions: number[][]): number[][] {
    return positions.map(current => [current[1], -current[0]]);
}

function rotateLeft(positions: number[][]): number[][] {
    return positions.map(current => [-current[1], current[0]]);
}

function rotateReverse(positions: number[][]): number[][] {
    return positions.map(current => [-current[0], -current[1]]);
}
