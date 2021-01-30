import { Component, style } from '../../lib/types';
import { h } from 'hyperapp';
import { resources } from '../../states';
import { i18n } from '../../locales/keys';

declare const M: any;

interface OpenFumenModalProps {
    errorMessage?: string;
    textAreaValue: string;
    actions: {
        closeFumenModal: () => void;
        inputFumenData(data: { value?: string }): void;
        clearFumenData: () => void;
        loadFumen(data: { fumen: string }): void;
    };
}

export const OpenFumenModal: Component<OpenFumenModalProps> = ({ textAreaValue, errorMessage, actions }) => {
    const cancel = () => {
        actions.closeFumenModal();
        actions.clearFumenData();
    };

    const oncreate = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onOpenEnd: () => {
                const element = document.getElementById('input-fumen');
                if (element !== null) {
                    element.focus();
                }
            },
            onCloseStart: () => {
                cancel();
            },
        });

        instance.open();

        resources.modals.fumen = instance;
    };

    const ondestroy = () => {
        const modal = resources.modals.fumen;
        if (modal !== undefined) {
            modal.close();
        }
        resources.modals.fumen = undefined;
    };

    const textAreaStyle = style({
        width: '100%',
        border: errorMessage !== undefined ? 'solid 1px #ff5252' : undefined,
    });

    const oninput = (e: TextEvent) => {
        const inputType = (e as any).inputType;
        if (inputType === 'insertLineBreak') {
            const element = document.getElementById('btn-open');
            if (element !== null) {
                element.click();
            }
            return;
        }

        // エラーメッセージがある状態で文字を入力したとき or
        // もともとのテキストエリアが空のとき or
        // 現在のテキストエリアが空のとき
        {
            const value = getInputText();
            const inputText = value !== undefined && value !== null ? value : '';
            if (errorMessage !== undefined || inputText === '' || textAreaValue === '') {
                actions.inputFumenData({ value: inputText });
            }
        }
    };

    const onblur = () => {
        const value = getInputText();
        if (textAreaValue !== value) {
            actions.inputFumenData({ value });
        }
    };

    const getInputText = (): string | undefined => {
        const element = document.getElementById('input-fumen') as HTMLTextAreaElement;
        if (element === null) {
            return undefined;
        }
        return element.value !== '' ? element.value : '';
    };

    const open = () => {
        const value = getInputText();
        actions.inputFumenData({ value });

        if (value !== undefined) {
            actions.loadFumen({ fumen: value });
        }

        const element = document.getElementById('input-fumen');
        if (element !== null) {
            element.focus();
        }
    };

    const openClassVisibility = textAreaValue !== '' && errorMessage === undefined ? '' : ' disabled';
    const openClassName = `waves-effect waves-light btn red${openClassVisibility}`;

    return (
        <div key="open-fumen-modal-top">
            <div key="mdl-open-fumen" datatest="mdl-open-fumen"
                 className="modal" oncreate={oncreate} ondestroy={ondestroy}>
                <div key="modal-content" className="modal-content">
                    <h4 key="open-fumen-label" dataTest="open-fumen-label">{i18n.OpenFumen.Title()}</h4>

                    <textarea key="input-fumen" dataTest="input-fumen" id="input-fumen" rows={3} style={textAreaStyle}
                              oninput={oninput} onblur={onblur}
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
};
