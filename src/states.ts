import { Block } from './enums';

export interface State {
    count: number;
    field: Block[];
}

export const initState: State = {
    count: 0,
    field: Array.from({ length: 240 }).map(ignore => Block.Empty),
};
