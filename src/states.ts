import { Piece } from './lib/enums';

export interface State {
    count: number;
    field: Block[];
    comment: {
        text: string;
        textColor: string;
        backgroundColor: string;
    };
    display: {
        width: number;
        height: number;
    };
    hold: Piece | undefined;
    nexts: Piece[] | undefined;
}

export interface Block {
    piece: Piece;
    highlight?: boolean;
}

export const initState: State = {
    count: 0,
    field: Array.from({ length: 240 }).map((ignore) => {
        return { piece: Piece.Empty };
    }),
    comment: {
        text: '',
        textColor: 'black',
        backgroundColor: 'white',
    },
    display: {
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    },
    hold: undefined,
    nexts: undefined,
};
