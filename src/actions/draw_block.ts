import { State } from '../states';
import { Piece } from '../lib/enums';
import { action, actions } from '../actions';
import { NextState, sequence } from './commons';

export interface DrawBlockActions {
    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEndField(): action;

    ontouchStartSentLine(data: { index: number }): action;

    ontouchMoveSentLine(data: { index: number }): action;

    ontouchEndSentLine(): action;

    ontouchStartPiece(data: { index: number }): action;
}

export const drawBlockActions: Readonly<DrawBlockActions> = {
    ontouchStartField: ({ index }) => (state): NextState => {
        return startDrawingField(state, index, true);
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        return moveDrawingField(state, index, true);
    },
    ontouchEndField: () => (state): NextState => {
        return endDrawingField(state);
    },
    ontouchStartSentLine: ({ index }) => (state): NextState => {
        return startDrawingField(state, index, false);
    },
    ontouchMoveSentLine: ({ index }) => (state): NextState => {
        return moveDrawingField(state, index, false);
    },
    ontouchEndSentLine: () => (state): NextState => {
        return endDrawingField(state);
    },
    ontouchStartPiece: ({}) => (state): NextState => {
        const pages = state.fumen.pages;
        const currentPageIndex = state.fumen.currentIndex;

        return sequence(state, [
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.openPage({ index: currentPageIndex }),
        ]);
    },
};

const startDrawingField = (state: State, index: number, isField: boolean): NextState => {
    const pages = state.fumen.pages;
    const currentPageIndex = state.fumen.currentIndex;

    // 塗りつぶすpieceを決める
    const block = isField ? state.field[index] : state.sentLine[index];
    const piece = block.piece !== state.mode.piece ? state.mode.piece : Piece.Empty;

    const page = pages[currentPageIndex];
    if (!page.commands) {
        page.commands = {
            pre: {},
        };
    }

    // Blockを追加
    {
        const x = index % 10;
        const y = Math.floor(index / 10);
        const type = isField ? 'block' : 'sentBlock';
        const key = `${type}-${index}`;
        page.commands.pre[key] = { x, y, piece, type };
    }

    return sequence(state, [
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
            events: {
                ...state.events,
                touch: { piece },
            },
        }),
        actions.openPage({ index: currentPageIndex }),
    ]);
};

const moveDrawingField = (state: State, index: number, isField: boolean): NextState => {
    const pages = state.fumen.pages;
    const currentPageIndex = state.fumen.currentIndex;

    // 塗りつぶすpieceを決める
    const piece = state.events.touch.piece;
    if (piece === undefined) {
        return undefined;
    }

    // pieceに変化がないときは、表示を更新しない
    const block = isField ? state.field[index] : state.sentLine[index];
    if (block.piece === piece) {
        return undefined;
    }

    const page = pages[currentPageIndex];
    if (!page.commands) {
        page.commands = {
            pre: {},
        };
    }

    // Blockを追加
    {
        const x = index % 10;
        const y = Math.floor(index / 10);
        const type = isField ? 'block' : 'sentBlock';
        const key = `${type}-${index}`;
        page.commands.pre[key] = { x, y, piece, type };
    }

    return sequence(state, [
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
            events: {
                ...state.events,
                touch: { piece },
            },
        }),
        actions.openPage({ index: currentPageIndex }),
    ]);
};

const endDrawingField = (state: State): NextState => {
    return {
        events: {
            ...state.events,
            touch: { piece: undefined },
        },
    };
};
