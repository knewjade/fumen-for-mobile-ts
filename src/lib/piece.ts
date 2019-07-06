import { FumenError } from './errors';
import { Piece, Rotation } from './enums';

export function getBlockPositions(piece: Piece, rotation: Rotation, x: number, y: number): number[][] {
    return getBlocks(piece, rotation).map((position) => {
        position[0] += x;
        position[1] += y;
        return position;
    });
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
