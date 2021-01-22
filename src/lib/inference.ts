import { Piece, Rotation } from './enums';

const results = [
    { positions: [0, 1, 10, 11], result: { piece: Piece.O, rotate: Rotation.Spawn, offset: { x: 0, y: 0 } } },
    { positions: [0, 1, 2, 3], result: { piece: Piece.I, rotate: Rotation.Spawn, offset: { x: 1, y: 0 } } },
    { positions: [0, 10, 20, 30], result: { piece: Piece.I, rotate: Rotation.Right, offset: { x: 0, y: 2 } } },
    { positions: [0, 1, 2, 11], result: { piece: Piece.T, rotate: Rotation.Spawn, offset: { x: 1, y: 0 } } },
    { positions: [0, 9, 10, 11], result: { piece: Piece.T, rotate: Rotation.Reverse, offset: { x: 0, y: 1 } } },
    { positions: [0, 10, 11, 20], result: { piece: Piece.T, rotate: Rotation.Right, offset: { x: 0, y: 1 } } },
    { positions: [0, 9, 10, 20], result: { piece: Piece.T, rotate: Rotation.Left, offset: { x: 0, y: 1 } } },
    { positions: [0, 1, 11, 12], result: { piece: Piece.S, rotate: Rotation.Spawn, offset: { x: 1, y: 0 } } },
    { positions: [0, 9, 10, 19], result: { piece: Piece.S, rotate: Rotation.Right, offset: { x: -1, y: 1 } } },
    { positions: [0, 1, 9, 10], result: { piece: Piece.Z, rotate: Rotation.Spawn, offset: { x: 0, y: 0 } } },
    { positions: [0, 10, 11, 21], result: { piece: Piece.Z, rotate: Rotation.Right, offset: { x: 0, y: 1 } } },
    { positions: [0, 1, 2, 12], result: { piece: Piece.L, rotate: Rotation.Spawn, offset: { x: 1, y: 0 } } },
    { positions: [0, 10, 11, 12], result: { piece: Piece.L, rotate: Rotation.Reverse, offset: { x: 1, y: 1 } } },
    { positions: [0, 1, 10, 20], result: { piece: Piece.L, rotate: Rotation.Right, offset: { x: 0, y: 1 } } },
    { positions: [0, 10, 19, 20], result: { piece: Piece.L, rotate: Rotation.Left, offset: { x: 0, y: 1 } } },
    { positions: [0, 1, 2, 10], result: { piece: Piece.J, rotate: Rotation.Spawn, offset: { x: 1, y: 0 } } },
    { positions: [0, 8, 9, 10], result: { piece: Piece.J, rotate: Rotation.Reverse, offset: { x: -1, y: 1 } } },
    { positions: [0, 10, 20, 21], result: { piece: Piece.J, rotate: Rotation.Right, offset: { x: 0, y: 1 } } },
    { positions: [0, 1, 11, 21], result: { piece: Piece.J, rotate: Rotation.Left, offset: { x: 1, y: 1 } } },
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

const maps = new Map<string, { piece: Piece, rotate: Rotation, offset: { x: number, y: number } }>();
for (const result of results) {
    const key = toKey(result.positions);
    maps.set(key, result.result);
}

const byAscending: (a: number, b: number) => number = (a, b) => a - b;

// 4つのブロックからミノを予測します
// 完全なミノの形をしているときは、座標も含めて返却します
export const inferPiece = (inferences: number[]) => {
    if (inferences.length !== 4) {
        return undefined;
    }

    const setY = new Set<Number>();
    inferences.forEach(value => setY.add(Math.floor(value / 10)));
    const ysByAscending = Array.from(setY.keys()).map(Number).sort(byAscending);

    const ysObj: { [y: string]: number } = {};
    ysByAscending.forEach((y, index) => {
        ysObj[`${y}`] = index;
    });

    const sortedIndices = inferences.sort(byAscending);

    const transformed = sortedIndices
        .map((value) => {
            const x = value % 10;
            const y = Math.floor(value / 10);
            return ysObj[`${y}`] * 10 + x;
        });

    let split = false;
    for (let index = 1; index < ysByAscending.length; index += 1) {
        if (1 < ysByAscending[index] - ysByAscending[index - 1]) {
            split = true;
            break;
        }
    }

    const minValue = transformed[0];
    const diff = transformed.map(e => e - minValue);

    const result = maps.get(toKey(diff));
    if (!result) {
        return undefined;
    }

    const minIndex = sortedIndices[0];
    const x = minIndex % 10;
    const y = Math.floor(minIndex / 10);
    return {
        piece: result.piece,
        rotate: result.rotate,
        coordinate: split ? undefined : {
            x: x + result.offset.x,
            y: y + result.offset.y,
        },
    };
};
