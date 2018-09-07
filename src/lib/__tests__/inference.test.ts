import { inferPiece } from '../inference';
import { Piece, Rotation } from '../enums';

describe('Inference', () => {
    describe('O', () => {
        test('Spawn', () => {
            const result = inferPiece([67, 68, 77, 78]);
            expect(result).toEqual({ piece: Piece.O, rotate: Rotation.Spawn, coordinate: { x: 7, y: 6 } });
        });
    });

    describe('I', () => {
        test('Spawn', () => {
            const result = inferPiece([22, 23, 24, 25]);
            expect(result).toEqual({ piece: Piece.I, rotate: Rotation.Spawn, coordinate: { x: 3, y: 2 } });
        });

        test('Right', () => {
            const result = inferPiece([34, 44, 54, 64]);
            expect(result).toEqual({ piece: Piece.I, rotate: Rotation.Right, coordinate: { x: 4, y: 5 } });
        });
    });

    describe('T', () => {
        test('Spawn', () => {
            const result = inferPiece([45, 46, 47, 56]);
            expect(result).toEqual({ piece: Piece.T, rotate: Rotation.Spawn, coordinate: { x: 6, y: 4 } });
        });

        test('Reverse', () => {
            const result = inferPiece([36, 45, 46, 47]);
            expect(result).toEqual({ piece: Piece.T, rotate: Rotation.Reverse, coordinate: { x: 6, y: 4 } });
        });

        test('Right', () => {
            const result = inferPiece([111, 121, 131, 122]);
            expect(result).toEqual({ piece: Piece.T, rotate: Rotation.Right, coordinate: { x: 1, y: 12 } });
        });

        test('Left', () => {
            const result = inferPiece([189, 198, 199, 209]);
            expect(result).toEqual({ piece: Piece.T, rotate: Rotation.Left, coordinate: { x: 9, y: 19 } });
        });
    });

    describe('S', () => {
        test('Spawn', () => {
            const result = inferPiece([31, 32, 42, 43]);
            expect(result).toEqual({ piece: Piece.S, rotate: Rotation.Spawn, coordinate: { x: 2, y: 3 } });
        });

        test('Right', () => {
            const result = inferPiece([77, 86, 87, 96]);
            expect(result).toEqual({ piece: Piece.S, rotate: Rotation.Right, coordinate: { x: 6, y: 8 } });
        });
    });

    describe('Z', () => {
        test('Spawn', () => {
            const result = inferPiece([73, 74, 64, 65]);
            expect(result).toEqual({ piece: Piece.Z, rotate: Rotation.Spawn, coordinate: { x: 4, y: 6 } });
        });

        test('Right', () => {
            const result = inferPiece([101, 111, 112, 122]);
            expect(result).toEqual({ piece: Piece.Z, rotate: Rotation.Right, coordinate: { x: 1, y: 11 } });
        });
    });

    describe('L', () => {
        test('Spawn', () => {
            const result = inferPiece([147, 148, 149, 159]);
            expect(result).toEqual({ piece: Piece.L, rotate: Rotation.Spawn, coordinate: { x: 8, y: 14 } });
        });

        test('Reverse', () => {
            const result = inferPiece([190, 200, 201, 202]);
            expect(result).toEqual({ piece: Piece.L, rotate: Rotation.Reverse, coordinate: { x: 1, y: 20 } });
        });

        test('Right', () => {
            const result = inferPiece([72, 73, 82, 92]);
            expect(result).toEqual({ piece: Piece.L, rotate: Rotation.Right, coordinate: { x: 2, y: 8 } });
        });

        test('Left', () => {
            const result = inferPiece([23, 33, 43, 42]);
            expect(result).toEqual({ piece: Piece.L, rotate: Rotation.Left, coordinate: { x: 3, y: 3 } });
        });
    });

    describe('J', () => {
        test('Spawn', () => {
            const result = inferPiece([82, 83, 84, 92]);
            expect(result).toEqual({ piece: Piece.J, rotate: Rotation.Spawn, coordinate: { x: 3, y: 8 } });
        });

        test('Reverse', () => {
            const result = inferPiece([21, 22, 23, 13]);
            expect(result).toEqual({ piece: Piece.J, rotate: Rotation.Reverse, coordinate: { x: 2, y: 2 } });
        });

        test('Right', () => {
            const result = inferPiece([88, 98, 108, 109]);
            expect(result).toEqual({ piece: Piece.J, rotate: Rotation.Right, coordinate: { x: 8, y: 9 } });
        });

        test('Left', () => {
            const result = inferPiece([8, 9, 19, 29]);
            expect(result).toEqual({ piece: Piece.J, rotate: Rotation.Left, coordinate: { x: 9, y: 1 } });
        });
    });
});
