import { h } from 'hyperapp';
import { i18n } from '../../locales/keys';
import { style } from '../../lib/types';
import { componentize } from '../componentize';

declare const M: any;

interface PActions {
    closeFumenModal: () => void;

    loadFumen(data: { fumen: string }): void;

    refresh: () => void;
}

interface Locals {
    textAreaValue: string;
    errorMessage: string | undefined;
}

export const OpenFumenModal = componentize<{}, PActions, Locals>({
    textAreaValue: '',
    errorMessage: undefined,
}, (initState, actions, hub) => {
    // Members

    let modalInstance: { close: () => void } | undefined;

    const getText = (): string => {
        const element = document.getElementById('input-fumen') as HTMLTextAreaElement;
        if (element === null) {
            return '';
        }
        return element.value !== '' ? element.value : '';
    };

    // Callbacks

    const onCreateModal = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onOpenEnd: () => {
                const element = document.getElementById('input-fumen');
                if (element !== null) {
                    element.focus();
                }
            },
            onCloseStart: () => {
                actions.closeFumenModal();
            },
        });

        instance.open();

        modalInstance = instance;
    };

    const onDestoryModal = () => {
        if (modalInstance !== undefined) {
            modalInstance.close();
        }
    };

    const onInputText = (e: TextEvent) => {
        const inputType = (e as any).inputType;
        if (inputType === 'insertLineBreak') {
            const element = document.getElementById('btn-open');
            if (element !== null) {
                element.click();
            }
            return;
        }

        hub.locals.textAreaValue = getText();
        hub.locals.errorMessage = undefined;

        const onChanged = hub.watch('open-button-disable', (
            hub.locals.errorMessage === undefined && hub.locals.textAreaValue !== ''
        ));

        if (onChanged) {
            hub.refresh();
        }
    };

    const onBlurText = () => {
        hub.locals.textAreaValue = getText();
    };

    const cancel = () => {
        actions.closeFumenModal();
    };

    const open = () => {
        const value = getText();

        if (value !== undefined) {
            actions.loadFumen({ fumen: value });
        }

        const element = document.getElementById('input-fumen');
        if (element !== null) {
            element.focus();
        }
    };

    return {
        render: (state, { errorMessage, textAreaValue }) => {
            const textAreaStyle = style({
                width: '100%',
                border: errorMessage !== undefined ? 'solid 1px #ff5252' : undefined,
            });

            const openClassVisibility = textAreaValue !== '' && errorMessage === undefined ? '' : ' disabled';
            const openClassName = `waves-effect waves-teal btn-flat${openClassVisibility}`;

            return (
                <div key="open-fumen-modal-top">
                    <div key="mdl-open-fumen" datatest="mdl-open-fumen"
                         className="modal" oncreate={onCreateModal} ondestroy={onDestoryModal}>
                        <div key="modal-content" className="modal-content">
                            <h4 key="open-fumen-label" dataTest="open-fumen-label">{i18n.OpenFumen.Title()}</h4>

                            <textarea key="input-fumen" dataTest="input-fumen" id="input-fumen" rows={3}
                                      style={textAreaStyle}
                                      oninput={onInputText}
                                      onblur={onBlurText}
                                      value={textAreaValue} placeholder={i18n.OpenFumen.PlaceHolder()}/>

                            <span key="text-message" datatest="text-message" className="red-text text-accent-2"
                                  style={style({ display: errorMessage !== undefined ? undefined : 'none' })}>
                    {errorMessage}
                </span>
                        </div>

                        <div key="modal-footer" className="modal-footer">
                            <a href="#" key="btn-cancel" datatest="btn-cancel" id="btn-cancel"
                               className="waves-effect waves-teal btn-flat" onclick={cancel}>
                                {i18n.OpenFumen.Buttons.Cancel()}
                            </a>

                            <a href="#" key="btn-open" datatest="btn-open" id="btn-open"
                               className={openClassName} onclick={open}>
                                {i18n.OpenFumen.Buttons.Open()}
                            </a>
                        </div>
                    </div>
                </div>
            );
        },
    };
});
