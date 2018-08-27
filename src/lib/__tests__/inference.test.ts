import { inferPiece } from '../inference';
import { Piece, Rotation } from '../enums';

describe('Inference', () => {
    describe('O', () => {
        test('Reverse', () => {
            const result = inferPiece([67, 68, 77, 78]);
            expect(result).toEqual({ piece: Piece.O, rotate: Rotation.Reverse });
        });
    });

    describe('I', () => {
        test('Reverse', () => {
            const result = inferPiece([22, 23, 24, 25]);
            expect(result).toEqual({ piece: Piece.I, rotate: Rotation.Reverse });
        });

        test('Right', () => {
            const result = inferPiece([34, 44, 54, 64]);
            expect(result).toEqual({ piece: Piece.I, rotate: Rotation.Right });
        });
    });

    describe('T', () => {
        test('Spawn', () => {
            const result = inferPiece([45, 46, 47, 56]);
            expect(result).toEqual({ piece: Piece.T, rotate: Rotation.Spawn });
        });

        test('Reverse', () => {
            const result = inferPiece([36, 45, 46, 47]);
            expect(result).toEqual({ piece: Piece.T, rotate: Rotation.Reverse });
        });

        test('Right', () => {
            const result = inferPiece([111, 121, 131, 122]);
            expect(result).toEqual({ piece: Piece.T, rotate: Rotation.Right });
        });

        test('Left', () => {
            const result = inferPiece([189, 198, 199, 209]);
            expect(result).toEqual({ piece: Piece.T, rotate: Rotation.Left });
        });
    });

    describe('S', () => {
        test('Reverse', () => {
            const result = inferPiece([31, 32, 42, 43]);
            expect(result).toEqual({ piece: Piece.S, rotate: Rotation.Reverse });
        });

        test('Right', () => {
            const result = inferPiece([77, 86, 87, 96]);
            expect(result).toEqual({ piece: Piece.S, rotate: Rotation.Right });
        });
    });

    describe('Z', () => {
        test('Reverse', () => {
            const result = inferPiece([73, 74, 64, 65]);
            expect(result).toEqual({ piece: Piece.Z, rotate: Rotation.Reverse });
        });

        test('Right', () => {
            const result = inferPiece([101, 111, 112, 122]);
            expect(result).toEqual({ piece: Piece.Z, rotate: Rotation.Right });
        });
    });

    describe('L', () => {
        test('Spawn', () => {
            const result = inferPiece([147, 148, 149, 159]);
            expect(result).toEqual({ piece: Piece.L, rotate: Rotation.Spawn });
        });

        test('Reverse', () => {
            const result = inferPiece([190, 200, 201, 202]);
            expect(result).toEqual({ piece: Piece.L, rotate: Rotation.Reverse });
        });

        test('Right', () => {
            const result = inferPiece([72, 73, 82, 92]);
            expect(result).toEqual({ piece: Piece.L, rotate: Rotation.Right });
        });

        test('Left', () => {
            const result = inferPiece([23, 33, 43, 42]);
            expect(result).toEqual({ piece: Piece.L, rotate: Rotation.Left });
        });
    });

    describe('J', () => {
        test('Spawn', () => {
            const result = inferPiece([82, 83, 84, 92]);
            expect(result).toEqual({ piece: Piece.J, rotate: Rotation.Spawn });
        });

        test('Reverse', () => {
            const result = inferPiece([21, 22, 23, 13]);
            expect(result).toEqual({ piece: Piece.J, rotate: Rotation.Reverse });
        });

        test('Right', () => {
            const result = inferPiece([88, 98, 108, 109]);
            expect(result).toEqual({ piece: Piece.J, rotate: Rotation.Right });
        });

        test('Left', () => {
            const result = inferPiece([8, 9, 19, 29]);
            expect(result).toEqual({ piece: Piece.J, rotate: Rotation.Left });
        });
    });
});
