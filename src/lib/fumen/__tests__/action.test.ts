import { Action, decodeAction } from '../action';
import { Piece, Rotation } from '../../enums';
import { Values } from '../values';

describe('action', () => {
    describe('get', () => {
        test('L-Spawn', () => {
            const values = new Values('yOJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.L,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 1,
                        y: 0,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('mirror on', () => {
            const values = new Values('X8M');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.S,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 6,
                        y: 0,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: true,
            } as Action);
        });

        test('piece on top', () => {
            const values = new Values('hgl');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.I,
                    rotation: Rotation.Reverse,
                    coordinate: {
                        x: 2,
                        y: 22,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: false,
                mirror: false,
            } as Action);
        });

        test('color off', () => {
            const values = new Values('zhf');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.O,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 5,
                        y: 2,
                    },
                },
                rise: false,
                colorize: false,
                comment: false,
                lock: false,
                mirror: false,
            } as Action);
        });

        test('no piece', () => {
            const values = new Values('AgH');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.Empty,
                    rotation: Rotation.Reverse,
                    coordinate: {
                        x: 0,
                        y: 22,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('comment on', () => {
            const values = new Values('uJY');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.J,
                    rotation: Rotation.Right,
                    coordinate: {
                        x: 1,
                        y: 1,
                    },
                },
                rise: false,
                colorize: true,
                comment: true,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('block up on', () => {
            const values = new Values('sEa');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.Z,
                    rotation: Rotation.Right,
                    coordinate: {
                        x: 7,
                        y: 1,
                    },
                },
                rise: true,
                colorize: true,
                comment: true,
                lock: true,
                mirror: false,
            } as Action);
        });
    });

    describe('coordinate', () => {
        test('O-Left', () => {
            const values = new Values('bJJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.O,
                    rotation: Rotation.Left,
                    coordinate: {
                        x: 1,
                        y: 0,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('O-Reverse', () => {
            const values = new Values('DJJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.O,
                    rotation: Rotation.Reverse,
                    coordinate: {
                        x: 1,
                        y: 1,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('I-Right', () => {
            const values = new Values('JEJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.I,
                    rotation: Rotation.Right,
                    coordinate: {
                        x: 0,
                        y: 2,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('I-Left', () => {
            const values = new Values('ZEJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.I,
                    rotation: Rotation.Left,
                    coordinate: {
                        x: 0,
                        y: 1,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('S-Right', () => {
            const values = new Values('vJJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.S,
                    rotation: Rotation.Right,
                    coordinate: {
                        x: 0,
                        y: 1,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('Z-Spawn', () => {
            const values = new Values('0JJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.Z,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 1,
                        y: 0,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('Z-Left', () => {
            const values = new Values('cJJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.Z,
                    rotation: Rotation.Left,
                    coordinate: {
                        x: 1,
                        y: 1,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });

        test('T-Spawn', () => {
            const values = new Values('1OJ');
            const action = decodeAction(values.poll(3), 23);
            expect(action).toEqual({
                piece: {
                    type: Piece.T,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 1,
                        y: 0,
                    },
                },
                rise: false,
                colorize: true,
                comment: false,
                lock: true,
                mirror: false,
            } as Action);
        });
    });
});
