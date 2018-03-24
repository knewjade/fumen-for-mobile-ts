import { Piece } from './lib/enums';

export interface State {
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
    play: {
        status: string;
        page: number;
    };
}

export interface Block {
    piece: Piece;
    highlight?: boolean;
}

export const initState: State = {
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
    play: {
        status: 'pause',
        page: 1,
    },
};
