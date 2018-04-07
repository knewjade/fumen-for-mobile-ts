import { Values } from '../values';

describe('values', () => {
    test('poll1', () => {
        const values = new Values('ABC9+/');
        expect(values.poll(1)).toEqual(0);
        expect(values.poll(1)).toEqual(1);
        expect(values.poll(1)).toEqual(2);
        expect(values.poll(1)).toEqual(61);
        expect(values.poll(1)).toEqual(62);
        expect(values.poll(1)).toEqual(63);
    });

    test('poll2', () => {
        const values = new Values('ABC9+/');
        expect(values.poll(2)).toEqual(64);
        expect(values.poll(2)).toEqual(3906);
        expect(values.poll(2)).toEqual(4094);
    });

    test('poll3', () => {
        const values = new Values('ABC9+/');
        expect(values.poll(3)).toEqual(8256);
        expect(values.poll(3)).toEqual(262077);
    });
});
