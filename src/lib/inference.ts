import { Piece, Rotation } from './enums';
import { FumenError } from './errors';

const results = [
    { positions: [0, 1, 10, 11], result: { piece: Piece.O, rotate: Rotation.Reverse } },
    { positions: [0, 1, 2, 3], result: { piece: Piece.I, rotate: Rotation.Reverse } },
    { positions: [0, 10, 20, 30], result: { piece: Piece.I, rotate: Rotation.Right } },
    { positions: [0, 1, 2, 11], result: { piece: Piece.T, rotate: Rotation.Spawn } },
    { positions: [0, 9, 10, 11], result: { piece: Piece.T, rotate: Rotation.Reverse } },
    { positions: [0, 10, 11, 20], result: { piece: Piece.T, rotate: Rotation.Right } },
    { positions: [0, 9, 10, 20], result: { piece: Piece.T, rotate: Rotation.Left } },
    { positions: [0, 1, 11, 12], result: { piece: Piece.S, rotate: Rotation.Reverse } },
    { positions: [0, 9, 10, 19], result: { piece: Piece.S, rotate: Rotation.Right } },
    { positions: [0, 1, 9, 10], result: { piece: Piece.Z, rotate: Rotation.Reverse } },
    { positions: [0, 10, 11, 21], result: { piece: Piece.Z, rotate: Rotation.Right } },
    { positions: [0, 1, 2, 12], result: { piece: Piece.L, rotate: Rotation.Spawn } },
    { positions: [0, 10, 11, 12], result: { piece: Piece.L, rotate: Rotation.Reverse } },
    { positions: [0, 1, 10, 20], result: { piece: Piece.L, rotate: Rotation.Right } },
    { positions: [0, 10, 19, 20], result: { piece: Piece.L, rotate: Rotation.Left } },
    { positions: [0, 1, 2, 10], result: { piece: Piece.J, rotate: Rotation.Spawn } },
    { positions: [0, 8, 9, 10], result: { piece: Piece.J, rotate: Rotation.Reverse } },
    { positions: [0, 10, 20, 21], result: { piece: Piece.J, rotate: Rotation.Right } },
    { positions: [0, 1, 11, 21], result: { piece: Piece.J, rotate: Rotation.Left } },
];

const toKey = (positions: number[]) => {
    let lastY = 0;
    let key = '';
    for (const position of positions) {
        const y = Math.floor(position / 10);
        if (lastY + 1 < y) {
            return '';
        }
        lastY = y;
        key += `${position},`;
    }
    return key;
};

const maps = new Map<string, { piece: Piece, rotate: Rotation }>();
for (const result of results) {
    const key = toKey(result.positions);
    maps.set(key, result.result);
}

export const inferPiece = (inferences: number[]) => {
    if (inferences.length !== 4) {
        throw new FumenError('No enough blocks');
    }

    const sorted = inferences.sort((a, b) => a - b);
    const diff = sorted.map(e => e - sorted[0]);

    const result = maps.get(toKey(diff));
    if (result !== undefined) {
        return result;
    }

    throw new FumenError('Unknown piece');
};
