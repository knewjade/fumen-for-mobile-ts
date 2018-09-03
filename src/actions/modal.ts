import { NextState, sequence } from './commons';
import { action } from '../actions';

export interface ModalActions {
    showOpenErrorMessage: (data: { message: string }) => action;
    openFumenModal: () => action;
    openMenuModal: () => action;
    closeFumenModal: () => action;
    closeMenuModal: () => action;
}

export const modalActions: Readonly<ModalActions> = {
    showOpenErrorMessage: ({ message }) => (state): NextState => {
        return sequence(state, [
            modalActions.openFumenModal(),
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
};
