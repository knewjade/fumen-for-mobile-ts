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

// TODO: Remove
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
        return undefined;
    },
    openMenuModal: () => (): NextState => {
        managers.modals.next(Scenes.Menu);
        return undefined;
    },
    openAppendModal: () => (): NextState => {
        managers.modals.next(Scenes.Append);
        return undefined;
    },
    openClipboardModal: () => (): NextState => {
        managers.modals.next(Scenes.Clipboard);
        return undefined;
    },
    closeFumenModal: () => (): NextState => {
        managers.modals.close(Scenes.Open);
        return undefined;
    },
    closeMenuModal: () => (): NextState => {
        managers.modals.close(Scenes.Menu);
        return undefined;
    },
    closeAppendModal: () => (): NextState => {
        managers.modals.close(Scenes.Append);
        return undefined;
    },
    closeClipboardModal: () => (): NextState => {
        managers.modals.close(Scenes.Clipboard);
        return undefined;
    },
    closeAllModals: () => (): NextState => {
        managers.modals.closeAll();
        return undefined;
    },
};
