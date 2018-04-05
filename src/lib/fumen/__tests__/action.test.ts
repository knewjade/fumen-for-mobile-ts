import { Action, getAction } from '../action';
import { Piece, Rotation } from '../../enums';
import { Values } from '../fumen';

describe('action', () => {
    describe('get', () => {
        test('L-Spawn', () => {
            const values = new Values('yOJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 1,
                    y: 0,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.L,
                rotation: Rotation.Spawn,
            } as Action);
        });

        test('mirror on', () => {
            const values = new Values('X8M');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 6,
                    y: 0,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: true,
                piece: Piece.S,
                rotation: Rotation.Spawn,
            } as Action);
        });

        test('piece on top', () => {
            const values = new Values('hgl');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 2,
                    y: 22,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: false,
                isMirror: false,
                piece: Piece.I,
                rotation: Rotation.Reverse,
            } as Action);
        });

        test('color off', () => {
            const values = new Values('zhf');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 5,
                    y: 2,
                },
                isBlockUp: false,
                isColor: false,
                isComment: false,
                isLock: false,
                isMirror: false,
                piece: Piece.O,
                rotation: Rotation.Spawn,
            } as Action);
        });

        test('no piece', () => {
            const values = new Values('AgH');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 0,
                    y: 22,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.Empty,
                rotation: Rotation.Reverse,
            } as Action);
        });

        test('comment on', () => {
            const values = new Values('uJY');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 1,
                    y: 1,
                },
                isBlockUp: false,
                isColor: true,
                isComment: true,
                isLock: true,
                isMirror: false,
                piece: Piece.J,
                rotation: Rotation.Right,
            } as Action);
        });

        test('block up on', () => {
            const values = new Values('sEa');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 7,
                    y: 1,
                },
                isBlockUp: true,
                isColor: true,
                isComment: true,
                isLock: true,
                isMirror: false,
                piece: Piece.Z,
                rotation: Rotation.Right,
            } as Action);
        });
    });

    describe('coordinate', () => {
        test('O-Left', () => {
            const values = new Values('bJJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 1,
                    y: 0,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.O,
                rotation: Rotation.Left,
            } as Action);
        });

        test('O-Reverse', () => {
            const values = new Values('DJJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 1,
                    y: 1,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.O,
                rotation: Rotation.Reverse,
            } as Action);
        });

        test('I-Right', () => {
            const values = new Values('JEJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 0,
                    y: 2,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.I,
                rotation: Rotation.Right,
            } as Action);
        });

        test('I-Left', () => {
            const values = new Values('ZEJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 0,
                    y: 1,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.I,
                rotation: Rotation.Left,
            } as Action);
        });

        test('S-Right', () => {
            const values = new Values('vJJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 0,
                    y: 1,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.S,
                rotation: Rotation.Right,
            } as Action);
        });

        test('Z-Spawn', () => {
            const values = new Values('0JJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 1,
                    y: 0,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.Z,
                rotation: Rotation.Spawn,
            } as Action);
        });

        test('Z-Left', () => {
            const values = new Values('cJJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 1,
                    y: 1,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.Z,
                rotation: Rotation.Left,
            } as Action);
        });

        test('T-Spawn', () => {
            const values = new Values('1OJ');
            const action = getAction(values.poll(3));
            expect(action).toEqual({
                coordinate: {
                    x: 1,
                    y: 0,
                },
                isBlockUp: false,
                isColor: true,
                isComment: false,
                isLock: true,
                isMirror: false,
                piece: Piece.T,
                rotation: Rotation.Spawn,
            } as Action);
        });
    });
});
