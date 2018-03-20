import { Piece } from './view';

export interface State {
    count: number;
    field: Piece[];
    comment: string;
    canvas: {
        width: number;
        height: number;
    };
}

export const initState: State = {
    count: 0,
    field: Array.from({ length: 240 }).map(ignore => Piece.Empty),
    comment: 'hello world',
    canvas: {
        width: 15 * 10,
        height: 15 * 24,
    },
};
