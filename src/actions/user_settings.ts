import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { State } from '../states';
import { localStorageWrapper } from '../memento';

export interface UserSettingsActions {
    copyUserSettingsToTemporary: () => action;
    commitUserSettings: () => action;
    keepGhostVisible: (data: { visible: boolean }) => action;
}

export const userSettingsActions: Readonly<UserSettingsActions> = {
    copyUserSettingsToTemporary: () => (state): NextState => {
        return {
            temporary: {
                ...state.temporary,
                userSettings: {
                    ghostVisible: state.mode.ghostVisible,
                },
            },
        };
    },
    commitUserSettings: () => (state): NextState => {
        return sequence(state, [
            state.mode.ghostVisible !== state.temporary.userSettings.ghostVisible
                ? actions.changeGhostVisible({ visible: state.temporary.userSettings.ghostVisible })
                : undefined,
            saveToLocalStorage,
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
};

const saveToLocalStorage = (state: Readonly<State>): NextState => {
    localStorageWrapper.saveUserSettings({
        ghostVisible: state.mode.ghostVisible,
    });
    return undefined;
};
