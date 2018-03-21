import { Piece } from './lib/enums';

export interface State {
    count: number;
    field: Piece[];
    comment: string;
    display: {
        width: number;
        height: number;
    };
}

export const initState: State = {
    count: 0,
    field: Array.from({ length: 240 }).map(ignore => Piece.Empty),
    comment: 'hello world',
    display: {
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    },
};
