import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { State } from '../states';
import { localStorageWrapper } from '../memento';

export interface UserSettingsActions {
    copyUserSettingsToTemporary: () => action;
    commitUserSettings: () => action;
    keepGhostVisible: (data: { visible: boolean }) => action;
    keepLoop: (data: { enable: boolean }) => action;
}

export const userSettingsActions: Readonly<UserSettingsActions> = {
    copyUserSettingsToTemporary: () => (state): NextState => {
        return {
            temporary: {
                ...state.temporary,
                userSettings: {
                    ghostVisible: state.mode.ghostVisible,
                    loop: state.mode.loop,
                },
            },
        };
    },
    commitUserSettings: () => (state): NextState => {
        return sequence(state, [
            state.mode.ghostVisible !== state.temporary.userSettings.ghostVisible
                ? actions.changeGhostVisible({ visible: state.temporary.userSettings.ghostVisible })
                : undefined,
            state.mode.loop !== state.temporary.userSettings.loop
                ? actions.changeLoop({ enable: state.temporary.userSettings.loop })
                : undefined,
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
};

const saveToLocalStorage = (state: Readonly<State>): NextState => {
    localStorageWrapper.saveUserSettings({
        ghostVisible: state.mode.ghostVisible,
        loop: state.mode.loop,
    });
    return undefined;
};
