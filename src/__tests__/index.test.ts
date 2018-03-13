import * as index from '../index';

describe('index', function () {
    test('say hello', () => {
        expect(index.hello()).toEqual('hello');
    })
});
