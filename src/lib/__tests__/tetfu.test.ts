import * as index from '../fumen';

describe('tetfu', () => {
    describe('decode', () => {
        test('decodeToValue()', () => {
            expect(index.decodeToValue('A')).toEqual(0);
            expect(index.decodeToValue('B')).toEqual(1);
            expect(index.decodeToValue('a')).toEqual(26);
            expect(index.decodeToValue('+')).toEqual(62);
            expect(index.decodeToValue('/')).toEqual(63);
        });

        test('decode array', () => {
            const array = 'hello'.split('').map(index.decodeToValue);
            expect(array).toEqual([33, 30, 37, 37, 40]);
        });
    });
});
