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
    next?: ReadonlyArray<Piece>;
    play: Readonly<{
        status: AnimationState;
        intervalTime: number;
    }>;
    fumen: Readonly<{
        currentIndex: number;
        maxPage: number;
        pages: ReadonlyArray<Readonly<Page>>;
        value?: string;
        errorMessage?: string;
    }>;
    modal: Readonly<{
        fumen: boolean;
        settings: boolean;
    }>;
    handlers: Readonly<{
        animation?: number;
    }>;
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
    next: undefined,
    play: {
        status: AnimationState.Pause,
        intervalTime: 1500,
    },
    fumen: {
        currentIndex: 0,
        maxPage: 1,
        pages: [],
        value: undefined,
        errorMessage: undefined,
    },
    modal: {
        fumen: false,
        settings: false,
    },
    handlers: {
        animation: undefined,
    },
};
