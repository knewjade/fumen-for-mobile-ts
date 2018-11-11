import { getBlockPositions, Piece, Rotation, toPositionIndex, TouchTypes } from '../lib/enums';
import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { putPieceActions } from './put_piece';
import { drawBlockActions } from './draw_block';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { movePieceActions } from './move_piece';
import { PageFieldOperation, Pages } from '../lib/pages';
import { testLeftRotation, testRightRotation } from '../lib/srs';
import { Field } from '../lib/fumen/field';
import { fillRowActions } from './fill_row';

export interface FieldEditorActions {
    fixInferencePiece(): action;

    clearInferencePiece(): action;

    resetInferencePiece(): action;

    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEnd(): action;

    ontouchStartSentLine(data: { index: number }): action;

    ontouchMoveSentLine(data: { index: number }): action;

    selectPieceColor(data: { piece: Piece }): action;

    selectInferencePieceColor(): action;

    clearPiece(): action;

    rotateToLeft(): action;

    rotateToRight(): action;

    moveToLeft(): action;

    moveToLeftEnd(): action;

    moveToRight(): action;

    moveToRightEnd(): action;

    harddrop(): action;
}

export const fieldEditorActions: Readonly<FieldEditorActions> = {
    fixInferencePiece: () => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.fixInferencePiece()(state);
        case TouchTypes.Piece:
            return putPieceActions.fixInferencePiece()(state);
        }
        return undefined;
    },
    clearInferencePiece: () => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.clearInferencePiece()(state);
        case TouchTypes.Piece:
            return putPieceActions.clearInferencePiece()(state);
        }
        return undefined;
    },
    resetInferencePiece: () => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.resetInferencePiece()(state);
        case TouchTypes.Piece:
            return putPieceActions.resetInferencePiece()(state);
        }
        return undefined;
    },
    ontouchStartField: ({ index }) => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.ontouchStartField({ index })(state);
        case TouchTypes.Piece:
            return putPieceActions.ontouchStartField({ index })(state);
        case TouchTypes.MovePiece:
            return movePieceActions.ontouchStartField({ index })(state);
        case TouchTypes.FillRow:
            return fillRowActions.ontouchStartField({ index })(state);
        }
        return undefined;
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.ontouchMoveField({ index })(state);
        case TouchTypes.Piece:
            return putPieceActions.ontouchMoveField({ index })(state);
        case TouchTypes.MovePiece:
            return movePieceActions.ontouchMoveField({ index })(state);
        case TouchTypes.FillRow:
            return fillRowActions.ontouchMoveField({ index })(state);
        }
        return undefined;
    },
    ontouchEnd: () => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.ontouchEnd()(state);
        case TouchTypes.Piece:
            return putPieceActions.ontouchEnd()(state);
        case TouchTypes.MovePiece:
            return movePieceActions.ontouchEnd()(state);
        case TouchTypes.FillRow:
            return fillRowActions.ontouchEnd()(state);
        }
        return undefined;
    },
    ontouchStartSentLine: ({ index }) => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.ontouchStartSentLine({ index })(state);
        case TouchTypes.FillRow:
            return fillRowActions.ontouchStartSentLine({ index })(state);
        }
        return undefined;
    },
    ontouchMoveSentLine: ({ index }) => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.ontouchMoveSentLine({ index })(state);
        case TouchTypes.FillRow:
            return fillRowActions.ontouchMoveSentLine({ index })(state);
        }
        return undefined;
    },
    selectPieceColor: ({ piece }) => (state): NextState => {
        return sequence(state, [
            fieldEditorActions.fixInferencePiece(),
            fieldEditorActions.resetInferencePiece(),
            newState => ({
                mode: {
                    ...newState.mode,
                    piece,
                },
            }),
        ]);
    },
    selectInferencePieceColor: () => (state): NextState => {
        return sequence(state, [
            fieldEditorActions.fixInferencePiece(),
            fieldEditorActions.resetInferencePiece(),
            newState => ({
                mode: {
                    ...newState.mode,
                    piece: undefined,
                },
            }),
        ]);
    },
    clearPiece: () => (state): NextState => {
        const pages = state.fumen.pages;
        const pageIndex = state.fumen.currentIndex;
        const page = pages[pageIndex];
        if (page === undefined) {
            return undefined;
        }

        if (page.piece === undefined) {
            return fieldEditorActions.resetInferencePiece()(state);
        }

        const prevPage = toPrimitivePage(page);
        page.piece = undefined;

        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(pageIndex, prevPage, page) }),
            actions.reopenCurrentPage(),
        ]);
    },
    rotateToLeft: () => (state): NextState => {
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

        const pagesObj = new Pages(pages);
        const field = pagesObj.getField(pageIndex, PageFieldOperation.Command);

        const testObj = testLeftRotation(piece.type, piece.rotation);
        const nextRotation = testObj.rotation;
        const test = testCallback(field, piece.type, nextRotation);

        const coordinate = piece.coordinate;
        const testPositions = testObj.test.map((value) => {
            value[0] += coordinate.x;
            value[1] += coordinate.y;
            return value;
        });

        const element = testPositions.find(position => test(position[0], position[1]));
        if (element === undefined) {
            return undefined;
        }

        const prevPage = toPrimitivePage(page);
        page.piece = {
            ...piece,
            rotation: nextRotation,
            coordinate: {
                x: element[0],
                y: element[1],
            },
        };

        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(pageIndex, prevPage, page) }),
            actions.reopenCurrentPage(),
        ]);
    },
    rotateToRight: () => (state): NextState => {
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

        const pagesObj = new Pages(pages);
        const field = pagesObj.getField(pageIndex, PageFieldOperation.Command);

        const testObj = testRightRotation(piece.type, piece.rotation);
        const nextRotation = testObj.rotation;
        const test = testCallback(field, piece.type, nextRotation);

        const coordinate = piece.coordinate;
        const testPositions = testObj.test.map((value) => {
            value[0] += coordinate.x;
            value[1] += coordinate.y;
            return value;
        });

        const element = testPositions.find(position => test(position[0], position[1]));
        if (element === undefined) {
            return undefined;
        }

        const prevPage = toPrimitivePage(page);
        page.piece = {
            ...piece,
            rotation: nextRotation,
            coordinate: {
                x: element[0],
                y: element[1],
            },
        };

        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(pageIndex, prevPage, page) }),
            actions.reopenCurrentPage(),
        ]);
    },
    moveToLeft: () => (state): NextState => {
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

        const pagesObj = new Pages(pages);
        const field = pagesObj.getField(pageIndex, PageFieldOperation.Command);

        const test = testCallback(field, piece.type, piece.rotation);

        const coordinate = piece.coordinate;
        if (!test(coordinate.x - 1, coordinate.y)) {
            return undefined;
        }

        const prevPage = toPrimitivePage(page);
        page.piece = {
            ...piece,
            coordinate: {
                x: coordinate.x - 1,
                y: coordinate.y,
            },
        };

        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(pageIndex, prevPage, page) }),
            actions.reopenCurrentPage(),
        ]);
    },
    moveToLeftEnd: () => (state): NextState => {
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

        const pagesObj = new Pages(pages);
        const field = pagesObj.getField(pageIndex, PageFieldOperation.Command);

        const test = testCallback(field, piece.type, piece.rotation);

        const coordinate = piece.coordinate;
        let x = coordinate.x;
        while (test(x - 1, coordinate.y)) {
            x -= 1;
        }

        if (x === coordinate.x) {
            return undefined;
        }

        const prevPage = toPrimitivePage(page);
        page.piece = {
            ...piece,
            coordinate: {
                x,
                y: coordinate.y,
            },
        };

        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(pageIndex, prevPage, page) }),
            actions.reopenCurrentPage(),
        ]);
    },
    moveToRight: () => (state): NextState => {
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

        const pagesObj = new Pages(pages);
        const field = pagesObj.getField(pageIndex, PageFieldOperation.Command);

        const test = testCallback(field, piece.type, piece.rotation);

        const coordinate = piece.coordinate;
        if (!test(coordinate.x + 1, coordinate.y)) {
            return undefined;
        }

        const prevPage = toPrimitivePage(page);
        page.piece = {
            ...piece,
            coordinate: {
                x: coordinate.x + 1,
                y: coordinate.y,
            },
        };

        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(pageIndex, prevPage, page) }),
            actions.reopenCurrentPage(),
        ]);
    },
    moveToRightEnd: () => (state): NextState => {
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

        const pagesObj = new Pages(pages);
        const field = pagesObj.getField(pageIndex, PageFieldOperation.Command);

        const test = testCallback(field, piece.type, piece.rotation);

        const coordinate = piece.coordinate;
        let x = coordinate.x;
        while (test(x + 1, coordinate.y)) {
            x += 1;
        }

        if (x === coordinate.x) {
            return undefined;
        }

        const prevPage = toPrimitivePage(page);
        page.piece = {
            ...piece,
            coordinate: {
                x,
                y: coordinate.y,
            },
        };

        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(pageIndex, prevPage, page) }),
            actions.reopenCurrentPage(),
        ]);
    },
    harddrop: () => (state): NextState => {
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

        const pagesObj = new Pages(pages);
        const field = pagesObj.getField(pageIndex, PageFieldOperation.Command);

        const test = testCallback(field, piece.type, piece.rotation);
        let currentY = piece.coordinate.y;
        for (let y = piece.coordinate.y - 1; 0 <= y; y -= 1) {
            if (!test(piece.coordinate.x, y)) {
                break;
            }
            currentY = y;
        }

        if (currentY === piece.coordinate.y) {
            return undefined;
        }

        const prevPage = toPrimitivePage(page);
        page.piece = {
            ...piece,
            coordinate: {
                ...piece.coordinate,
                y: currentY,
            },
        };

        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(pageIndex, prevPage, page) }),
            actions.reopenCurrentPage(),
        ]);
    },
};

const testCallback = (field: Field, piece: Piece, rotation: Rotation) => {
    return (x: number, y: number) => {
        const positions = getBlockPositions(piece, rotation, x, y);
        const isGroundOver = positions.some(pos => pos[0] < 0 || 10 <= pos[0] || pos[1] < 0 || 24 <= pos[1]);
        if (isGroundOver) {
            return false;
        }

        const isConflicted = positions.map(toPositionIndex).some(i => field.getAtIndex(i, true) !== Piece.Empty);
        return !isConflicted;
    };
};
