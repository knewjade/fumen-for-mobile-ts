import { AnimationState, Piece } from './lib/enums';
import { Page } from './lib/fumen/fumen';

// Immutableにする
export interface State {
    field: ReadonlyArray<Readonly<Block>>;
    sentLine: ReadonlyArray<Readonly<Block>>;
    comment: Readonly<{
        readonly text: string;
        readonly isChanged: boolean;
    }>;
    display: Readonly<{
        width: number;
        height: number;
    }>;
    hold?: Piece;
    nexts?: ReadonlyArray<Piece>;
    maxPage: number;
    play: Readonly<{
        status: AnimationState;
        pageIndex: number;
        intervalTime: number;
    }>;
    fumen: Readonly<{
        pages: ReadonlyArray<Readonly<Page>>;
        value?: string;
        errorMessage?: string;
    }>;
    handlers: Readonly<{}>;
}

export interface Block {
    piece: Piece;
    highlight?: boolean;
}

export const initState: Readonly<State> = {
    field: Array.from({ length: 230 }).map((ignore) => {
        return { piece: Piece.Empty };
    }),
    sentLine: Array.from({ length: 10 }).map((ignore) => {
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
        pages: [],
        value: undefined,
        errorMessage: undefined,
    },
    handlers: {},
};
