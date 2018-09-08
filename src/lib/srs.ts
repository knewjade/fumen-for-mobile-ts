import { nextRotationToLeft, nextRotationToRight, Piece, Rotation } from './enums';

const i = {
    [Rotation.Spawn]: [[0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0]],
    [Rotation.Right]: [[-1, 0], [0, 0], [0, 0], [0, 1], [0, -2]],
    [Rotation.Reverse]: [[-1, 1], [1, 1], [-2, 1], [1, 0], [-2, 0]],
    [Rotation.Left]: [[0, 1], [0, 1], [0, 1], [0, -1], [0, 2]],
};

const o = {
    [Rotation.Spawn]: [[0, 0]],
    [Rotation.Right]: [[0, -1]],
    [Rotation.Reverse]: [[-1, -1]],
    [Rotation.Left]: [[-1, 0]],
};

const other = {
    [Rotation.Spawn]: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [Rotation.Right]: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    [Rotation.Reverse]: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [Rotation.Left]: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
};

const getOffset = (piece: Piece): { [rotation in Rotation]: number[][] } => {
    switch (piece) {
    case Piece.I:
        return i;
    case Piece.O:
        return o;
    default:
        return other;
    }
};

export const testLeftRotation = (piece: Piece, currentRotation: Rotation) => {
    const offset = getOffset(piece);
    const current: number[][] = offset[currentRotation];
    const nextRotation = nextRotationToLeft(currentRotation);
    const next: number[][] = offset[nextRotation];

    const test = [];
    for (let i = 0; i < current.length; i += 1) {
        test.push([current[i][0] - next[i][0], current[i][1] - next[i][1]]);
    }

    return { test, rotation: nextRotation };
};

export const testRightRotation = (piece: Piece, currentRotation: Rotation) => {
    const offset = getOffset(piece);
    const current: number[][] = offset[currentRotation];
    const nextRotation = nextRotationToRight(currentRotation);
    const next: number[][] = offset[nextRotation];

    const test = [];
    for (let i = 0; i < current.length; i += 1) {
        test.push([current[i][0] - next[i][0], current[i][1] - next[i][1]]);
    }

    return { test, rotation: nextRotation };
};
