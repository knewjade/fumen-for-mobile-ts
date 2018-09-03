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
            Help: () => t('Menu.Buttons.Help'),
        },
    },
    Domains: {
        Fumen: () => t('Domains.Fumen'),
    },
};
