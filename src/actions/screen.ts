import { NextState, sequence } from './commons';
import { action, actions, main } from '../actions';
import { ModeTypes, Screens, TouchTypes } from '../lib/enums';
import { resources, State } from '../states';

export interface ScreenActions {
    changeToReaderScreen: () => action;
    changeToDrawerScreen: () => action;
    changeToDrawingMode: () => action;
    changeToDrawingToolMode: () => action;
    changeToFlagsMode: () => action;
    changeToDrawPieceMode: () => action;
    changeToMovePieceMode: () => action;
    changeScreen: (data: { screen: Screens }) => action;
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
    changeToDrawerScreen: () => (): NextState => {
        resources.konva.stage.reload((done) => {
            main.changeScreen({ screen: Screens.Editor });
            done();
        });
        return undefined;
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
    changeScreen: ({ screen }) => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                screen,
            },
        };
    },
};

const changeTouchType = ({ type }: { type: TouchTypes }) => (state: State): NextState => {
    if (state.mode.touch === type) {
        return undefined;
    }

    return sequence(state, [
        actions.fixInferencePiece(),
        actions.resetInferencePiece(),
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
