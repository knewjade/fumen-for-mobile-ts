import { default as i18next } from 'i18next';

const t: (key: string, options?: object) => string = (key, options) => i18next.t(key, options);

// Top Level = Screen name
export const i18n = {
    Top: {
        RestoreFromStorage: () => t('Top.RestoreFromStorage'),
    },
    OpenFumen: {
        Title: () => t('OpenFumen.Title'),
        PlaceHolder: () => t('OpenFumen.PlaceHolder'),
        Buttons: {
            Open: () => t('OpenFumen.Buttons.Open'),
            Cancel: () => t('OpenFumen.Buttons.Cancel'),
        },
        Errors: {
            FailedToLoad: () => t('OpenFumen.Errors.FailedToLoad'),
            Unexpected: (message: string) => t('OpenFumen.Errors.Unexpected', { message }),
        },
    },
    AppendFumen: {
        Title: () => t('AppendFumen.Title'),
        PlaceHolder: () => t('AppendFumen.PlaceHolder'),
        Buttons: {
            Cancel: () => t('AppendFumen.Buttons.Cancel'),
        },
        Errors: {
            FailedToLoad: () => t('AppendFumen.Errors.FailedToLoad'),
            Unexpected: (message: string) => t('AppendFumen.Errors.Unexpected', { message }),
        },
    },
    UserSettings: {
        Title: () => t('UserSettings.Title'),
        Notice: () => t('UserSettings.Notice'),
        Ghost: {
            Title: () => t('UserSettings.Ghost.Title'),
            Off: () => t('UserSettings.Ghost.Off'),
            On: () => t('UserSettings.Ghost.On'),
        },
        Loop: {
            Title: () => t('UserSettings.Loop.Title'),
            Off: () => t('UserSettings.Loop.Off'),
            On: () => t('UserSettings.Loop.On'),
        },
        Buttons: {
            Save: () => t('UserSettings.Buttons.Save'),
            Cancel: () => t('UserSettings.Buttons.Cancel'),
        },
    },
    Clipboard: {
        Title: () => t('Clipboard.Title'),
        Buttons: {
            Close: () => t('Clipboard.Buttons.Close'),
        },
    },
    Menu: {
        Title: () => t('Menu.Title'),
        Build: (version: string) => t('Menu.Build', { version }),
        Buttons: {
            Readonly: () => t('Menu.Buttons.Readonly'),
            Writable: () => t('Menu.Buttons.Writable'),
            Clipboard: () => t('Menu.Buttons.Clipboard'),
            FirstPage: () => t('Menu.Buttons.FirstPage'),
            LastPage: () => t('Menu.Buttons.LastPage'),
            New: () => t('Menu.Buttons.New'),
            Open: () => t('Menu.Buttons.Open'),
            ShowComment: () => t('Menu.Buttons.ShowComment'),
            ReadonlyComment: () => t('Menu.Buttons.ReadonlyComment'),
            WritableComment: () => t('Menu.Buttons.WritableComment'),
            PageSlider: () => t('Menu.Buttons.PageSlider'),
            Help: () => t('Menu.Buttons.Help'),
            ClearToEnd: () => t('Menu.Buttons.ClearToEnd'),
            ClearPast: () => t('Menu.Buttons.ClearPast'),
            Append: () => t('Menu.Buttons.Append'),
            GhostOn: () => t('Menu.Buttons.GhostOn'),
            GhostOff: () => t('Menu.Buttons.GhostOff'),
            UserSettings: () => t('Menu.Buttons.UserSettings'),
        },
        Messages: {
            NoAvailableCommentButton: () => t('Menu.Messages.NoAvailableCommentButton'),
        },
    },
    Navigator: {
        OpenInPC: () => t('Navigator.OpenInPC'),
        ExternalFumenURL: (data: string) => t('Navigator.ExternalFumenURL', {
            data,
            interpolation: { escapeValue: false },
        }),
    },
};
