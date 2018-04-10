import { FumenError, ViewError } from '../errors';

describe('errors', () => {
    it('expect to throw FumenError', () => {
        expect(() => {
            throw new FumenError('dummy message');
        }).toThrow(FumenError);
    });

    it('expect NOT to throw Error', () => {
        expect(() => {
            throw new FumenError('dummy message');
        }).not.toThrow(Error);
    });

    it('expect NOT to throw other Error', () => {
        expect(() => {
            throw new FumenError('dummy message');
        }).not.toThrow(ViewError);
    });
});
