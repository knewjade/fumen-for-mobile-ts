import { initState, State } from './states';
import { view } from './view';
import { app } from 'hyperapp';
import { withLogger } from '@hyperapp/logger';
import { default as i18next } from 'i18next';
import { default as LanguageDetector } from 'i18next-browser-languagedetector';
import { resources as resourcesJa } from './locales/ja/translation';
import { resources as resourcesEn } from './locales/en/translation';
import { PageEnv } from './env';
import { NextState } from './actions/commons';
import { fieldEditorActions, FieldEditorActions } from './actions/field_editor';
import { animationActions, AnimationActions } from './actions/animation';
import { modeActions, ScreenActions } from './actions/screen';
import { modalActions, ModalActions } from './actions/modal';
import { pageActions, PageActions } from './actions/pages';
import { setterActions, SetterActions } from './actions/setter';
import { UtilsActions, utilsActions } from './actions/utils';
import { mementoActions, MementoActions } from './actions/memento';
import { CommentActions, commentActions } from './actions/comment';
import { shiftActions, ShiftActions } from './actions/shift';

export type action = (state: Readonly<State>) => NextState;

export type Actions = AnimationActions
    & ScreenActions
    & ModalActions
    & PageActions
    & SetterActions
    & UtilsActions
    & MementoActions
    & FieldEditorActions
    & CommentActions
    & ShiftActions;

export const actions: Readonly<Actions> = {
    ...animationActions,
    ...modeActions,
    ...modalActions,
    ...pageActions,
    ...setterActions,
    ...utilsActions,
    ...mementoActions,
    ...fieldEditorActions,
    ...commentActions,
    ...shiftActions,
};

// Mounting
const mount = (isDebug: boolean = false): Actions => {
    if (isDebug) {
        return withLogger(app)(initState, actions, view, document.body);
    }
    return app<State, Actions>(initState, actions, view, document.body);
};
export const main = mount(PageEnv.Debug);

// Loading
i18next.use(LanguageDetector).init({
    fallbackLng: 'en',
    resources: {
        en: { translation: resourcesEn },
        ja: { translation: resourcesJa },
    },
}, (error) => {
    if (error) {
        console.error('Failed to load i18n');
    } else {
        main.refresh();
    }
});

window.onresize = () => {
    main.resize({
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    });
};

window.addEventListener('load', () => {
    // Query文字列を取得
    let search = '';
    if (location.search !== '') {
        search = location.search.substr(1);
    } else {
        const hash = location.hash;
        const index = hash.indexOf('?');
        if (index !== -1) {
            search = hash.substr(index + 1);
        }
    }

    // クエリーの抽出
    const url = decodeURIComponent(search);
    const paramQueryStrings = url.split('&');

    // i18nの設定
    const languageDetector = new LanguageDetector(null, {
        order: ['myQueryDetector', 'querystring', 'navigator', 'path', 'subdomain'],
        cookieMinutes: 0,
    });
    languageDetector.addDetector({
        name: 'myQueryDetector',
        lookup() {
            const lng = paramQueryStrings.find(value => value.startsWith('lng='));
            return lng !== undefined ? lng.substr(4) : undefined;
        },
        cacheUserLanguage() {
            // do nothing
        },
    });
    i18next
        .use(languageDetector)
        .init({
            fallbackLng: 'en',
            resources: {
                en: { translation: resourcesEn },
                ja: { translation: resourcesJa },
            },
        }, (error) => {
            if (error) {
                console.error('Failed to load i18n');
            } else {
                main.refresh();
            }
        });

    // URLからロードする
    {
        const data = paramQueryStrings.find(value => value.startsWith('d='));
        if (data !== undefined) {
            return main.loadFumen({ fumen: data.substr(2) });
        }
    }

    // LocalStrageからロードする
    {
        const fumen = localStorage.getItem('data@1');
        if (fumen) {
            return main.loadFumen({ fumen });
        }
    }

    // 空のフィールドを読み込む
    return main.loadNewFumen();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registered: ', registration);
        }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
