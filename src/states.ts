import { Block } from './enums';

export interface State {
    count: number;
    field: Block[];
    canvas: {
        width: number;
        height: number;
    };
}

export const initState: State = {
    count: 0,
    field: Array.from({ length: 240 }).map(ignore => Block.Empty),
    canvas: {
        width: 15 * 10,
        height: 15 * 24,
    },
};
