import { NextState, sequence } from './commons';
import { action } from '../actions';
import { factories } from '../repository/factories';
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
        factories.modals.next(Scenes.Open);
        return {};
    },
    openMenuModal: () => (): NextState => {
        factories.modals.next(Scenes.Menu);
        return {};
    },
    openAppendModal: () => (): NextState => {
        factories.modals.next(Scenes.Append);
        return {};
    },
    openClipboardModal: () => (): NextState => {
        factories.modals.next(Scenes.Clipboard);
        return {};
    },
    closeFumenModal: () => (): NextState => {
        factories.modals.close();
        return {};
    },
    closeMenuModal: () => (): NextState => {
        factories.modals.close();
        return {};
    },
    closeAppendModal: () => (): NextState => {
        factories.modals.close();
        return {};
    },
    closeClipboardModal: () => (): NextState => {
        factories.modals.close();
        return {};
    },
    closeAllModals: () => (): NextState => {
        factories.modals.closeAll();
        return {};
    },
};
