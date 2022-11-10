import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { State } from '../states';
import { localStorageWrapper } from '../memento';
import { Piece } from '../lib/enums';

export interface UserSettingsActions {
    copyUserSettingsToTemporary: () => action;
    commitUserSettings: () => action;
    keepGhostVisible: (data: { visible: boolean }) => action;
    keepLoop: (data: { enable: boolean }) => action;
    keepGradient: (data: { gradient: string }) => action;
}

export const userSettingsActions: Readonly<UserSettingsActions> = {
    copyUserSettingsToTemporary: () => (state): NextState => {
        return {
            temporary: {
                ...state.temporary,
                userSettings: {
                    ghostVisible: state.mode.ghostVisible,
                    loop: state.mode.loop,
                    gradient: gradientToStr(state.mode.gradient),
                },
            },
        };
    },
    commitUserSettings: () => (state): NextState => {
        return sequence(state, [
            actions.changeGhostVisible({ visible: state.temporary.userSettings.ghostVisible }),
            actions.changeLoop({ enable: state.temporary.userSettings.loop }),
            actions.changeGradient({ gradientStr: state.temporary.userSettings.gradient }),
            saveToLocalStorage,
            actions.reopenCurrentPage(),
        ]);
    },
    keepGhostVisible: ({ visible }) => (state): NextState => {
        if (!state.modal.userSettings) {
            return undefined;
        }

        return {
            temporary: {
                ...state.temporary,
                userSettings: {
                    ...state.temporary.userSettings,
                    ghostVisible: visible,
                },
            },
        };
    },
    keepLoop: ({ enable }) => (state): NextState => {
        if (!state.modal.userSettings) {
            return undefined;
        }

        return {
            temporary: {
                ...state.temporary,
                userSettings: {
                    ...state.temporary.userSettings,
                    loop: enable,
                },
            },
        };
    },
    keepGradient: ({ gradient }) => (state): NextState => {
        if (!state.modal.userSettings) {
            return undefined;
        }

        return {
            temporary: {
                ...state.temporary,
                userSettings: {
                    ...state.temporary.userSettings,
                    gradient,
                },
            },
        };
    },
};

const saveToLocalStorage = (state: Readonly<State>): NextState => {
    localStorageWrapper.saveUserSettings({
        ghostVisible: state.mode.ghostVisible,
        loop: state.mode.loop,
        gradient: gradientToStr(state.mode.gradient),
    });
    return undefined;
};

export const gradientPieces = [Piece.I, Piece.L, Piece.O, Piece.Z, Piece.T, Piece.J, Piece.S];

const gradientToStr = (gradient: State['mode']['gradient']): string => {
    let str = '';
    for (const piece of gradientPieces) {
        str += (gradient[piece] || '0');
    }
    return str;
};
