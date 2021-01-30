import { Component, px, style } from '../../lib/types';
import { h } from 'hyperapp';
import { resources } from '../../states';
import { i18n } from '../../locales/keys';

declare const M: any;

interface UserSettingsModalProps {
    ghostVisible: boolean;
    actions: {
        closeUserSettingsModal: () => void;
        commitUserSettings: () => void;
        copyUserSettingsToTemporary: () => void;
        keepGhostVisible: (data: { visible: boolean }) => void;
    };
}

export const UserSettingsModal: Component<UserSettingsModalProps> = (
    { ghostVisible, actions },
) => {
    const oncreate = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onCloseStart: () => {
                actions.closeUserSettingsModal();
            },
        });

        actions.copyUserSettingsToTemporary();
        instance.open();

        resources.modals.userSettings = instance;
    };

    const ondestroy = () => {
        const modal = resources.modals.userSettings;
        if (modal !== undefined) {
            modal.close();
        }
        resources.modals.userSettings = undefined;
    };

    const save = () => {
        actions.commitUserSettings();
        actions.closeUserSettingsModal();
    };

    const cancel = () => {
        actions.closeUserSettingsModal();
    };

    const onupdate = (e: HTMLInputElement) => {
        if (e.checked !== ghostVisible) {
            e.checked = ghostVisible;
        }
    };

    const onchange = (e: Event) => {
        if (!e || !e.target) {
            return;
        }
        const target = e.target as HTMLInputElement;
        actions.keepGhostVisible({ visible: target.checked });
    };

    return (
        <div key="user-settings-modal-top">
            <div key="mdl-user-settings" datatest="mdl-user-settings"
                 className="modal" oncreate={oncreate} ondestroy={ondestroy}>

                <div key="modal-content" className="modal-content">
                    <h4 key="user-settings-label" dataTest="user-settings-label">{i18n.UserSettings.Title()}</h4>

                    <div style={style({ color: '#666' })}>
                        {i18n.UserSettings.Notice()}
                    </div>

                    <div style={style({ color: '#333', marginTop: px(15) })}>
                        <div class="switch">
                            <h6>{i18n.UserSettings.Ghost.Title()}</h6>

                            <label>
                                {i18n.UserSettings.Ghost.Off()}
                                <input type="checkbox" onupdate={onupdate} onchange={onchange}/>
                                <span class="lever"/>
                                {i18n.UserSettings.Ghost.On()}
                            </label>
                        </div>
                    </div>

                </div>

                <div key="modal-footer" className="modal-footer">
                    <a href="#" key="btn-cancel" datatest="btn-cancel" id="btn-cancel"
                       className="waves-effect waves-teal btn-flat" onclick={cancel}>
                        {i18n.UserSettings.Buttons.Cancel()}
                    </a>

                    <a href="#" key="btn-open" datatest="btn-save" id="btn-save"
                       className="waves-effect waves-teal btn" onclick={save}>
                        {i18n.UserSettings.Buttons.Save()}
                    </a>
                </div>
            </div>
        </div>
    );
};
