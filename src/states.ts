import { Block } from './view';

export interface State {
    count: number;
    field: Block[];
    comment: string;
    canvas: {
        width: number;
        height: number;
    };
}

export const initState: State = {
    count: 0,
    field: Array.from({ length: 240 }).map(ignore => Block.Empty),
    comment: 'hello world',
    canvas: {
        width: 15 * 10,
        height: 15 * 24,
    },
};
