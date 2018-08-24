import { default as i18next, TranslationFunction } from 'i18next';

const t: TranslationFunction = (key, options) => i18next.t(key, options);

// Top Level = Screen name
export const i18n = {
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
    Settings: {
        Title: () => t('Settings.Title'),
        Build: (version: string) => t('Settings.Build', { version }),
        Buttons: {
            Readonly: () => t('Settings.Buttons.Readonly'),
            Writable: () => t('Settings.Buttons.Writable'),
            Clipboard: () => t('Settings.Buttons.Clipboard'),
            Help: () => t('Settings.Buttons.Help'),
            RemovePage: () => t('Settings.Buttons.RemovePage'),
        },
    },
};
