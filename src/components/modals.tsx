import { Component, px, style } from '../lib/types';
import { h } from 'hyperapp';
import { resources } from '../states';
import { i } from '@hyperapp/html';

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
    actions: {
        closeSettingsModal: () => void;
    };
}

export const SettingsModal: Component<SettingsProps> = ({ version, actions }) => {
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

    const properties = style({
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

                    <div style={properties}>
                        <a href="./help.html">
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
                            })}>help_outline</i>
                            <div style={style({ textAlign: 'center', color: '#333' })}>help</div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
