import { NextState, sequence } from './commons';
import { action, actions } from '../actions';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { PageFieldOperation, Pages, parseToCommands } from '../lib/pages';
import { FieldConstants } from '../lib/enums';
import { getBlockPositions } from '../lib/piece';
import { State } from '../states';
import { Field } from '../lib/fumen/field';

export interface ConvertActions {
    shiftToLeft: () => action;
    shiftToRight: () => action;
    shiftToUp: () => action;
    shiftToBottom: () => action;
    convertToGray: () => action;
    clearField: () => action;
}

export const convertActions: Readonly<ConvertActions> = {
    shiftToLeft: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalFieldCopy = goalField.copy();
        goalField.shiftToLeft();

        const piece = page.piece;
        if (piece === undefined && goalFieldCopy.equals(goalField)) {
            return undefined;
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

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

        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalFieldCopy = goalField.copy();
        goalField.shiftToRight();

        const piece = page.piece;
        if (piece === undefined && goalFieldCopy.equals(goalField)) {
            return undefined;
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

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

        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalFieldCopy = goalField.copy();
        goalField.shiftToUp();

        const piece = page.piece;
        if (piece === undefined && goalFieldCopy.equals(goalField)) {
            return undefined;
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

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

        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalFieldCopy = goalField.copy();
        goalField.shiftToBottom();

        const piece = page.piece;
        if (piece === undefined && goalFieldCopy.equals(goalField)) {
            return undefined;
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

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
    convertToGray: () => (state): NextState => {
        return sequence(state, [
            actions.removeUnsettledItems(),
            convertToGray((field) => {
                const copy = field.copy();
                copy.convertToGray();
                return copy;
            }),
        ]);
    },
    clearField: () => (state): NextState => {
        return sequence(state, [
            actions.removeUnsettledItems(),
            convertToGray(_ => new Field({})),
        ]);
    },
};

const convertToGray = (callback: (field: Field) => Field) => (state: State): NextState => {
    const currentIndex = state.fumen.currentIndex;
    const pages = state.fumen.pages;
    const pagesObj = new Pages(pages);

    const page = pages[currentIndex];
    const primitivePage = toPrimitivePage(page);

    const initField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
    const goalField = callback(initField);

    if (initField.equals(goalField)) {
        return undefined;
    }

    const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
    page.commands = parseToCommands(prevField, goalField);

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
};
