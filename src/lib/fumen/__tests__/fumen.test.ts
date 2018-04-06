import { decode, Page } from '../fumen';
import { Field, FieldLine } from '../field';

describe('fumen', () => {
    describe('decode', () => {
        test('empty', async () => {
            const pages: Page[] = [];
            await decode('vhAAgH', (page) => {
                pages[page.Index] = page;
            });

            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                Index: 0,
                LastPage: true,
                Piece: undefined,
                Comment: {
                    Ref: -1,
                },
                Quiz: undefined,
                Flags: {
                    Send: false,
                    Mirrored: false,
                    Colorize: true,
                },
                Field: new Field(),
                SentLine: new FieldLine(),
            } as Page);
        });

        test('I-Spawn', async () => {
            const pages: Page[] = [];
            await decode('vhAAgH', (page) => {
                pages[page.Index] = page;
            });

            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                Index: 0,
                LastPage: true,
                Piece: undefined,
                Comment: {
                    Ref: -1,
                },
                Quiz: undefined,
                Flags: {
                    Send: false,
                    Mirrored: false,
                    Colorize: true,
                },
                Field: new Field(),
                SentLine: new FieldLine(),
            } as Page);
        });


        /**
         * interface Page {
    index: number;
    action: Action;
    comment?: string;
    commentRef: number;
    field: Piece[];
    blockUp: Piece[];
    quizOperation?: Operation;
    isLastPage: boolean;
}
         */
        /**
         test('quiz1', async () => {
            const pages: Page[] = [];
            await decode('vhHSSYaAFLDmClcJSAVDEHBEooRBMoAVBUt3LCaHBAANpBXqBGjB0fBznBZnBAAA', (page) => {
                pages[page.index] = page;
            });
            expect(pages).toHaveLength(8);
            expect(pages[0]).toMatchObject({
                action: {
                    coordinate: {
                        x: 8,
                        y: 0,
                    },
                    isComment: true,
                    isLock: true,
                    piece: Piece.L,
                    rotation: Rotation.Spawn,
                },
                comment: '#Q=[](L)TSJIZO',
            });
            expect(pages[1]).toMatchObject({
                action: {
                    coordinate: {
                        x: 0,
                        y: 1,
                    },
                    isComment: false,
                    isLock: true,
                    piece: Piece.T,
                    rotation: Rotation.Right,
                },
                comment: undefined,
            });
            expect(pages[2]).toMatchObject({
                action: {
                    coordinate: {
                        x: 2,
                        y: 0,
                    },
                    isComment: false,
                    isLock: true,
                    piece: Piece.S,
                    rotation: Rotation.Spawn,
                },
                comment: undefined,
            });
            expect(pages[3]).toMatchObject({
                action: {
                    coordinate: {
                        x: 8,
                        y: 3,
                    },
                    isComment: false,
                    isLock: true,
                    piece: Piece.J,
                    rotation: Rotation.Reverse,
                },
                comment: undefined,
            });
            expect(pages[7]).toMatchObject({
                action: {
                    coordinate: {
                        x: 0,
                        y: 22,
                    },
                    isComment: false,
                    isLock: true,
                    piece: Piece.Empty,
                    rotation: Rotation.Reverse,
                },
                comment: undefined,
            });
        });*/
    });
});
