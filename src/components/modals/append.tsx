import { Component, ComponentWithText, px, style } from '../../lib/types';
import { h } from 'hyperapp';
import { resources } from '../../states';
import { i18n } from '../../locales/keys';
import { a, div, span, textarea } from '@hyperapp/html';

declare const M: any;

interface AppendFumenModalProps {
    errorMessage?: string;
    textAreaValue: string;
    actions: {
        closeAppendModal: () => void;
        updateFumenData: (data: { value: string }) => void;
        clearFumenData: () => void;
        commitAppendFumenData: (data: { position: 'next' | 'end' }) => void;
    };
}

export const AppendFumenModal: Component<AppendFumenModalProps> = (
    { textAreaValue, errorMessage, actions },
) => {
    const cancel = () => {
        actions.closeAppendModal();
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

        resources.modals.append = instance;
    };

    const ondestroy = () => {
        const modal = resources.modals.append;
        if (modal !== undefined) {
            modal.close();
        }
        resources.modals.append = undefined;
    };

    const update = ({ value }: { value: string }) => {
        actions.updateFumenData({ value });
    };

    const focus = () => {
        const element = document.getElementById('input-fumen');
        if (element !== null) {
            element.focus();
        }
    };

    const appendToEnd = () => {
        actions.commitAppendFumenData({ position: 'end' });
        focus();
    };

    const appendToNext = () => {
        actions.commitAppendFumenData({ position: 'next' });
        focus();
    };

    return (
        <div key="append-fumen-modal-top">
            <div key="mdl-append-fumen" datatest="mdl-append-fumen"
                 className="modal" oncreate={oncreate} ondestroy={ondestroy}>
                <div key="modal-content" className="modal-content">
                    <h4 key="append-fumen-label" dataTest="append-fumen-label">{i18n.AppendFumen.Title()}</h4>

                    <TextArea key="input-fumen" dataTest="input-fumen" id="input-fumen"
                              placeholder={i18n.AppendFumen.PlaceHolder()} error={errorMessage === undefined}
                              text={textAreaValue} actions={{ update }}
                    />

                    <span key="text-message" datatest="text-message" className="red-text text-accent-2"
                          style={style({ display: errorMessage !== undefined ? undefined : 'none' })}>
                        {errorMessage}
                    </span>
                </div>

                <div key="modal-footer" className="modal-footer">
                    <a href="#" key="btn-cancel" datatest="btn-cancel" id="btn-cancel"
                       className="waves-effect waves-teal btn-flat" onclick={cancel}>
                        {i18n.AppendFumen.Buttons.Cancel()}
                    </a>

                    <Button key="btn-append-to-next" datatest="btn-append-to-next" width={80} colorTheme="red"
                            enable={textAreaValue !== '' && errorMessage === undefined} onclick={() => appendToNext()}>
                        <ButtonIconContent iconSize={20} iconName="library_add">next</ButtonIconContent>
                    </Button>

                    <Button key="btn-append-to-end" datatest="btn-append-to-end" width={80} colorTheme="red"
                            enable={textAreaValue !== '' && errorMessage === undefined} onclick={() => appendToEnd()}>
                        <ButtonIconContent iconSize={20} iconName="library_add">end</ButtonIconContent>
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface ButtonProps {
    href?: string;
    onclick?: (event: MouseEvent) => void;
    key: string;
    datatest: string;
    width: number;
    colorTheme?: string;
    enable: boolean;
}

export const Button: ComponentWithText<ButtonProps> = (
    { href = '#', key, onclick, datatest, width, colorTheme, enable }, contents,
) => {
    const className = colorTheme !== undefined
        ? `waves-effect waves-light ${colorTheme} btn white-text ${enable ? '' : 'disabled'}`
        : `waves-effect waves-teal btn-flat black-text ${enable ? '' : 'disabled'}`;

    return <a href="#" key={key} datatest={datatest} className={className} onclick={onclick}
              style={style({
                  margin: '0px 5px',
                  padding: px(5),
                  width: px(width),
                  maxWidth: px(width),
                  textAlign: 'center',
              })}>
        <div style={style({
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
        })}>
            {contents}
        </div>
    </a>;
};

interface ButtonIconContentProps {
    iconName: string;
    iconSize: number;
    textSize?: number;
}

export const ButtonIconContent: ComponentWithText<ButtonIconContentProps> = (
    { iconSize, iconName, textSize = 13 }, content: string,
) => {
    return <div>
        <i className="material-icons left"
           style={style({
               display: 'block',
               fontSize: px(iconSize),
               border: 'solid 0px #000',
               marginRight: px(2),
               cursor: 'pointer',
           })}>
            {iconName}
        </i>
        <span style={style({ fontSize: px(textSize) })}>
            {content}
        </span>
    </div>;
};

interface TextAreaProps {
    id: string;
    key: string;
    dataTest: string;
    placeholder: string;
    error: boolean;
    text: string;
    actions: {
        update: (data: { value: string }) => void;
    };
}

export const TextArea: Component<TextAreaProps> = (
    { id, key, dataTest, placeholder, error, text, actions },
) => {
    const textAreaStyle = style({
        width: '100%',
        border: error ? undefined : 'solid 1px #ff5252',
    });

    const oncreate = (element: HTMLInputElement) => {
        element.value = text;
    };

    const oninput = (event: KeyboardEvent) => {
        if (event.target !== null) {
            const target = event.target as HTMLInputElement;
            actions.update({ value: target.value });
        }
    };

    const onenter = (event: KeyboardEvent) => {
        if (event.target !== null) {
            const target = event.target as HTMLInputElement;
            target.blur();
        }
    };

    let lastComposingOnEnterDown = true;

    const onkeydown = (event: KeyboardEvent) => {
        // 最後にEnterを押されたときのisComposingを記録する
        // IMEで変換しているときはtrueになる
        if (event.key === 'Enter') {
            lastComposingOnEnterDown = event.isComposing;
        }
    };

    const onkeyup = (event: KeyboardEvent) => {
        // 最後にエンターが押されたか (IMEには反応しない)
        if (!event.isComposing && !lastComposingOnEnterDown && event.key === 'Enter') {
            onenter(event);
        }
    };

    return textarea({
        id,
        key,
        dataTest,
        placeholder,
        oncreate,
        oninput,
        onkeydown,
        onkeyup,
        rows: 3,
        style: textAreaStyle,
    });
};
