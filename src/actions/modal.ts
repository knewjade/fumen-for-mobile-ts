import { NextState, sequence } from './commons';
import { action } from '../actions';

export interface ModalActions {
    showOpenErrorMessage: (data: { message: string }) => action;
    openFumenModal: () => action;
    openMenuModal: () => action;
    closeFumenModal: () => action;
    closeMenuModal: () => action;
    openAppendModal: () => action;
    closeAppendModal: () => action;
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
    openAppendModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                append: true,
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
    closeAllModals: () => (): NextState => {
        return {
            modal: {
                append: false,
                fumen: false,
                menu: false,
            },
        };
    },
};
