import { NextState } from './commons';
import { action, actions, main } from '../actions';
import { decode, Page } from '../lib/fumen/fumen';
import { i18n } from '../locales/keys';
import { ViewError } from '../lib/errors';
import { toFumenTask, toPrimitivePage } from '../history_task';
import { resources } from '../states';

export interface UtilsActions {
    resize: (data: { width: number, height: number }) => action;
    loadFumen: (args: { fumen: string | undefined, purgeOnFailed?: boolean }) => action;
    loadNewFumen: () => action;
    refresh: () => action;
    ontapCanvas: (e: any) => action;
}

export const utilsActions: Readonly<UtilsActions> = {
    resize: ({ width, height }) => (state): NextState => {
        // Androidのキーボードがしまわれたことを検知して、blurするためのWorkaround
        const elementId = resources.focussedElement;
        if (state.display.height < height && elementId !== undefined) {
            const element: any = document.querySelector(`#${elementId}`);
            if (element !== null && typeof element.blur === 'function') {
                element.blur();
            }
        }

        return {
            display: { width, height },
        };
    },
    loadFumen: ({ fumen, purgeOnFailed = false }) => (state): NextState => {
        main.pauseAnimation();

        if (fumen === undefined) {
            main.showOpenErrorMessage({ message: 'データを入力してください' });
            return undefined;
        }

        const prevPages = state.fumen.pages.map(toPrimitivePage);
        (async () => {
            try {
                const pages: Page[] = await decode(fumen);

                main.setPages({ pages });
                main.closeFumenModal();
                main.clearFumenData();

                main.registerHistoryTask({ task: toFumenTask(prevPages, fumen, state.fumen.currentIndex) });
            } catch (e) {
                console.error(e);
                if (purgeOnFailed) {
                    main.loadNewFumen();
                } else if (e instanceof ViewError) {
                    main.showOpenErrorMessage({ message: i18n.OpenFumen.Errors.Unexpected(e.message) });
                } else {
                    main.showOpenErrorMessage({ message: i18n.OpenFumen.Errors.FailedToLoad() });
                }
            }
        })();

        return undefined;
    },
    loadNewFumen: () => (state): NextState => {
        return utilsActions.loadFumen({ fumen: 'v115@vhAAgH' })(state);
    },
    refresh: () => (): NextState => {
        return {};
    },
    ontapCanvas: (e: any) => (state): NextState => {
        const stage = e.currentTarget.getStage();
        const { x } = stage.getPointerPosition();
        const { width } = stage.getSize();
        const touchX = x / width;
        const action = touchX < 0.5 ? actions.backLoopPage() : actions.nextLoopPage();
        return action(state);
    },
};
