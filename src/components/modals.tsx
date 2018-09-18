import { Component, ComponentWithText, px, style } from '../lib/types';
import { h } from 'hyperapp';
import { resources } from '../states';
import { i } from '@hyperapp/html';
import { encode, Page } from '../lib/fumen/fumen';
import { Screens } from '../lib/enums';
import { i18n } from '../locales/keys';

declare const M: any;

interface OpenFumenModalProps {
    errorMessage?: string;
    textAreaValue?: string;
    actions: {
        closeFumenModal: () => void;
        inputFumenData(data: { value?: string }): void;
        clearFumenData: () => void;
        loadFumen(data: { fumen: string }): void;
    };
}

export const OpenFumenModal: Component<OpenFumenModalProps> = ({ textAreaValue, errorMessage, actions }) => {
    const oncreate = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onOpenEnd: () => {
                // Focus用のボタンをクリック
                const element = document.getElementById('trigger-focus-fumen');
                if (element !== null) {
                    element.focus();
                }
            },
            onCloseStart: () => {
                actions.closeFumenModal();
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

    const isEmptyTextArea = textAreaValue === undefined;
    const oninput = (e: TextEvent) => {
        const inputType = (e as any).inputType;
        if (inputType === 'insertLineBreak') {
            const element = document.getElementById('#input-fumen');
            if (element !== null) {
                element.focus();
            }
            return;
        }

        if (e.target === null) {
            return;
        }

        const target = e.target as HTMLTextAreaElement;
        const isEmptyTextAreaNow = target.value === '';
        if (errorMessage !== undefined || isEmptyTextArea !== isEmptyTextAreaNow) {
            onblur(e);
        }
    };

    const onblur = (e: TextEvent) => {
        if (e.target === null) {
            return;
        }

        const target = e.target as HTMLTextAreaElement;
        const value = target.value !== '' ? target.value : undefined;
        actions.inputFumenData({ value });
    };

    const cancel = () => {
        actions.closeFumenModal();
        actions.clearFumenData();
    };

    const open = () => {
        const selector = document.body.querySelector('#input-fumen');
        if (!selector) {
            return;
        }

        const target = selector as HTMLTextAreaElement;
        if (target.value !== undefined && target.value !== '') {
            actions.loadFumen({ fumen: target.value });
        }
    };

    const openClassVisibility = isEmptyTextArea || errorMessage !== undefined ? ' disabled' : '';
    const openClassName = `waves-effect waves-teal btn-flat${openClassVisibility}`;

    return (
        <div key="fumen-modal-top">
            <div key="mdl-open-fumen" datatest="mdl-open-fumen"
                 className="modal" oncreate={oncreate} ondestroy={ondestroy}>
                <div key="modal-content" className="modal-content">
                    <h4 key="open-fumen-label" dataTest="open-fumen-label">{i18n.OpenFumen.Title()}</h4>

                    <textarea key="input-fumen" dataTest="input-fumen" id="input-fumen" rows={3} style={textAreaStyle}
                              oninput={oninput} onblur={onblur}
                              value={textAreaValue} placeholder={i18n.OpenFumen.PlaceHolder()}/>

                    <span key="text-message" datatest="text-message" id="text-fumen-modal-error"
                          className="red-text text-accent-2"
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

interface MenuProps {
    version: string;
    pages: Page[];
    screen: Screens;
    currentIndex: number;
    maxPageIndex: number;
    commentEnable: boolean;
    actions: {
        closeMenuModal: () => void;
        changeToReaderScreen: () => void;
        changeToDrawerScreen: () => void;
        changeToDrawingToolMode: () => void;
        changeCommentMode: (data: { enable: boolean }) => void;
        fixInferencePiece: () => void;
        clearInferencePiece: () => void;
        loadNewFumen: () => void;
        firstPage: () => void;
        lastPage: () => void;
        clearToEnd: () => void;
        clearPast: () => void;
    };
}

export const MenuModal: Component<MenuProps> = (
    { version, pages, screen, currentIndex, maxPageIndex, commentEnable, actions },
) => {
    const oncreate = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onOpenEnd: () => {
                const element = document.getElementById('textarea-fumen');
                if (element !== null) {
                    element.focus();
                }
            },
            onCloseStart: () => {
                actions.closeMenuModal();
            },
        });

        instance.open();

        resources.modals.menu = instance;
    };

    const ondestroy = () => {
        const modal = resources.modals.menu;
        if (modal !== undefined) {
            modal.close();
        }
        resources.modals.menu = undefined;
    };

    const divProperties = style({
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'start',
        alignItems: 'center',
    });

    const copyOnClick = async () => {
        actions.fixInferencePiece();

        // テト譜の変換
        const encoded = await encode(pages);
        const data = `v115@${encoded}`;

        // コピー用のelementを作成
        const domain = i18n.Domains.Fumen();
        const element = document.createElement('pre');
        {
            const style = element.style;
            style.position = 'fixed';
            style.left = '-100%';
            element.textContent = domain + data;
            document.body.appendChild(element);
        }

        // クリップボードにコピーする
        if (element !== undefined && element !== null) {
            document.getSelection().selectAllChildren(element);
            const success = document.execCommand('copy');
            if (!success) {
                console.error('Cannot copy fumen');
            }
        } else {
            console.error('Unexpected element to copy');
        }

        M.toast({ html: 'Copied to clipboard', classes: 'mytoast', displayLength: 600 });

        // コピー用のelementを削除
        document.body.removeChild(element);

        // データをElementに保存する // 主にテスト用
        document.body.setAttribute('datatest', 'copied-fumen-data');
        document.body.setAttribute('data', data);
    };

    return (
        <div key="menu-modal-top">
            <div key="mdl-open-fumen" datatest="mdl-open-fumen"
                 className="modal bottom-sheet" oncreate={oncreate} ondestroy={ondestroy}>
                <div key="modal-content" className="modal-content">

                    <h4 key="memu-title">
                        {i18n.Menu.Title()}&nbsp;
                        <span style={style({ color: '#999', fontSize: '50%' })}>[{i18n.Menu.Build(version)}]</span>
                    </h4>

                    <div key="menu-top" style={divProperties}>
                        {screen === Screens.Editor ?
                            <SettingButton key="btn-readonly" datatest="btn-readonly"
                                           href="#" iconName="visibility" iconSize={31.25}
                                           onclick={() => {
                                               actions.changeToReaderScreen();
                                               actions.closeMenuModal();
                                           }}>{i18n.Menu.Buttons.Readonly()}</SettingButton>
                            : undefined}

                        {screen === Screens.Reader ?
                            <SettingButton key="btn-writable" datatest="btn-writable"
                                           href="#" iconName="mode_edit" iconSize={31.25}
                                           onclick={() => {
                                               actions.changeToDrawerScreen();
                                               actions.changeToDrawingToolMode();
                                               actions.closeMenuModal();
                                           }}>{i18n.Menu.Buttons.Writable()}</SettingButton>
                            : undefined}

                        <SettingButton key="btn-copy-fumen" datatest="btn-copy-fumen"
                                       href="#" iconName="content_copy" iconSize={29.3}
                                       onclick={copyOnClick}>
                            {i18n.Menu.Buttons.Clipboard()}
                        </SettingButton>

                        <SettingButton key="btn-new-fumen" datatest="btn-new-fumen"
                                       href="#" iconName="insert_drive_file" iconSize={32.3}
                                       onclick={() => {
                                           actions.fixInferencePiece();
                                           actions.clearInferencePiece();
                                           actions.loadNewFumen();
                                           actions.changeToDrawerScreen();
                                           actions.changeToDrawingToolMode();
                                           actions.closeMenuModal();
                                       }}>
                            {i18n.Menu.Buttons.New()}
                        </SettingButton>

                        <SettingButton key="btn-first-page" datatest="btn-first-page"
                                       href="#" iconName="fast_rewind" iconSize={32.3}
                                       onclick={() => {
                                           actions.firstPage();
                                           actions.closeMenuModal();
                                       }}>
                            {i18n.Menu.Buttons.FirstPage()}
                        </SettingButton>

                        <SettingButton key="btn-last-page" datatest="btn-last-page"
                                       href="#" iconName="fast_forward" iconSize={32.3}
                                       onclick={() => {
                                           actions.lastPage();
                                           actions.closeMenuModal();
                                       }}>
                            {i18n.Menu.Buttons.LastPage()}
                        </SettingButton>

                        <SettingButton key="btn-clear-to-end" datatest="btn-clear-to-end"
                                       href="#" iconName="flip_to_front" iconSize={32.3} textSize={12}
                                       enable={currentIndex < maxPageIndex - 1}
                                       onclick={() => {
                                           actions.clearToEnd();
                                           actions.closeMenuModal();
                                       }}>
                            {i18n.Menu.Buttons.ClearToEnd()}
                        </SettingButton>

                        <SettingButton key="btn-clear-past" datatest="btn-clear-past"
                                       href="#" iconName="flip_to_back" iconSize={32.3} textSize={12}
                                       enable={0 < currentIndex}
                                       onclick={() => {
                                           actions.clearPast();
                                           actions.closeMenuModal();
                                       }}>
                            {i18n.Menu.Buttons.ClearPast()}
                        </SettingButton>

                        <SettingButton key="btn-comment"
                                       datatest={commentEnable ? 'btn-comment-readonly' : 'btn-comment-writable'}
                                       href="#" iconName="text_fields" iconSize={32.3}
                                       enable={screen === Screens.Editor}
                                       onclick={screen === Screens.Editor ? () => {
                                           actions.changeCommentMode({ enable: !commentEnable });
                                           actions.closeMenuModal();
                                       } : () => {
                                           M.toast({
                                               html: i18n.Menu.Messages.NoAvailableCommentButton(),
                                               classes: 'mytoast',
                                               displayLength: 3000,
                                           });
                                       }}>

                            {commentEnable ? i18n.Menu.Buttons.ReadonlyComment() : i18n.Menu.Buttons.WritableComment()}
                        </SettingButton>

                        <SettingButton key="btn-help" datatest="btn-help"
                                       href="./help.html" iconName="help_outline" iconSize={31.25}>
                            {i18n.Menu.Buttons.Help()}
                        </SettingButton>

                        <div style={style({ height: px(10), width: '100%' })}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SettingButtonProps {
    href?: string;
    onclick?: (event: MouseEvent) => void;
    iconName: string;
    key: string;
    datatest: string;
    iconSize: number;
    textSize?: number;
    enable?: boolean;
}

export const SettingButton: ComponentWithText<SettingButtonProps> = (
    { href = '#', key, onclick, iconName, datatest, iconSize, textSize = 13, enable = true }, showName,
    ) => (
    <a key={key} href={href} onclick={onclick !== undefined ? (event: MouseEvent) => {
            onclick(event);
            event.stopPropagation();
            event.preventDefault();
        } : undefined}>
        <i key={`${key}-icon`} datatest={datatest}
           className={`material-icons z-depth-1 ${enable ? ' ' : 'disabled'}`}
           style={style({
               width: px(50),
               height: px(40),
               lineHeight: px(40),
               fontSize: px(iconSize),
               display: 'block',
               color: enable ? '#333' : '#bdbdbd',
               margin: px(5),
               border: `solid 1px ${enable ? '#999' : '#bdbdbd'}`,
               boxSizing: 'border-box',
               textAlign: 'center',
               cursor: 'pointer',
           })}>{iconName}</i>

        <div key={`${key}-text`}
             style={style({ textAlign: 'center', fontSize: px(textSize), color: enable ? '#333' : '#bdbdbd' })}>
                {showName}
            </div>
        </a>
    )
;
