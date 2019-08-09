import { h } from 'hyperapp';
import { i18n } from '../../locales/keys';
import { style } from '../../lib/types';
import { componentize } from '../componentize';
import { managers } from '../../repository/managers';
import { createModal } from '../modal';
import { Scenes } from '../../repository/modals/manager';

interface Props {
}

interface Actions {
    loadFumen: (data: { fumen: string }) => any;
}

interface Locals {
    textAreaValue: string;
    errorMessage: string | undefined;
}

export const OpenFumenModal = componentize<Props, Actions, Locals>({
    textAreaValue: '',
    errorMessage: undefined,
}, (hub, initState, actions) => {
    // Members

    const modal = createModal('input-fumen', Scenes.Open);

    const getText = (): string => {
        const element = document.getElementById('input-fumen') as HTMLTextAreaElement;
        if (element === null) {
            return '';
        }
        return element.value !== '' ? element.value : '';
    };

    const focusAndSelect = () => {
        const element = document.getElementById('input-fumen') as HTMLTextAreaElement;
        if (element !== null) {
            element.focus();
            element.select();
        }
    };

    // Watches

    hub.watch('open-button-disable', (locals) => {
        return locals.errorMessage === undefined && locals.textAreaValue !== '';
    });

    hub.watch('error-message', locals => locals.errorMessage);

    // Callbacks

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

        hub.refresh();
    };

    const onBlurText = () => {
        hub.locals.textAreaValue = getText();
    };

    const cancel = () => {
        managers.modals.closeAll();
    };

    const open = () => {
        const value = getText();

        if (value !== undefined) {
            actions.loadFumen({ fumen: value })
                .catch((error: any) => {
                    hub.locals.errorMessage = error.message;
                    hub.refresh();
                    focusAndSelect();
                });
        }
    };

    return {
        render: (props, { errorMessage, textAreaValue }) => {
            const textAreaStyle = style({
                width: '100%',
                border: errorMessage !== undefined ? 'solid 1px #ff5252' : undefined,
            });

            const openClassVisibility = textAreaValue !== '' && errorMessage === undefined ? '' : ' disabled';
            const openClassName = `waves-effect waves-teal btn-flat${openClassVisibility}`;

            return (
                <div key="open-fumen-modal-top">
                    <div key="mdl-open-fumen" datatest="mdl-open-fumen"
                         className="modal" oncreate={modal.onCreate} ondestroy={modal.onDestroy}>
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

                            <a href="#" key="btn-open"
                               datatest="btn-open" id="btn-open"
                               className={openClassName} onclick={open}>
                                <i className="material-icons left">open_in_browser</i>
                                {i18n.OpenFumen.Buttons.Open()}
                            </a>
                        </div>
                    </div>
                </div>
            );
        },
    };
});
