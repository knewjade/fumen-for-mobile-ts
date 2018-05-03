import { Component, ComponentWithText, px, style } from '../lib/types';
import { h } from 'hyperapp';
import { resources } from '../states';
import { i } from '@hyperapp/html';
import { encode, Page } from '../lib/fumen/fumen';

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

                    <h4>テト譜を開く</h4>

                    <textarea dataTest="input-fumen" rows={3} style={textAreaStyle} oninput={oninput}
                              value={textAreaValue} placeholder="URL or v115@~ / Support v115 only"/>

                    <span datatest="text-message" id="text-fumen-modal-error" className="red-text text-accent-2"
                          style={style({ display: errorMessage !== undefined ? undefined : 'none' })}>
                        {errorMessage}
                    </span>

                </div>
                <div className="modal-footer">

                    <a href="#" datatest="btn-cancel" className="waves-effect waves-teal btn-flat"
                       onclick={cancel}>Cancel</a>

                    <a href="#" datatest="btn-open" className={openClassName} onclick={open}>Open</a>
                </div>
            </div>
        </div>
    );
};

interface SettingsProps {
    version: string;
    pages: Page[];
    actions: {
        closeSettingsModal: () => void;
    };
}

export const SettingsModal: Component<SettingsProps> = ({ version, pages, actions }) => {
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

    return (
        <div key="settings-modal-top">
            <div datatest="mdl-open-fumen" className="modal bottom-sheet" oncreate={oncreate} ondestroy={ondestroy}>
                <div className="modal-content">

                    <h4>Settings <span style={style({ color: '#999', fontSize: '50%' })}>[build {version}]</span></h4>

                    <div style={divProperties}>
                        <SettingButton href="#" iconName="content_copy" onclick={async () => {
                            // テト譜の変換
                            const data = await encode(pages);

                            // コピー用のelementを作成
                            const element = document.createElement('pre');
                            {
                                const style = element.style;
                                style.position = 'fixed';
                                style.left = '-100%';
                                element.textContent = 'v115@' + data;
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
                        }}>clipboard</SettingButton>

                        <SettingButton href="./help.html" iconName="help_outline">help</SettingButton>

                        <div style={style({ height: px(10), width: '100%', backgroundColor: '#fff' })}/>

                    </div>
                </div>
            </div>
        </div>
    );
};


interface SettingButtonProps {
    href?: string;
    onclick?: () => void;
    iconName: string;
}

export const SettingButton: ComponentWithText<SettingButtonProps> = ({ href = '#', onclick, iconName }, showName) => (
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

        <div style={style({ textAlign: 'center', color: '#333' })}>
            {showName}
        </div>
    </a>
);
