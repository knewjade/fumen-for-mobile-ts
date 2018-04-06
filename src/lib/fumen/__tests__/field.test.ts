import { Field } from '../field';
import { Piece, Rotation } from '../../enums';
import { FumenError } from '../../errors';

describe('field', () => {
    describe('load', () => {
        test('regular case', () => {
            const field = Field.load(
                'XXXXX_____' +
                'ZZZZZ_____',
                'IIIII_____',
            );

            for (let x = 0; x < 5; x += 1) {
                expect(field.get(x, 0)).toEqual(Piece.I);
                expect(field.get(x, 1)).toEqual(Piece.Z);
                expect(field.get(x, 2)).toEqual(Piece.Gray);
            }

            for (let x = 5; x < 10; x += 1) {
                expect(field.get(x, 0)).toEqual(Piece.Empty);
                expect(field.get(x, 1)).toEqual(Piece.Empty);
                expect(field.get(x, 2)).toEqual(Piece.Empty);
            }

            expect(field.get(0, 3)).toEqual(Piece.Empty);
        });

        test('lower case', () => {
            const field = Field.load('I_JL_SZ_TX');
            expect(field).toEqual(Field.load('i_jl_sz_tx'));
            expect(field).not.toEqual(Field.loadMinify('i_jl_sz_tx'));
            expect(field.numOfBlocks).toEqual(240);
        });

        test('minify', () => {
            const field = Field.loadMinify('_XIJLSZTX_');
            expect(field).toEqual(Field.loadMinify('_xijlsztx_'));
            expect(field).not.toEqual(Field.load('_XIJLSZTX_'));
            expect(field.numOfBlocks).toEqual(10);
        });

        test('9 chars field', () => {
            expect(() => Field.load('XXXXX___')).toThrow(FumenError);
        });
    });

    test('get & add', () => {
        const field = new Field({});
        for (let y = 0; y < 23; y += 1) {
            for (let x = 0; x < 10; x += 1) {
                expect(field.get(x, y)).toEqual(Piece.Empty);

                field.add(x, y, 3);
                expect(field.get(x, y)).toEqual(3);

                field.add(x, y, -4);
                expect(field.get(x, y)).toEqual(-1);
            }
        }
    });

    describe('put', () => {
        test('I-Spawn', () => {
            const field = new Field({});
            field.put(Piece.I, Rotation.Spawn, { x: 1, y: 0 });

            expect(field.get(0, 0)).toEqual(Piece.I);
            expect(field.get(1, 0)).toEqual(Piece.I);
            expect(field.get(2, 0)).toEqual(Piece.I);
            expect(field.get(3, 0)).toEqual(Piece.I);
        });

        test('S-Left', () => {
            const field = new Field({});
            field.put(Piece.S, Rotation.Left, { x: 3, y: 4 });

            expect(field.get(2, 5)).toEqual(Piece.S);
            expect(field.get(2, 4)).toEqual(Piece.S);
            expect(field.get(3, 4)).toEqual(Piece.S);
            expect(field.get(3, 3)).toEqual(Piece.S);
        });
    });

    describe('clearLine', () => {
        test('regular', () => {
            const field = Field.load(
                '_XXXXXXXXX' +
                'XXXXXXXXXX' +
                'SLZXOSZTI_',
                'LJSZOXXXXX',
            );

            field.clearLine();

            expect(field).toEqual(Field.load(
                '_XXXXXXXXX' +
                'SLZXOSZTI_',
            ));
        });

        test('clear no line', () => {
            const field = Field.load(
                'SLZX_OOZLI',
                '_LZXOOOOI_',
                '__________',
                '_LZXOSZTIO',
            );

            field.clearLine();

            expect(field).toEqual(field);
        });

        test('clear all line', () => {
            const field = Field.load(
                'SLZXSOOZLI',
                'ZLZXOOOOIX',
                'OOOOOOZTIO',
            );

            field.clearLine();

            expect(field).toEqual(Field.load(''));
        });
    });

    test('up', () => {
        const field = Field.load(
            'III_______',
            'OOOO______',
        );

        const blockUp = Field.loadMinify(
            'SSSSS_____',
            'ZZZZZZ____',
        );

        field.up(blockUp);

        expect(field).toEqual(Field.load(
            'III_______',
            'OOOO______',
            'SSSSS_____',
            'ZZZZZZ____',
        ));
    });

    test('mirror', () => {
        const field = Field.load(
            'III_______',
            'OOOO______',
            'SSSSS_____',
        );

        field.mirror();

        expect(field).toEqual(Field.load(
            '_______III',
            '______OOOO',
            '_____SSSSS',
        ));
    });

    test('to array', () => {
        const field = new Field({});
        const array = field.toArray();
        expect(array).toHaveLength(240);
        expect(array.every(value => value === Piece.Empty)).toBeTruthy();

        // 配列に変換後、fieldを操作しても変化しない
        field.put(Piece.I, Rotation.Left, { x: 1, y: 0 });
        expect(array).toHaveLength(240);
        expect(array.every(value => value === Piece.Empty)).toBeTruthy();
    });
});
