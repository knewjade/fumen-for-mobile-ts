import * as index from '../index';

describe('index', () => {
    test('say hello', () => {
        expect(index.hello()).toEqual('hello');
    });
});
