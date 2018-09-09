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
                    element.click();
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
            const element = document.getElementById('btn-open');
            if (element !== null) {
                element.click();
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

    const openClassName = 'waves-effect waves-teal btn-flat' + (
        isEmptyTextArea || errorMessage !== undefined ? ' disabled' : ''
    );

    return (
        <div key="fumen-modal-top">
            <div datatest="mdl-open-fumen" className="modal" oncreate={oncreate} ondestroy={ondestroy}>
                <div className="modal-content">
                    <h4 dataTest="open-fumen-label">{i18n.OpenFumen.Title()}</h4>

                    <textarea dataTest="input-fumen" id="input-fumen" rows={3} style={textAreaStyle}
                              oninput={oninput} onblur={onblur}
                              value={textAreaValue} placeholder={i18n.OpenFumen.PlaceHolder()}/>

                    <span datatest="text-message" id="text-fumen-modal-error" className="red-text text-accent-2"
                          style={style({ display: errorMessage !== undefined ? undefined : 'none' })}>
                        {errorMessage}
                    </span>

                </div>

                <div className="modal-footer">
                    <a href="#" datatest="btn-cancel" id="btn-cancel" className="waves-effect waves-teal btn-flat"
                       onclick={cancel}>
                        {i18n.OpenFumen.Buttons.Cancel()}
                    </a>

                    <a href="#" datatest="btn-open" id="btn-open" className={openClassName} onclick={open}>
                        {i18n.OpenFumen.Buttons.Open()}
                    </a>
                </div>

                {/*
                    Focus用のボタンを用意する。ボタンは display: none で表示せず、Javascriptからtriggerされる
                  */}
                <a href="#" id="trigger-focus-fumen" style={style({ display: 'none' })}
                   onclick={() => {
                       const element = document.getElementById('input-fumen');
                       if (element !== null) {
                           element.focus();
                       }
                   }}>
                </a>
            </div>
        </div>
    );
};

interface MenuProps {
    version: string;
    pages: Page[];
    screen: Screens;
    currentIndex: number;
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
    };
}

export const MenuModal: Component<MenuProps> = ({ version, pages, screen, currentIndex, commentEnable, actions }) => {
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
        const data = 'v115@' + await encode(pages);

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
            <div datatest="mdl-open-fumen" className="modal bottom-sheet" oncreate={oncreate} ondestroy={ondestroy}>
                <div className="modal-content">

                    <h4>
                        {i18n.Menu.Title()}&nbsp;
                        <span style={style({ color: '#999', fontSize: '50%' })}>[{i18n.Menu.Build(version)}]</span>
                    </h4>

                    <div style={divProperties}>
                        {screen === Screens.Editor ?
                            <SettingButton datatest="btn-readonly" href="#" iconName="visibility" fontSize={31.25}
                                           onclick={() => {
                                               actions.changeToReaderScreen();
                                               actions.closeMenuModal();
                                           }}>{i18n.Menu.Buttons.Readonly()}</SettingButton>
                            : undefined}

                        {screen === Screens.Reader ?
                            <SettingButton datatest="btn-writable" href="#" iconName="mode_edit" fontSize={31.25}
                                           onclick={() => {
                                               actions.changeToDrawerScreen();
                                               actions.changeToDrawingToolMode();
                                               actions.closeMenuModal();
                                           }}>{i18n.Menu.Buttons.Writable()}</SettingButton>
                            : undefined}

                        <SettingButton datatest="btn-copy-fumen" href="#" iconName="content_copy"
                                       fontSize={29.3} onclick={copyOnClick}>
                            {i18n.Menu.Buttons.Clipboard()}
                        </SettingButton>

                        <SettingButton datatest="btn-new-fumen" href="#" iconName="insert_drive_file" fontSize={32.3}
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

                        <SettingButton datatest="btn-first-page" href="#" iconName="fast_rewind" fontSize={32.3}
                                       onclick={() => {
                                           actions.firstPage();
                                           actions.closeMenuModal();
                                       }}>
                            {i18n.Menu.Buttons.FirstPage()}
                        </SettingButton>

                        <SettingButton datatest="btn-last-page" href="#" iconName="fast_forward" fontSize={32.3}
                                       onclick={() => {
                                           actions.lastPage();
                                           actions.closeMenuModal();
                                       }}>
                            {i18n.Menu.Buttons.LastPage()}
                        </SettingButton>

                        <SettingButton datatest={commentEnable ? 'btn-comment-readonly' : 'btn-comment-writable'}
                                       href="#" iconName="text_fields" fontSize={32.3}
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

                        <SettingButton href="./help.html" iconName="help_outline" fontSize={31.25}>
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
    datatest?: string;
    fontSize: number;
    enable?: boolean;
}

export const SettingButton: ComponentWithText<SettingButtonProps> = (
    { href = '#', onclick, iconName, datatest, fontSize, enable = true }, showName,
    ) => (
        <a href={href} onclick={onclick !== undefined ? (event: MouseEvent) => {
            onclick(event);
            event.stopPropagation();
            event.preventDefault();
        } : undefined}>
            <i className={`material-icons z-depth-1${enable ? ' ' : 'disable'}`} style={style({
                width: px(50),
                height: px(40),
                lineHeight: px(40),
                fontSize: px(fontSize),
                display: 'block',
                color: enable ? '#333' : '#bdbdbd',
                margin: px(5),
                border: `solid 1px ${enable ? '#999' : '#bdbdbd'}`,
                boxSizing: 'border-box',
                textAlign: 'center',
                cursor: 'pointer',
            })}>{iconName}</i>

            <div datatest={datatest} style={style({ textAlign: 'center', color: enable ? '#333' : '#bdbdbd' })}>
                {showName}
            </div>
        </a>
    )
;
