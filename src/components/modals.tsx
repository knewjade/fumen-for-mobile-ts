import { Component, style } from '../lib/types';
import { h } from 'hyperapp';
import { resources } from '../states';

declare const M: any;

interface Props {
    errorMessage?: string;
    textAreaValue?: string;
    actions: {
        closeFumenModal: () => void;
        inputFumenData(data: { value: string }): void;
        clearFumenData: () => void;
        loadFumen(data: { fumen: string }): void;
    };
}

export const OpenFumenModal: Component<Props> = ({ textAreaValue, errorMessage, actions }) => {
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
            <div datatest="mdl-open-fumen" className="modal" oncreate={ oncreate } ondestroy={ ondestroy }>
                <div className="modal-content">

                    <h4>テト譜を開く</h4>

                    <textarea dataTest="input-fumen" rows={ 3 } style={ textAreaStyle } oninput={ oninput }
                              value={ textAreaValue } placeholder="URL or v115@~ / Support v115 only"/>

                    <span datatest="text-message" id="text-fumen-modal-error" className="red-text text-accent-2"
                          style={ style({ display: errorMessage !== undefined ? undefined : 'none' }) }>
                        { errorMessage }
                    </span>

                </div>
                <div className="modal-footer">

                    <a href="#" datatest="btn-cancel" className="waves-effect waves-teal btn-flat"
                       onclick={ cancel }>Cancel</a>

                    <a href="#" datatest="btn-open" className={ openClassName } onclick={ open }>Open</a>
                </div>
            </div>
        </div>
    );
};

/**
 * a({
                    dataTest: 'btn-open',
                    id: 'btn-fumen-modal-open',
                    class: 'waves-effect waves-teal btn-flat' + (
                        state.fumen.value === undefined || state.fumen.errorMessage !== undefined ? ' disabled' : ''
                    ),
                    onclick: () => {

                    },


                }, 'Open'),
 *  a({
                    dataTest: 'btn-cancel',
                    class: '',
                    onclick: () => {

                    },
                }, 'Cancel'),
 *
 modal({

            }, [
 h4(''),
 textarea({
                    ,
                    rows: 3,
                    style:
                    oninput: (e: any) => {
                        const value = e.target.value !== '' ? e.target.value : undefined;
                        actions.inputFumenData({ value });
                    },
                    value: state.fumen.value,
                    placeholder: 'URL or v115@~ / Support v115 only',
                }),
 span({
                    dataTest: '',
                    id: 'text-fumen-modal-error',
                    className: 'red-text text-accent-2',
                    style: style({
                        display: state.fumen.errorMessage !== undefined ? undefined : 'none',
                    }),
                }, state.fumen.errorMessage),
 ], [
 a({
                    dataTest: 'btn-cancel',
                    class: 'waves-effect waves-teal btn-flat',
                    onclick: () => {
                        actions.closeFumenModal();
                        actions.clearFumenData();
                    },
                }, 'Cancel'),
 a({
                    dataTest: 'btn-open',
                    id: 'btn-fumen-modal-open',
                    class: 'waves-effect waves-teal btn-flat' + (
                        state.fumen.value === undefined || state.fumen.errorMessage !== undefined ? ' disabled' : ''
                    ),
                    onclick: () => {
                        actions.loadFumen({ fumen: state.fumen.value });
                    },
                }, 'Open'),
 ]),




 modal({
                key: 'settings-modal-top',
                isOpened: state.modal.settings,
                bottomSheet: true,
                oncreate: (element: HTMLDivElement) => {
                    const instance = M.Modal.init(element, {
                        onCloseStart: () => {
                            actions.closeSettingsModal();
                        },
                    });

                    if (state.modal.fumen) {
                        instance.open();
                    } else {
                        instance.close();
                    }

                    modalInstances.settings = instance;
                },
                onupdate: (ignore, attr) => {
                    if (state.modal.settings !== attr.isOpened && modalInstances.settings !== undefined) {
                        if (state.modal.settings) {
                            modalInstances.settings.open();
                        } else {
                            modalInstances.settings.close();
                        }
                    }
                },
            }, [
 h4([
 'Settings ',
 span({
                        style: style({
                            color: '#999',
                            fontSize: '50%',
                        }),
                    }, [` [build ${VERSION}]`]),
 ]),
 settings({}, [
 a({
                        href: './help.html',
                    }, [
 icon({
                            width: 50,
                            height: 50,
                            scale: 0.625,
                            display: 'block',
                            color: '#333',
                            depth: true,
                        }, 'help_outline'),
 div({
                            style: style({
                                textAlign: 'center',
                                color: '#333',
                            }),
                        }, 'help'),
 ]),
 ]),
 ]),
 */