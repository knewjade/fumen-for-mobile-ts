import { FumenError } from '../errors';

const ENCODE_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export class Values {
    private readonly values: number[];

    constructor(data: string) {
        this.values = data.split('').map(decodeToValue);
    }

    poll(max: number): number {
        let value = 0;
        for (let count = 0; count < max; count += 1) {
            const v = this.values.shift();
            if (v === undefined) {
                throw new FumenError('Unexpected');
            }
            value += v * Math.pow(ENCODE_TABLE.length, count);
        }
        return value;
    }

    isEmpty(): boolean {
        return this.values.length === 0;
    }
}

function decodeToValue(v: string): number {
    return ENCODE_TABLE.indexOf(v);
}
