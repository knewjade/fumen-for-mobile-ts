import { Component, ComponentWithText, px, style } from '../../lib/types';
import { h } from 'hyperapp';
import { resources } from '../../states';
import { i18n } from '../../locales/keys';
import { a, div, span } from '@hyperapp/html';

declare const M: any;

interface AppendFumenModalProps {
    errorMessage?: string;
    textAreaValue: string;
    currentIndex: number;
    maxPage: number;
    actions: {
        closeAppendModal: () => void;
        inputFumenData(data: { value?: string }): void;
        clearFumenData: () => void;
        appendFumen(data: { fumen: string, pageIndex: number }): void;
    };
}

export const AppendFumenModal: Component<AppendFumenModalProps> = (
    { textAreaValue, errorMessage, currentIndex, maxPage, actions },
) => {
    const oncreate = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onOpenEnd: () => {
                const element = document.getElementById('input-fumen');
                if (element !== null) {
                    element.focus();
                }
            },
            onCloseStart: () => {
                actions.closeAppendModal();
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

    const cancel = () => {
        actions.closeAppendModal();
        actions.clearFumenData();
    };

    const appendToEnd = () => {
        const value = getInputText();
        actions.inputFumenData({ value });

        if (value !== undefined) {
            actions.appendFumen({ fumen: value, pageIndex: maxPage });
        }

        const element = document.getElementById('input-fumen');
        if (element !== null) {
            element.focus();
        }
    };

    const appendToNext = () => {
        const value = getInputText();
        actions.inputFumenData({ value });

        if (value !== undefined) {
            actions.appendFumen({ fumen: value, pageIndex: currentIndex + 1 });
        }

        const element = document.getElementById('input-fumen');
        if (element !== null) {
            element.focus();
        }
    };

    return (
        <div key="append-fumen-modal-top">
            <div key="mdl-append-fumen" datatest="mdl-append-fumen"
                 className="modal" oncreate={oncreate} ondestroy={ondestroy}>
                <div key="modal-content" className="modal-content">
                    <h4 key="append-fumen-label" dataTest="append-fumen-label">{i18n.AppendFumen.Title()}</h4>

                    <textarea key="input-fumen" dataTest="input-fumen" id="input-fumen" rows={3} style={textAreaStyle}
                              oninput={oninput} onblur={onblur}
                              value={textAreaValue} placeholder={i18n.AppendFumen.PlaceHolder()}/>

                    <span key="text-message" datatest="text-message" className="red-text text-accent-2"
                          style={style({ display: errorMessage !== undefined ? undefined : 'none' })}>
                        {errorMessage}
                    </span>
                </div>

                <div key="modal-footer" className="modal-footer">
                    <Button key="btn-cancel" datatest="btn-cancel" width={40} enable={true}
                            onclick={() => cancel()}>
                        <ButtonIconContent iconSize={20} iconName="delete"/>
                    </Button>

                    <Button key="btn-append-to-next" datatest="btn-append-to-next" width={80} colorTheme="teal"
                            enable={textAreaValue !== '' && errorMessage === undefined} onclick={() => appendToNext()}>
                        <ButtonIconContent iconSize={20} iconName="library_add">next</ButtonIconContent>
                    </Button>

                    <Button key="btn-append-to-end" datatest="btn-append-to-end" width={80} colorTheme="teal"
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
        ? `waves-effect waves-${colorTheme} btn white-text ${enable ? '' : 'disabled'}`
        : `waves-effect waves-light btn-flat black-text ${enable ? '' : 'disabled'}`;

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
