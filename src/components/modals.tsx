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
        inputFumenData(data: { value: string }): void;
        clearFumenData: () => void;
        loadFumen(data: { fumen: string }): void;
    };
}

export const OpenFumenModal: Component<OpenFumenModalProps> = ({ textAreaValue, errorMessage, actions }) => {
    const oncreate = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onOpenEnd: () => {
                const element = document.getElementById('textarea-fumen');
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

    const oninput = (e: any) => {
        const value = e.target.value !== '' ? e.target.value : undefined;
        actions.inputFumenData({ value });
    };

    const cancel = () => {
        actions.closeFumenModal();
        actions.clearFumenData();
    };

    const open = () => {
        if (textAreaValue !== undefined) {
            actions.loadFumen({ fumen: textAreaValue });
        }
    };

    const openClassName = 'waves-effect waves-teal btn-flat' + (
        textAreaValue === undefined || errorMessage !== undefined ? ' disabled' : ''
    );

    return (
        <div key="fumen-modal-top">
            <div datatest="mdl-open-fumen" className="modal" oncreate={oncreate} ondestroy={ondestroy}>
                <div className="modal-content">

                    <h4 dataTest="open-fumen-label">{i18n.OpenFumen.Title()}</h4>

                    <textarea dataTest="input-fumen" rows={3} style={textAreaStyle} oninput={oninput}
                              value={textAreaValue} placeholder={i18n.OpenFumen.PlaceHolder()}/>

                    <span datatest="text-message" id="text-fumen-modal-error" className="red-text text-accent-2"
                          style={style({ display: errorMessage !== undefined ? undefined : 'none' })}>
                        {errorMessage}
                    </span>

                </div>
                <div className="modal-footer">

                    <a href="#" datatest="btn-cancel" className="waves-effect waves-teal btn-flat"
                       onclick={cancel}>
                        {i18n.OpenFumen.Buttons.Cancel()}
                    </a>

                    <a href="#" datatest="btn-open" className={openClassName} onclick={open}>
                        {i18n.OpenFumen.Buttons.Open()}
                    </a>
                </div>
            </div>
        </div>
    );
};

interface SettingsProps {
    version: string;
    pages: Page[];
    screen: Screens;
    currentIndex: number;
    actions: {
        closeSettingsModal: () => void;
        changeToReaderScreen: () => void;
        changeToDrawerScreen: () => void;
        fixInferencePiece: () => void;
    };
}

export const SettingsModal: Component<SettingsProps> = ({ version, pages, screen, currentIndex, actions }) => {
    const oncreate = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onOpenEnd: () => {
                const element = document.getElementById('textarea-fumen');
                if (element !== null) {
                    element.focus();
                }
            },
            onCloseStart: () => {
                actions.closeSettingsModal();
            },
        });

        instance.open();

        resources.modals.settings = instance;
    };

    const ondestroy = () => {
        const modal = resources.modals.settings;
        if (modal !== undefined) {
            modal.close();
        }
        resources.modals.settings = undefined;
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
        const element = document.createElement('pre');
        {
            const style = element.style;
            style.position = 'fixed';
            style.left = '-100%';
            element.textContent = data;
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
        <div key="settings-modal-top">
            <div datatest="mdl-open-fumen" className="modal bottom-sheet" oncreate={oncreate} ondestroy={ondestroy}>
                <div className="modal-content">

                    <h4>
                        {i18n.Settings.Title()}&nbsp;
                        <span style={style({ color: '#999', fontSize: '50%' })}>[{i18n.Settings.Build(version)}]</span>
                    </h4>

                    <div style={divProperties}>
                        {screen === Screens.Editor ?
                            <SettingButton href="#" iconName="insert_photo"
                                           onclick={() => {
                                               actions.changeToReaderScreen();
                                               actions.closeSettingsModal();
                                           }}>{i18n.Settings.Buttons.Readonly()}</SettingButton>
                            : undefined}

                        {screen === Screens.Reader ?
                            <SettingButton datatest="btn-writable" href="#" iconName="mode_edit"
                                           onclick={() => {
                                               actions.changeToDrawerScreen();
                                               actions.closeSettingsModal();
                                           }}>{i18n.Settings.Buttons.Writable()}</SettingButton>
                            : undefined}

                        <SettingButton datatest="btn-copy-fumen" href="#" iconName="content_copy" onclick={copyOnClick}>
                            {i18n.Settings.Buttons.Clipboard()}
                        </SettingButton>

                        <SettingButton href="./help.html" iconName="help_outline">
                            {i18n.Settings.Buttons.Help()}
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
}

export const SettingButton: ComponentWithText<SettingButtonProps> = (
    { href = '#', onclick, iconName, datatest }, showName,
) => (
    <a href={href} onclick={onclick}>
        <i className="material-icons z-depth-1" style={style({
            width: px(50),
            height: px(40),
            lineHeight: px(40),
            fontSize: px(31.25),
            display: 'block',
            color: '#333',
            margin: px(5),
            border: 'solid 1px #999',
            boxSizing: 'border-box',
            textAlign: 'center',
            cursor: 'pointer',
        })}>{iconName}</i>

        <div datatest={datatest} style={style({ textAlign: 'center', color: '#333' })}>
            {showName}
        </div>
    </a>
);
