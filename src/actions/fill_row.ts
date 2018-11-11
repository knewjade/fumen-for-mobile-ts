import { State } from '../states';
import { Piece } from '../lib/enums';
import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { toPrimitivePage, toSinglePageTask } from '../history_task';

interface FillRowActions {
    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEnd(): action;

    ontouchStartSentLine(data: { index: number }): action;

    ontouchMoveSentLine(data: { index: number }): action;
}

export const fillRowActions: Readonly<FillRowActions> = {
    ontouchStartField: ({ index }) => (state): NextState => {
        if (state.events.touch.piece !== undefined) {
            return undefined;
        }

        return sequence(state, [
            newState => ontouchStartField(newState),
            actions.ontouchMoveField({ index }),
        ]);
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        return sequence(state, [
            newState => ontouchMove(state, index, true),
            actions.reopenCurrentPage(),
        ]);
    },
    ontouchEnd: () => (state): NextState => {
        const pages = state.fumen.pages;
        const currentPageIndex = state.fumen.currentIndex;
        const page = pages[currentPageIndex];
        const prevPage = state.events.prevPage;
        return sequence(state, [
            endDrawingField,
            actions.saveToMemento(),
            prevPage !== undefined
                ? actions.registerHistoryTask({ task: toSinglePageTask(currentPageIndex, prevPage, page) })
                : undefined,
        ]);
    },
    ontouchStartSentLine: ({ index }) => (state): NextState => {
        if (state.events.touch.piece !== undefined) {
            return undefined;
        }

        return sequence(state, [
            newState => ontouchStartField(newState),
            actions.ontouchMoveSentLine({ index }),
        ]);
    },
    ontouchMoveSentLine: ({ index }) => (state): NextState => {
        return sequence(state, [
            newState => ontouchMove(newState, index, false),
            actions.reopenCurrentPage(),
        ]);
    },
};

const ontouchStartField = (state: State): NextState => {
    const pages = state.fumen.pages;
    const currentPageIndex = state.fumen.currentIndex;
    return {
        events: {
            ...state.events,
            touch: {
                piece: state.mode.piece ? state.mode.piece : Piece.Empty,
            },
            updated: false,
            prevPage: toPrimitivePage(pages[currentPageIndex]),
        },
    };
};

const ontouchMove = (state: State, index: number, isField: boolean): NextState => {
    const piece = state.events.touch.piece;
    if (piece === undefined) {
        return undefined;
    }

    const currentPageIndex = state.fumen.currentIndex;
    const pages = state.fumen.pages;
    const page = pages[currentPageIndex];
    if (page === undefined) {
        return undefined;
    }

    if (!page.commands) {
        page.commands = {
            pre: {},
        };
    }

    const touchX = index % 10;
    const touchY = Math.floor(index / 10);

    // Blockを追加
    for (let x = 0; x < 10; x += 1) {
        const i = x + touchY * 10;
        const type = isField ? 'block' : 'sentBlock';
        const key = `${type}-${i}`;

        // フィールドのみ
        if (touchX !== x && state.cache.currentInitField.getAtIndex(index, true) !== piece) {
            // 操作の結果、最初のフィールドの状態から変化するとき
            page.commands.pre[key] = { x, piece, type, y: touchY };
        } else {
            // 操作の結果、最初のフィールドの状態に戻るとき
            delete page.commands.pre[key];
        }
    }

    return sequence(state, [
        newState => ({
            fumen: {
                ...newState.fumen,
                pages,
            },
        }),
        actions.reopenCurrentPage(),
    ]);
};

const endDrawingField = (state: State): NextState => {
    return {
        events: {
            ...state.events,
            touch: { piece: undefined },
            prevPage: undefined,
            updated: false,
        },
    };
};
