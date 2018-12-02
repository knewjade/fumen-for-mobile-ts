import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { getBlockPositions, isMinoPiece, Piece, toPositionIndex } from '../lib/enums';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { PageFieldOperation, Pages } from '../lib/pages';

interface MovePieceActions {
    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEnd(): action;
}

export const movePieceActions: Readonly<MovePieceActions> = {
    ontouchStartField: ({ index }) => (state): NextState => {
        if (state.events.drawing) {
            return undefined;
        }

        return sequence(state, [
            () => ({
                events: {
                    ...state.events,
                    drawing: true,
                    prevPage: toPrimitivePage(state.fumen.pages[state.fumen.currentIndex]),
                    updated: false,
                },
            }),
            movePieceActions.ontouchMoveField({ index }),
        ]);
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        if (!state.events.drawing) {
            return undefined;
        }

        const pages = state.fumen.pages;
        const pageIndex = state.fumen.currentIndex;
        const page = pages[pageIndex];

        if (page === undefined) {
            return undefined;
        }

        const piece = page.piece;
        if (piece === undefined) {
            return undefined;
        }

        if (!isMinoPiece(piece.type)) {
            return undefined;
        }

        const x = index % 10;
        const y = Math.floor(index / 10);
        const positions = getBlockPositions(piece.type, piece.rotation, x, y);
        const isWallOver = positions.some(pos => pos[0] < 0 || 10 <= pos[0] || pos[1] < 0 || 24 <= pos[1]);
        if (isWallOver) {
            return undefined;
        }

        const pagesObj = new Pages(pages);
        const field = pagesObj.getField(pageIndex, PageFieldOperation.Command);
        const isConflicted = positions.map(toPositionIndex).some(i => field.getAtIndex(i, true) !== Piece.Empty);

        if (isConflicted) {
            return undefined;
        }

        page.piece = {
            ...piece,
            coordinate: { x, y },
        };

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
            actions.reopenCurrentPage(),
        ]);
    },
    ontouchEnd: () => (state): NextState => {
        if (!state.events.drawing) {
            return undefined;
        }

        const currentIndex = state.fumen.currentIndex;
        const page = state.fumen.pages[currentIndex];
        const updated = state.events.updated;
        return sequence(state, [
            updated && state.events.prevPage !== undefined ? actions.saveToMemento() : undefined,
            updated && state.events.prevPage !== undefined
                ? actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, state.events.prevPage, page) })
                : undefined,
            () => ({
                events: {
                    ...state.events,
                    prevPage: undefined,
                    updated: false,
                    drawing: false,
                },
            }),
        ]);
    },
};
