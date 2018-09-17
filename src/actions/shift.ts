import { NextState, sequence } from './commons';
import { action, actions } from '../actions';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { PageFieldOperation, Pages, parseToCommands } from '../lib/pages';
import { FieldConstants, getBlockPositions } from '../lib/enums';

export interface ShiftActions {
    shiftToLeft: () => action;
    shiftToRight: () => action;
    shiftToUp: () => action;
    shiftToBottom: () => action;
}

export const shiftActions: Readonly<ShiftActions> = {
    shiftToLeft: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        goalField.shiftToLeft();

        page.commands = parseToCommands(prevField, goalField);

        const piece = page.piece;
        if (piece !== undefined) {
            const positions = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
            const minX = Math.min(...positions.map(position => position[0]));
            if (minX < 1) {
                page.piece = undefined;
            } else {
                piece.coordinate.x -= 1;
            }
        }

        return sequence(state, [
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.reopenCurrentPage(),
        ]);
    },
    shiftToRight: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        goalField.shiftToRight();

        page.commands = parseToCommands(prevField, goalField);

        const piece = page.piece;
        if (piece !== undefined) {
            const positions = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
            const maxX = Math.max(...positions.map(position => position[0]));
            if (8 < maxX) {
                page.piece = undefined;
            } else {
                piece.coordinate.x += 1;
            }
        }

        return sequence(state, [
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.reopenCurrentPage(),
        ]);
    },
    shiftToUp: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        goalField.shiftToUp();

        page.commands = parseToCommands(prevField, goalField);

        const piece = page.piece;
        if (piece !== undefined) {
            const positions = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
            const maxY = Math.max(...positions.map(position => position[1]));
            if (FieldConstants.Height - 2 < maxY) {
                page.piece = undefined;
            } else {
                piece.coordinate.y += 1;
            }
        }

        return sequence(state, [
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.reopenCurrentPage(),
        ]);
    },
    shiftToBottom: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        goalField.shiftToBottom();

        page.commands = parseToCommands(prevField, goalField);

        const piece = page.piece;
        if (piece !== undefined) {
            const positions = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
            const minY = Math.min(...positions.map(position => position[1]));
            if (minY < 1) {
                page.piece = undefined;
            } else {
                piece.coordinate.y -= 1;
            }
        }

        return sequence(state, [
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.reopenCurrentPage(),
        ]);
    },
};
