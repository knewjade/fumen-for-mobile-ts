import { Component } from '../../lib/types';
import { h } from 'hyperapp';
import { resources } from '../../states';
import { i18n } from '../../locales/keys';

declare const M: any;

interface ClipboardModalProps {
    actions: {
        closeClipboardModal: () => void;
    };
}

export const ClipboardModal: Component<ClipboardModalProps> = ({ actions }) => {
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

    return (
        <div key="clipboard-fumen-modal-top">
            <div key="mdl-clipboard-fumen" datatest="mdl-clipboard-fumen"
                 className="modal" oncreate={oncreate} ondestroy={ondestroy}>
                <div key="modal-content" className="modal-content">
                    <h4 key="open-fumen-label" dataTest="open-fumen-label">Hello</h4>

                    hello
                </div>

                <div key="modal-footer" className="modal-footer">
                    <a href="#" key="btn-cancel" datatest="btn-cancel" id="btn-cancel"
                       className="waves-effect waves-teal btn-flat" onclick={cancel}>
                        {i18n.Clipboard.Buttons.Cancel()}
                    </a>
                </div>
            </div>
        </div>
    );
};
