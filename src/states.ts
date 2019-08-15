import { AnimationState, CommentType, ModeTypes, Piece, Screens, TouchTypes } from './lib/enums';
import { PageEnv } from './env';
import { Block } from './state_types';
import { PrimitivePage } from './history_task';
import { generateKey } from './lib/random';
import { Page } from './lib/fumen/types';
import { Field } from './lib/fumen/field';

const VERSION = PageEnv.Version;

// Immutableにする
export interface State {
    field: Block[];
    sentLine: Block[];
    comment: {
        text: string;
        isChanged: boolean;
        changeKey: string;
    };
    display: {
        width: number;
        height: number;
    };
    hold?: Piece;
    nexts?: Piece[];
    play: {
        status: AnimationState;
        intervalTime: number;
    };
    fumen: {
        currentIndex: number;
        maxPage: number;
        pages: Page[];
        value?: string;
        errorMessage?: string;
        guideLineColor: boolean;
    };
    cache: {
        currentInitField: Field;
        taskKey?: string;
    };
    handlers: {
        animation?: number;
    };
    events: {
        piece?: Piece;
        drawing: boolean;
        inferences: number[];
        prevPage?: PrimitivePage;
        updated: boolean;
    };
    mode: {
        screen: Screens;
        type: ModeTypes;
        touch: TouchTypes;
        piece: Piece | undefined;
        comment: CommentType;
        ghostVisible: boolean;
    };
    history: {
        undoCount: number;
        redoCount: number;
    };
    version: string;
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
        changeKey: generateKey(),
    },
    display: {
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    },
    hold: undefined,
    nexts: undefined,
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
        guideLineColor: true,
    },
    cache: {
        currentInitField: new Field({}),
        taskKey: undefined,
    },
    handlers: {
        animation: undefined,
    },
    events: {
        piece: undefined,
        drawing: false,
        inferences: [],
        prevPage: undefined,
        updated: false,
    },
    mode: {
        screen: window.location.hash.includes('#/writable') ? Screens.Editor : Screens.Reader,
        type: ModeTypes.DrawingTool,
        touch: TouchTypes.Drawing,
        piece: undefined,
        comment: CommentType.Writable,
        ghostVisible: true,
    },
    history: {
        undoCount: 0,
        redoCount: 0,
    },
    version: VERSION,
};

export const resources = {
    comment: undefined as ({ text: string, pageIndex: number } | undefined),
};
