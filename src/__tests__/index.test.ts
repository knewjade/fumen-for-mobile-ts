import * as index from '../index';

describe('index', () => {
    test('say hello', () => {
        expect(index.hello()).toEqual('hello');
    });

    test('Array.from()', () => {
        const array = Array.from({ length: 10 }).map(() => 0);
        expect(array).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
});
