import { NextState } from './commons';
import { action, main } from '../actions';
import { ModeTypes, Screens, TouchTypes } from '../lib/enums';
import { resources, State } from '../states';

export interface ScreenActions {
    changeToReaderScreen: () => action;
    changeToDrawerScreen: () => action;
    changeToDrawingMode: () => action;
    changeToDrawingToolMode: () => action;
    changeToPieceMode: () => action;
    changeMode: (mode: Partial<State['mode']>) => action;
}

export const modeActions: Readonly<ScreenActions> = {
    changeToReaderScreen: () => (): NextState => {
        resources.konva.stage.reload((done) => {
            main.changeMode({ screen: Screens.Reader });
            done();
        });
        return undefined;
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
    changeToPieceMode: () => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                type: ModeTypes.Piece,
                touch: TouchTypes.Piece,
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
    changeMode: mode => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                ...mode,
            },
        };
    },
};
