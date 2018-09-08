import { Piece, TouchTypes } from '../lib/enums';
import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { putPieceActions } from './put_piece';
import { drawBlockActions } from './draw_block';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { movePieceActions } from './move_piece';

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

    clearPiece(data: { pageIndex: number }): action;
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
        }
        return undefined;
    },
    ontouchStartSentLine: ({ index }) => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.ontouchStartSentLine({ index })(state);
        }
        return undefined;
    },
    ontouchMoveSentLine: ({ index }) => (state): NextState => {
        switch (state.mode.touch) {
        case TouchTypes.Drawing:
            return drawBlockActions.ontouchMoveSentLine({ index })(state);
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
    clearPiece: ({ pageIndex }) => (state): NextState => {
        const pages = state.fumen.pages;
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
};
