import { Component, ComponentWithText, px, style } from '../../lib/types';
import { h } from 'hyperapp';
import { resources } from '../../states';
import { i18n } from '../../locales/keys';
import { encode, Page } from '../../lib/fumen/fumen';
import { FumenError } from '../../lib/errors';

declare const M: any;

interface ClipboardModalProps {
    pages: Page[];
    actions: {
        closeClipboardModal: () => void;
    };
}

const buttonsStyle = () => {
    return style({
        margin: '0px auto',
        padding: '0px',
        display: 'flex',
        justifyContent: 'flex-end',
        flexDirection: 'column',
        alignItems: 'center',
    });
};

export const ClipboardModal: Component<ClipboardModalProps> = ({ actions, pages }) => {
    const oncreate = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onCloseStart: () => {
                actions.closeClipboardModal();
            },
        });

        instance.open();

        resources.modals.clipboard = instance;
    };

    const ondestroy = () => {
        const modal = resources.modals.clipboard;
        if (modal !== undefined) {
            modal.close();
        }
        resources.modals.clipboard = undefined;
    };

    const cancel = () => {
        actions.closeClipboardModal();
    };

    // テト譜の変換
    const encodePromise = (async () => {
        const encoded = await encode(pages);
        return `v115@${encoded}`;
    })();

    const clipboard = (domain: string) => () => {
        encodePromise
            .then((data) => {
                // データをElementに保存する // 主にテスト用
                document.body.setAttribute('datatest', 'copied-fumen-data');
                document.body.setAttribute('data', data);
                return data;
            })
            .then(data => `${domain}${data}`)
            .then((url) => {
                // コピー用のelementを作成
                const element = document.createElement('pre');
                if (element === undefined || element === null) {
                    throw new FumenError('no element');
                }

                {
                    const style = element.style;
                    style.position = 'fixed';
                    style.left = '-100%';
                    element.textContent = url;
                    document.body.appendChild(element);
                }

                // selection
                const selection = document.getSelection();
                if (selection === null) {
                    throw new FumenError('no selection');
                }

                // クリップボードにコピーする
                selection.selectAllChildren(element);
                const success = document.execCommand('copy');
                if (!success) {
                    throw new FumenError('command error');
                }

                // コピー用のelementを削除
                document.body.removeChild(element);
            })
            .then(() => {
                M.toast({ html: 'Copied to clipboard', classes: 'top-toast', displayLength: 600 });
            })
            .catch((error) => {
                M.toast({ html: `Failed to copy: ${error}`, classes: 'top-toast', displayLength: 1500 });
            });
    };

    const tinyurl = (domain: string) => () => {
        encodePromise
            .then(data => `${domain}${data}`)
            .then(encodeURIComponent)
            .then(url => window.open(`http://tinyurl.com/create.php?url=${url}`))
            .catch((error) => {
                M.toast({
                    html: `Failed to open tinyurl: ${error}`,
                    classes: 'top-toast',
                    displayLength: 1500,
                });
            });
    };

    return (
        <div key="clipboard-modal-top">
            <div key="mdl-clipboard" datatest="mdl-clipboard"
                 className="modal" oncreate={oncreate} ondestroy={ondestroy}>
                <div key="modal-content" className="modal-content">
                    <h4 key="clipboard-label" dataTest="clipboard-label">{i18n.Clipboard.Title()}</h4>

                    <div style={buttonsStyle()}>
                        <div>
                            <ClipboardButton key="btn-knewjade"
                                             onclick={clipboard('https://knewjade.github.io/fumen-for-mobile/#?d=')}>
                                knewjade.github.io
                            </ClipboardButton>

                            <ClipboardIconButton
                                key="btn-knewjade-tinyurl"
                                onclick={tinyurl('https://knewjade.github.io/fumen-for-mobile/#?d=')}>
                                archive
                            </ClipboardIconButton>
                        </div>

                        <div>
                            <ClipboardButton key="btn-zui-jp"
                                             onclick={clipboard('http://fumen.zui.jp/?')}>
                                fumen.zui.jp
                            </ClipboardButton>

                            <ClipboardIconButton key="btn-zui-jp-tinyurl"
                                                 onclick={tinyurl('http://fumen.zui.jp/?')}>
                                archive
                            </ClipboardIconButton>
                        </div>

                        <div>
                            <ClipboardButton key="btn-harddrop"
                                             onclick={clipboard('http://harddrop.com/fumen/?')}>
                                harddrop.com
                            </ClipboardButton>

                            <ClipboardIconButton key="btn-harddrop-tinyurl"
                                                 onclick={tinyurl('http://harddrop.com/fumen/?')}>
                                archive
                            </ClipboardIconButton>
                        </div>

                        <div>
                            <ClipboardButton key="btn-raw-fumen" colorName="white black-text"
                                             onclick={clipboard('')}>
                                Raw data
                            </ClipboardButton>
                        </div>
                    </div>
                </div>

                <div key="modal-footer" className="modal-footer">
                    <a href="#" key="btn-clipboard-cancel" datatest="btn-clipboard-cancel" id="btn-clipboard-cancel"
                       className="waves-effect waves-teal btn-flat" onclick={cancel}>
                        {i18n.Clipboard.Buttons.Close()}
                    </a>
                </div>
            </div>
        </div>
    );
};

interface ClipboardButtonProps {
    key: string;
    onclick: () => void;
    colorName?: string
    textSize?: number;
    padding?: number;
}

export const ClipboardButton: ComponentWithText<ClipboardButtonProps> = (
    { key, onclick, colorName = 'red white-text', padding = 8, textSize = 17 }, text,
) => {
    const onClickFunc = (event: MouseEvent) => {
        onclick();
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <a href="#" key={key} datatest={key} id={key} fontSize={px(textSize)}
           style={style({
               minWidth: px(185),
               margin: px(5),
               paddingLeft: px(padding),
               paddingRight: px(padding),
           })}
           className={`waves-effect waves-teal btn ${colorName}`} onclick={onClickFunc}>
            {text}
        </a>
    );
};

export const ClipboardIconButton: ComponentWithText<ClipboardButtonProps> = (
    { key, onclick, padding = 10, textSize = 20 }, iconName,
) => {
    const onClickFunc = (event: MouseEvent) => {
        onclick();
        event.stopPropagation();
        event.preventDefault();
    };

    const properties = style({
        display: 'block',
        fontSize: px(textSize),
        border: 'solid 0px #000',
        marginRight: px(2),
        cursor: 'pointer',
    });

    return (
        <a href="#" key={key} datatest={key} id={key} fontSize={px(textSize)}
           style={style({ margin: px(5), paddingLeft: px(padding), paddingRight: px(padding) })}
           className="waves-effect waves-teal btn white black-text" onclick={onClickFunc}>
            <i className="material-icons" style={properties}>{iconName}</i>
        </a>
    );
};
