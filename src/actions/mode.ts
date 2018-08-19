import { NextState } from './commons';
import { action, main } from '../actions';
import { Screens, TouchTypes } from '../lib/enums';
import { resources, State } from '../states';

export interface ModeActions {
    changeToReaderMode: () => action;
    changeToDrawerMode: () => action;
    changeToDrawingMode: () => action;
    changeToPieceMode: () => action;
    changeMode: (mode: Partial<State['mode']>) => action;
}

export const modeActions: Readonly<ModeActions> = {
    changeToReaderMode: () => (): NextState => {
        resources.konva.stage.reload((done) => {
            main.changeMode({ screen: Screens.Reader });
            done();
        });
        return undefined;
    },
    changeToDrawerMode: () => (): NextState => {
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
                touch: TouchTypes.Drawing,
            },
        };
    },
    changeToPieceMode: () => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                touch: TouchTypes.Piece,
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
