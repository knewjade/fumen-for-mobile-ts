import { decode, Page } from '../fumen';
import { Piece, Rotation } from '../../enums';
import { Field, FieldLine } from '../field';

describe('fumen', () => {
    describe('decode', () => {
        test('empty', async () => {
            const pages: Page[] = [];
            await decode('vhAAgH', (page) => {
                pages[page.index] = page;
            });
            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                action: {
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
                },
                blockUp: new FieldLine().toArray(),
                index: 0,
                comment: '',
                commentRef: 0,
                field: new Field().toArray(),
                isLastPage: true,
            } as Page);
        });

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
        });
    });
});

