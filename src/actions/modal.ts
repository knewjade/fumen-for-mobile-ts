import { NextState, sequence } from './commons';
import { action } from '../actions';

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
    openFumenModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                fumen: true,
            },
        };
    },
    openMenuModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                menu: true,
            },
        };
    },
    openAppendModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                append: true,
            },
        };
    },
    openClipboardModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                clipboard: true,
            },
        };
    },
    closeFumenModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                fumen: false,
            },
        };
    },
    closeMenuModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                menu: false,
            },
        };
    },
    closeAppendModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                append: false,
            },
        };
    },
    closeClipboardModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                clipboard: false,
            },
        };
    },
    closeAllModals: () => (): NextState => {
        return {
            modal: {
                append: false,
                fumen: false,
                menu: false,
                clipboard: false,
            },
        };
    },
};
