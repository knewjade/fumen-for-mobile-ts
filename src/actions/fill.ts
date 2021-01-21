import { State } from '../states';
import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { toPrimitivePage, toSinglePageTask } from '../history_task';

interface FillActions {
    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEnd(): action;

    ontouchStartSentLine(data: { index: number }): action;

    ontouchMoveSentLine(data: { index: number }): action;
}

export const fillActions: Readonly<FillActions> = {
    ontouchStartField: ({ index }) => (state): NextState => {
        if (state.events.piece !== undefined) {
            return undefined;
        }

        if (state.mode.piece === undefined) {
            return undefined;
        }

        return sequence(state, [
            newState => startDrawingField(newState),
            actions.ontouchMoveField({ index }),
        ]);
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        if (state.events.piece === undefined) {
            return undefined;
        }

        if (state.mode.piece === undefined) {
            return undefined;
        }

        return sequence(state, [
            newState => moveDrawingField(newState, index, true),
        ]);
    },
    ontouchEnd: () => (state): NextState => {
        if (state.events.piece === undefined) {
            return undefined;
        }

        const currentIndex = state.fumen.currentIndex;
        const page = state.fumen.pages[currentIndex];
        const updated = state.events.updated;
        return sequence(state, [
            updated && state.events.prevPage !== undefined
                ? actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, state.events.prevPage, page) })
                : undefined,
            endDrawingField,
        ]);
    },
    ontouchStartSentLine: ({ index }) => (state): NextState => {
        if (state.events.piece !== undefined) {
            return undefined;
        }

        if (state.mode.piece === undefined) {
            return undefined;
        }

        return sequence(state, [
            () => startDrawingField(state),
            actions.ontouchMoveSentLine({ index }),
        ]);
    },
    ontouchMoveSentLine: ({ index }) => (state): NextState => {
        if (state.events.piece === undefined) {
            return undefined;
        }

        if (state.mode.piece === undefined) {
            return undefined;
        }

        return moveDrawingField(state, index, false);
    },
};

const startDrawingField = (state: State): NextState => {
    const currentPageIndex = state.fumen.currentIndex;

    // 塗りつぶすpieceを決める
    const piece = state.mode.piece;
    if (piece === undefined) {
        return undefined;
    }

    return sequence(state, [
        () => ({
            events: {
                ...state.events,
                piece,
                prevPage: toPrimitivePage(state.fumen.pages[state.fumen.currentIndex]),
                updated: false,
            },
        }),
        actions.openPage({ index: currentPageIndex }),
    ]);
};

const moveDrawingField = (state: State, index: number, isField: boolean): NextState => {
    const pages = state.fumen.pages;
    const currentPageIndex = state.fumen.currentIndex;

    // 塗りつぶすpieceを決める
    const piece = state.events.piece;
    if (piece === undefined) {
        return undefined;
    }

    // pieceに変化がないときは、表示を更新しない
    const block = isField ? state.field[index] : state.sentLine[index];
    const selectedPiece = block.piece;
    if (selectedPiece === piece) {
        return undefined;
    }

    const page = pages[currentPageIndex];
    if (!page.commands) {
        page.commands = {
            pre: {},
        };
    }

    // Blockを追加
    const pageCommandsObject = page.commands;
    const fieldCopy = isField ? state.field.concat() : state.sentLine.concat();
    const maxY = Math.floor(fieldCopy.length / 10);

    const fill = (index: number) => {
        if (!fieldCopy[index] || fieldCopy[index].piece !== selectedPiece) {
            return;
        }
        delete fieldCopy[index];

        const x = index % 10;
        const y = Math.floor(index / 10);
        const type = isField ? 'block' : 'sentBlock';
        const key = `${type}-${index}`;

        const initPiece = state.cache.currentInitField.getAtIndex(index, isField);
        if (initPiece !== piece) {
            // 操作の結果、最初のフィールドの状態から変化するとき
            pageCommandsObject.pre[key] = { x, y, piece, type };
        } else {
            // 操作の結果、最初のフィールドの状態に戻るとき
            delete pageCommandsObject.pre[key];
        }

        if (0 < x) {
            fill(index - 1);
        }

        if (x < 9) {
            fill(index + 1);
        }

        if (0 < y) {
            fill(index - 10);
        }

        if (y < maxY - 1) {
            fill(index + 10);
        }
    };
    fill(index);

    return sequence(state, [
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
            events: {
                ...state.events,
                updated: true,
            },
        }),
        actions.openPage({ index: currentPageIndex }),
    ]);
};

const endDrawingField = (state: State): NextState => {
    return {
        events: {
            ...state.events,
            piece: undefined,
            prevPage: undefined,
            updated: false,
        },
    };
};
