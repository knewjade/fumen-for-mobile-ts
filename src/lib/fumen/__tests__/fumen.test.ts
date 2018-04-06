import { decode, Page } from '../fumen';
import { Field, FieldLine } from '../field';
import { Operation, Piece, Rotation } from '../../enums';
import { FumenError } from '../../errors';

describe('fumen', () => {
    describe('decode', () => {
        test('empty', async () => {
            const pages: Page[] = [];
            await decode('vhAAgH', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                index: 0,
                lastPage: true,
                piece: undefined,
                comment: {
                    ref: -1,
                },
                quiz: undefined,
                flags: {
                    send: false,
                    mirrored: false,
                    colorize: true,
                },
                field: new Field({}),
                sentLine: new FieldLine({}),
            } as Page);
        });

        test('last page', async () => {
            const pages: Page[] = [];
            await decode('vhBAgHAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                index: 0,
                lastPage: false,
            });

            expect(pages[1]).toMatchObject({
                index: 1,
                lastPage: true,
            } as Page);
        });

        test('mirror', async () => {
            const pages: Page[] = [];
            await decode('RhA8IeB8HeC8GeAQLvhAAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                flags: {
                    mirrored: true,
                },
                field: Field.load(
                    '',
                    'X_________',
                    'XX________',
                ),
                sentLine: FieldLine.load('XXX_______'),
            } as Page);

            expect(pages[1]).toMatchObject({
                flags: {
                    mirrored: false,
                },
                field: Field.load(
                    '',
                    '_________X',
                    '________XX',
                ),
                sentLine: FieldLine.load('XXX_______'),
            } as Page);
        });

        test('send', async () => {
            const pages: Page[] = [];
            await decode('RhA8IeB8HeC8GeAYJvhAAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                flags: {
                    send: true,
                },
                field: Field.load(
                    '',
                    'X_________',
                    'XX________',
                ),
                sentLine: FieldLine.load('XXX_______'),
            } as Page);

            expect(pages[1]).toMatchObject({
                flags: {
                    send: false,
                },
                field: Field.load(
                    '',
                    'X_________',
                    'XX________',
                    'XXX_______',
                ),
                sentLine: new FieldLine({}),
            } as Page);
        });

        test('I-Spawn', async () => {
            const pages: Page[] = [];
            await decode('vhARQJ', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                index: 0,
                lastPage: true,
                piece: {
                    lock: true,
                    type: Piece.I,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 4,
                        y: 0,
                    },
                },
                comment: {
                    ref: -1,
                },
                quiz: undefined,
                flags: {
                    send: false,
                    mirrored: false,
                    colorize: true,
                },
                field: new Field({}),
                sentLine: new FieldLine({}),
            } as Page);
        });

        test('Comment', async () => {
            const pages: Page[] = [];
            await decode('vhDAgWFAooMDEPBAAAAAPFA3XaDEEBAAAAAAAAPDAFrmAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(4);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: 'hello',
                },
            } as Page);

            expect(pages[1]).toMatchObject({
                comment: {
                    text: 'world',
                },
            } as Page);

            expect(pages[2]).toMatchObject({
                comment: {
                    ref: 1,
                },
            } as Page);

            expect(pages[3]).toMatchObject({
                comment: {
                    text: '!',
                },
            } as Page);
        });

        test('Quiz', async () => {
            const pages: Page[] = [];
            await decode('vhGSSYXAFLDmClcJSAVDEHBEooRBMoAVBUtfBAXsBAAANrBmnBAAAAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(7);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: '#Q=[](L)TSJ',
                },
                piece: {
                    lock: true,
                    type: Piece.L,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 8,
                        y: 0,
                    },
                },
                quiz: {
                    operation: Operation.Direct,
                },
            } as Page);

            expect(pages[1]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
                    lock: true,
                    type: Piece.S,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 6,
                        y: 0,
                    },
                },
                quiz: {
                    operation: Operation.Stock,
                },
            } as Page);

            expect(pages[2]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: undefined,
                quiz: {
                    operation: undefined,
                },
            } as Page);

            expect(pages[3]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
                    lock: true,
                    type: Piece.T,
                    rotation: Rotation.Right,
                    coordinate: {
                        x: 4,
                        y: 1,
                    },
                },
                quiz: {
                    operation: Operation.Swap,
                },
            } as Page);

            expect(pages[4]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
                    lock: true,
                    type: Piece.J,
                    rotation: Rotation.Reverse,
                    coordinate: {
                        x: 7,
                        y: 2,
                    },
                },
                quiz: {
                    operation: Operation.Swap,
                },
            } as Page);

            expect(pages[5]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: undefined,
                quiz: {
                    operation: undefined,
                },
            } as Page);

            expect(pages[6]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: undefined,
                quiz: {
                    operation: undefined,
                },
            } as Page);
        });
    });

    test('illegal short fumen', async () => {
        // right: vhAyOJ
        try {
            await decode('vhAyO', () => {});
            fail();
        } catch (e) {
            expect(e).toBeInstanceOf(FumenError);
        }
    });
});
