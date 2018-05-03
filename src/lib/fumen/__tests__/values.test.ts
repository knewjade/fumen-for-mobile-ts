import { Values } from '../values';
import { FumenError } from '../../errors';

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

    test('poll over', () => {
        const values = new Values('ABC');
        expect(() => values.poll(4)).toThrow(FumenError);
    });

    test('check empty', () => {
        const values = new Values('AB');
        expect(values.isEmpty()).toBeFalsy();
        values.poll(1);
        expect(values.isEmpty()).toBeFalsy();
        values.poll(1);
        expect(values.isEmpty()).toBeTruthy();
    });

    test('push1', () => {
        const values = new Values();

        values.push(0, 1);
        values.push(1, 1);
        values.push(2, 1);
        values.push(61, 1);
        values.push(62, 1);
        values.push(63, 1);

        expect(values.toString()).toEqual('ABC9+/');
    });

    test('push2', () => {
        const values = new Values();

        values.push(64, 2);
        values.push(3906, 2);
        values.push(4094, 2);

        expect(values.toString()).toEqual('ABC9+/');
    });

    test('push3', () => {
        const values = new Values();

        values.push(8256, 3);
        values.push(262077, 3);

        expect(values.toString()).toEqual('ABC9+/');
    });

    test('merge', () => {
        const head = new Values('abc');
        const tail = new Values('ABC');

        head.merge(tail);

        expect(head.toString()).toEqual('abcABC');
    });
});
