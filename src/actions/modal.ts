import { NextState, sequence } from './commons';
import { action } from '../actions';
import { managers } from '../repository/managers';
import { Scenes } from '../repository/modals/manager';

export interface ModalActions {
    showOpenErrorMessage: (data: { message: string }) => action;
    openFumenModal: () => action;
    openMenuModal: () => action;
    openAppendModal: () => action;
    openClipboardModal: () => action;
    closeFumenModal: () => action;
    closeMenuModal: () => action;
    closeAppendModal: () => action;
    closeClipboardModal: () => action;
    closeAllModals: () => action;
}

export const modalActions: Readonly<ModalActions> = {
    showOpenErrorMessage: ({ message }) => (state): NextState => {
        return sequence(state, [
            () => ({
                fumen: {
                    ...state.fumen,
                    errorMessage: message,
                },
            }),
        ]);
    },
    openFumenModal: () => (): NextState => {
        managers.modals.next(Scenes.Open);
        return {};
    },
    openMenuModal: () => (): NextState => {
        managers.modals.next(Scenes.Menu);
        return {};
    },
    openAppendModal: () => (): NextState => {
        managers.modals.next(Scenes.Append);
        return {};
    },
    openClipboardModal: () => (): NextState => {
        managers.modals.next(Scenes.Clipboard);
        return {};
    },
    closeFumenModal: () => (): NextState => {
        managers.modals.close(Scenes.Open);
        return {};
    },
    closeMenuModal: () => (): NextState => {
        managers.modals.close(Scenes.Menu);
        return {};
    },
    closeAppendModal: () => (): NextState => {
        managers.modals.close(Scenes.Append);
        return {};
    },
    closeClipboardModal: () => (): NextState => {
        managers.modals.close(Scenes.Clipboard);
        return {};
    },
    closeAllModals: () => (): NextState => {
        managers.modals.closeAll();
        return {};
    },
};
