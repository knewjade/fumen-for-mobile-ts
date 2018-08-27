import { NextState } from './commons';
import { action, actions, main } from '../actions';
import { decode, Page } from '../lib/fumen/fumen';
import { i18n } from '../locales/keys';
import { ViewError } from '../lib/errors';

export interface UtilsActions {
    resize: (data: { width: number, height: number }) => action;
    loadFumen: (args: { fumen: string | undefined }) => action;
    refresh: () => action;
    ontapCanvas: (e: any) => action;
}

export const utilsActions: Readonly<UtilsActions> = {
    resize: ({ width, height }) => (): NextState => {
        return {
            display: { width, height },
        };
    },
    loadFumen: ({ fumen }) => (): NextState => {
        main.pauseAnimation();

        if (fumen === undefined) {
            main.showOpenErrorMessage({ message: 'データを入力してください' });
            return undefined;
        }

        (async () => {
            try {
                const pages: Page[] = await decode(fumen);

                main.setPages({ pages });
                main.closeFumenModal();
                main.clearFumenData();
            } catch (e) {
                console.error(e);
                if (e instanceof ViewError) {
                    main.showOpenErrorMessage({ message: i18n.OpenFumen.Errors.Unexpected(e.message) });
                } else {
                    main.showOpenErrorMessage({ message: i18n.OpenFumen.Errors.FailedToLoad() });
                }
            }
        })();

        return undefined;
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
