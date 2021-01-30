import { action } from '../actions';
import { NextState } from './commons';

export interface UserSettingsActions {
    keepGhostVisible: (data: { visible: boolean }) => action;
}

export const userSettingsActions: Readonly<UserSettingsActions> = {
    keepGhostVisible: ({ visible }) => (state): NextState => {
        if (!state.modal.userSettings) {
            return undefined;
        }

        return {
            modal: {
                ...state.modal,
                userSettings: {
                    ...state.modal.userSettings,
                    ghostVisible: visible,
                },
            },
        };
    },
};
