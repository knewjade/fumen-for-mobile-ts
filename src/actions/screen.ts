import { NextState, sequence } from './commons';
import { action, actions, main } from '../actions';
import { CommentType, ModeTypes, Piece, Screens, TouchTypes } from '../lib/enums';
import { resources, State } from '../states';
import { animationActions } from './animation';

export interface ScreenActions {
    changeToReaderScreen: () => action;
    changeToDrawerScreen: (data: { refresh?: boolean }) => action;
    changeToDrawingMode: () => action;
    changeToDrawingToolMode: () => action;
    changeToFlagsMode: () => action;
    changeToUtilsMode: () => action;
    changeToShiftMode: () => action;
    changeToFillRowMode: () => action;
    changeToPieceMode: () => action;
    changeToFillMode: () => action;
    changeToDrawPieceMode: () => action;
    changeToMovePieceMode: () => action;
    changeToSelectPieceMode: () => action;
    changeScreen: (data: { screen: Screens }) => action;
    changeCommentMode: (data: { type: CommentType }) => action;
    changeGhostVisible: (data: { visible: boolean }) => action;
}

export const modeActions: Readonly<ScreenActions> = {
    changeToReaderScreen: () => (state): NextState => {
        resources.konva.stage.reload((done) => {
            main.changeScreen({ screen: Screens.Reader });
            done();
        });
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.resetInferencePiece(),
        ]);
    },
    changeToDrawerScreen: ({ refresh }) => (state): NextState => {
        resources.konva.stage.reload((done) => {
            main.changeScreen({ screen: Screens.Editor });
            done();
        });
        return sequence(state, [
            animationActions.pauseAnimation(),
            refresh ? actions.changeToDrawingToolMode() : undefined,
        ]);
    },
    changeToDrawingMode: () => (state): NextState => {
        return sequence(state, [
            changeTouchType({ type: TouchTypes.Drawing }),
            changeModeType({ type: ModeTypes.Drawing }),
        ]);
    },
    changeToDrawingToolMode: () => (state): NextState => {
        return sequence(state, [
            changeModeType({ type: ModeTypes.DrawingTool }),
        ]);
    },
    changeToFlagsMode: () => (state): NextState => {
        return sequence(state, [
            changeTouchType({ type: TouchTypes.Drawing }),
            changeModeType({ type: ModeTypes.Flags }),
        ]);
    },
    changeToUtilsMode: () => (state): NextState => {
        return sequence(state, [
            changeTouchType({ type: TouchTypes.Drawing }),
            changeModeType({ type: ModeTypes.Utils }),
        ]);
    },
    changeToShiftMode: () => (state): NextState => {
        return sequence(state, [
            changeTouchType({ type: TouchTypes.Drawing, clear: true }),
            changeModeType({ type: ModeTypes.Slide }),
        ]);
    },
    changeToFillRowMode: () => (state): NextState => {
        return sequence(state, [
            changeTouchType({ type: TouchTypes.FillRow }),
            changeModeType({ type: ModeTypes.FillRow }),
            newState => ({
                mode: {
                    ...newState.mode,
                    piece: newState.mode.piece !== undefined ? newState.mode.piece : Piece.Gray,
                },
            }),
        ]);
    },
    changeToPieceMode: () => (state): NextState => {
        return sequence(state, [
            changeModeType({ type: ModeTypes.Piece }),
        ]);
    },
    changeToFillMode: () => (state): NextState => {
        return sequence(state, [
            changeTouchType({ type: TouchTypes.Fill }),
            changeModeType({ type: ModeTypes.Fill }),
        ]);
    },
    changeToDrawPieceMode: () => (state): NextState => {
        return sequence(state, [
            changeTouchType({ type: TouchTypes.Piece }),
            changeModeType({ type: ModeTypes.Piece }),
        ]);
    },
    changeToMovePieceMode: () => (state): NextState => {
        return sequence(state, [
            changeTouchType({ type: TouchTypes.MovePiece }),
            changeModeType({ type: ModeTypes.Piece }),
        ]);
    },
    changeToSelectPieceMode: () => (state): NextState => {
        return sequence(state, [
            changeModeType({ type: ModeTypes.SelectPiece }),
        ]);
    },
    changeScreen: ({ screen }) => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                screen,
            },
        };
    },
    changeCommentMode: ({ type }) => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                comment: type,
            },
        };
    },
    changeGhostVisible: ({ visible }) => (state): NextState => {
        if (state.mode.ghostVisible === visible) {
            return undefined;
        }
        return sequence(state, [
            (state) => {
                return {
                    mode: {
                        ...state.mode,
                        ghostVisible: visible,
                    },
                };
            },
            actions.reopenCurrentPage(),
        ]);
    },
};

const changeTouchType = (
    { type, clear = false }: { type: TouchTypes, clear?: boolean },
) => (state: State): NextState => {
    if (state.mode.touch === type) {
        if (clear) {
            return actions.removeUnsettledItems()(state);
        }
        return undefined;
    }

    return sequence(state, [
        actions.removeUnsettledItems(),
        () => ({
            mode: {
                ...state.mode,
                touch: type,
            },
        }),
    ]);
};

const changeModeType = ({ type }: { type: ModeTypes }) => (state: State): NextState => {
    if (state.mode.type === type) {
        return undefined;
    }

    return {
        mode: {
            ...state.mode,
            type,
        },
    };
};
