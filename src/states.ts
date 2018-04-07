import { AnimationState, Piece } from './lib/enums';

export interface State {
    field: Block[];
    blockUp: Block[];
    comment: {
        text: string;
        isChanged: boolean;
    };
    display: {
        width: number;
        height: number;
    };
    hold?: Piece;
    nexts?: Piece[];
    maxPage: number;
    play: {
        status: AnimationState;
        pageIndex: number;
        intervalTime: number;
    };
    fumen: {
        value?: string;
        errorMessage?: string;
    };
}

export interface Block {
    piece: Piece;
    highlight?: boolean;
}

export const initState: State = {
    field: Array.from({ length: 230 }).map((ignore) => {
        return { piece: Piece.Empty };
    }),
    blockUp: Array.from({ length: 10 }).map((ignore) => {
        return { piece: Piece.Empty };
    }),
    comment: {
        text: '',
        isChanged: false,
    },
    display: {
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    },
    hold: undefined,
    nexts: undefined,
    maxPage: 0,
    play: {
        status: AnimationState.Pause,
        pageIndex: 0,
        intervalTime: 1500,
    },
    fumen: {
        value: undefined,
        errorMessage: undefined,
    },
};
