import { NextState, sequence } from './commons';
import { action, actions, asyncAction, main } from '../actions';
import { decode } from '../lib/fumen/fumen';
import { i18n } from '../locales/keys';
import { FumenError } from '../lib/errors';
import {
    OperationTask,
    toFreezeCommentTask,
    toFumenTask,
    toInsertPageTask,
    toKeyPageTask,
    toPageTaskStack,
    toPrimitivePage,
    toSinglePageTask,
} from '../history_task';
import { State } from '../states';
import { Pages } from '../lib/pages';
import { Page } from '../lib/fumen/types';

export interface UtilsActions {
    resize: (data: { width: number, height: number }) => action;
    loadFumen: (data: { fumen: string, purgeOnFailed?: boolean }) => asyncAction;
    loadNewFumen: () => asyncAction;
    appendFumen: (data: { fumen: string, pageIndex: number }) => asyncAction;
    loadPages: (data: { pages: Page[], loadedFumen: string }) => action;
    appendPages: (data: { pages: Page[], pageIndex: number }) => action;
    refresh: () => action;
    ontapCanvas: (e: any) => action;
}

export const utilsActions: Readonly<UtilsActions> = {
    resize: ({ width, height }) => (state): NextState => {
        return {
            display: { ...state.display, width, height },
        };
    },

    loadFumen: ({ fumen, purgeOnFailed = false }) => async () => {
        main.pauseAnimation();

        if (fumen === undefined) {
            throw new FumenError(i18n.OpenFumen.Errors.NoData());
        }

        let pages: Page[];
        try {
            pages = await decode(fumen);
        } catch (e) {
            console.error(e);

            if (purgeOnFailed) {
                await main.loadNewFumen();
            } else if (e instanceof FumenError) {
                throw new FumenError(i18n.OpenFumen.Errors.FailedToLoad());
            } else {
                throw new FumenError(i18n.OpenFumen.Errors.Unexpected(e.message));
            }

            return;
        }

        try {
            main.loadPages({ pages, loadedFumen: fumen });
            main.closeAllModals();
            main.clearFumenData();
        } catch (e) {
            console.error(e);

            if (purgeOnFailed) {
                await main.loadNewFumen();
            } else {
                throw new FumenError(i18n.OpenFumen.Errors.Unexpected(e.message));
            }
        }
    },
    loadNewFumen: () => async (state) => {
        await utilsActions.loadFumen({ fumen: 'v115@vhAAgH' })(state);
    },
    loadPages: ({ pages, loadedFumen }) => (state): NextState => {
        const prevPages = state.fumen.pages.map(toPrimitivePage);
        const currentIndex = state.fumen.currentIndex;
        return sequence(state, [
            actions.setPages({ pages }),
            actions.registerHistoryTask({ task: toFumenTask(prevPages, loadedFumen, currentIndex) }),
        ]);
    },
    appendFumen: ({ fumen, pageIndex }) => async () => {
        main.pauseAnimation();

        if (fumen === undefined) {
            throw new FumenError(i18n.AppendFumen.Errors.NoData());
        }

        let pages: Page[];
        try {
            pages = await decode(fumen);
        } catch (e) {
            console.error(e);
            if (e instanceof FumenError) {
                throw new FumenError(i18n.AppendFumen.Errors.FailedToLoad());
            }

            throw new FumenError(i18n.AppendFumen.Errors.Unexpected(e.message));
        }

        try {
            main.appendPages({ pages, pageIndex });
            main.closeAllModals();
            main.clearFumenData();
        } catch (e) {
            console.error(e);
            throw new FumenError(i18n.AppendFumen.Errors.Unexpected(e.message));
        }
    },
    appendPages: ({ pages, pageIndex }) => (state): NextState => {
        return sequence(state, [
            appendPages({ pageIndex, appendedPages: pages, indexAfterReverting: state.fumen.currentIndex }),
            actions.saveToMemento(),
        ]);
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

const appendPages = (
    { pageIndex, appendedPages, indexAfterReverting }: {
        pageIndex: number,
        appendedPages: Page[],
        indexAfterReverting: number,
    },
) => (state: Readonly<State>): NextState => {
    const fumen = state.fumen;
    const pages = fumen.pages;

    if (pageIndex < 0) {
        throw new FumenError(`Illegal index: ${pageIndex}`);
    }

    const currentPage = pages[pageIndex];
    const pagesObj = new Pages(pages);
    const tasks: OperationTask[] = [];

    // 次のページがあるときはKeyにする
    if (currentPage !== undefined) {
        if (currentPage.field.obj === undefined) {
            pagesObj.toKeyPage(pageIndex);
            tasks.push(toKeyPageTask(pageIndex));
        }

        if (currentPage.comment.ref !== undefined) {
            pagesObj.freezeComment(pageIndex);
            tasks.push(toFreezeCommentTask(pageIndex));
        }

        const firstPage = pages[0];
        if (firstPage === undefined || firstPage.flags.colorize !== currentPage.flags.colorize) {
            const primitivePage = toPrimitivePage(currentPage);
            currentPage.flags.colorize = firstPage !== undefined ? firstPage.flags.colorize : true;
            tasks.push(toSinglePageTask(pageIndex, primitivePage, currentPage));
        }
    }

    // 追加する
    {
        const primitiveNexts = appendedPages.map(toPrimitivePage);
        pagesObj.insertPage(pageIndex, appendedPages);
        tasks.push(toInsertPageTask(pageIndex, primitiveNexts, indexAfterReverting));
    }

    const newPages = pagesObj.pages;
    return sequence(state, [
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, indexAfterReverting) }),
        () => ({
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
                currentIndex: pageIndex,
            },
        }),
        actions.reopenCurrentPage(),
    ]);
};
