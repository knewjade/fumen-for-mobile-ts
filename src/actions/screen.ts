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
    changeMode: (mode: Partial<State['mode']>) => action;
}

export const modeActions: Readonly<ScreenActions> = {
    changeToReaderScreen: () => (state): NextState => {
        resources.konva.stage.reload((done) => {
            main.changeMode({ screen: Screens.Reader });
            done();
        });
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.resetInferencePiece(),
        ]);
    },
    changeToDrawerScreen: () => (): NextState => {
        resources.konva.stage.reload((done) => {
            main.changeMode({ screen: Screens.Editor });
            done();
        });
        return undefined;
    },
    changeToDrawingMode: () => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                type: ModeTypes.Drawing,
                touch: TouchTypes.Drawing,
            },
        };
    },
    changeToDrawingToolMode: () => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                type: ModeTypes.DrawingTool,
            },
        };
    },
    changeToFlagsMode: () => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                type: ModeTypes.Flags,
            },
        };
    },
    changeMode: mode => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                ...mode,
            },
        };
    },
};
