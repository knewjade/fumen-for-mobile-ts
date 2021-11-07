import { NextState, sequence } from './commons';
import { action, actions, main } from '../actions';
import { decode, encode } from '../lib/fumen/fumen';
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

declare const M: any;

export interface UtilsActions {
    resize: (data: { width: number, height: number }) => action;
    commitOpenFumenData: () => action;
    loadFumen: (data: { fumen: string, purgeOnFailed?: boolean }) => action;
    loadNewFumen: () => action;
    commitAppendFumenData: (data: { position: 'next' | 'end' }) => action;
    loadPages: (data: { pages: Page[], loadedFumen: string }) => action;
    appendPages: (data: { pages: Page[], pageIndex: number }) => action;
    refresh: () => action;
    openInPC: () => action;
    ontapCanvas: (e: any) => action;
}

export const utilsActions: Readonly<UtilsActions> = {
    resize: ({ width, height }) => (state): NextState => {
        return {
            display: { ...state.display, width, height },
        };
    },
    commitOpenFumenData: () => (state): NextState => {
        const fumen = state.fumen.value;
        if (!fumen) {
            return undefined;
        }
        return loadFumen(fumen, false);
    },
    loadFumen: ({ fumen, purgeOnFailed = false }) => (): NextState => {
        return loadFumen(fumen, purgeOnFailed);
    },
    loadNewFumen: () => (state): NextState => {
        return utilsActions.loadFumen({ fumen: 'v115@vhAAgH' })(state);
    },
    loadPages: ({ pages, loadedFumen }) => (state): NextState => {
        const prevPages = state.fumen.pages.map(toPrimitivePage);
        const currentIndex = state.fumen.currentIndex;
        return sequence(state, [
            actions.setPages({ pages }),
            actions.registerHistoryTask({ task: toFumenTask(prevPages, loadedFumen, currentIndex) }),
        ]);
    },
    commitAppendFumenData: ({ position }) => (state): NextState => {
        const fumen = state.fumen.value;
        if (!fumen) {
            return undefined;
        }

        switch (position) {
        case 'end':
            return appendFumen(fumen, state.fumen.maxPage);
        case 'next':
            return appendFumen(fumen, state.fumen.currentIndex + 1);
        default:
            return undefined;
        }
    },
    appendPages: ({ pages, pageIndex }) => (state): NextState => {
        return sequence(state, [
            appendPages({ pageIndex, appendedPages: pages, indexAfterReverting: state.fumen.currentIndex }),
        ]);
    },
    refresh: () => (): NextState => {
        return {};
    },
    openInPC: () => (state): NextState => {
        return sequence(state, [
            actions.removeUnsettledItemsInField(),
            (state) => {
                // テト譜の変換
                const encodePromise = (async () => {
                    const encoded = await encode(state.fumen.pages);
                    return `v115@${encoded}`;
                });

                encodePromise()
                    .then((data) => {
                        const url = i18n.Navigator.ExternalFumenURL(data);
                        window.open(url, '_blank');
                    })
                    .catch((error) => {
                        M.toast({ html: `Failed to open in PC: ${error}`, classes: 'top-toast', displayLength: 1500 });
                    });

                return undefined;
            },
        ]);
    },
    ontapCanvas: (e: any) => (state): NextState => {
        const stage = e.currentTarget.getStage();
        const { x } = stage.getPointerPosition();
        const { width } = stage.getSize();
        const touchX = x / width;
        const action = touchX < 0.5
            ? actions.backPage({ loop: state.mode.loop })
            : actions.nextPage({ loop: state.mode.loop });
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

const loadFumen = (fumen: string, purgeOnFailed: boolean): NextState => {
    main.pauseAnimation();

    if (fumen === undefined) {
        main.showOpenErrorMessage({ message: 'データを入力してください' });
        return undefined;
    }

    (async () => {
        let pages: Page[];
        try {
            pages = await decode(fumen);
        } catch (e: any) {
            console.error(e);
            if (purgeOnFailed) {
                main.loadNewFumen();
            } else if (e instanceof FumenError) {
                main.showOpenErrorMessage({ message: i18n.OpenFumen.Errors.FailedToLoad() });
            } else {
                main.showOpenErrorMessage({ message: i18n.OpenFumen.Errors.Unexpected(e.message) });
            }
            return;
        }

        try {
            main.loadPages({ pages, loadedFumen: fumen });
            main.closeAllModals();
            main.clearFumenData();
        } catch (e: any) {
            console.error(e);
            if (purgeOnFailed) {
                main.loadNewFumen();
            } else {
                main.showOpenErrorMessage({ message: i18n.OpenFumen.Errors.Unexpected(e.message) });
            }
        }
    })();

    return undefined;
};

const appendFumen = (fumen: string, pageIndex: number): NextState => {
    main.pauseAnimation();

    if (fumen === undefined) {
        main.showOpenErrorMessage({ message: 'データを入力してください' });
        return undefined;
    }

    (async () => {
        let pages: Page[];
        try {
            pages = await decode(fumen);
        } catch (e: any) {
            console.error(e);
            if (e instanceof FumenError) {
                main.showOpenErrorMessage({ message: i18n.AppendFumen.Errors.FailedToLoad() });
            } else {
                main.showOpenErrorMessage({ message: i18n.AppendFumen.Errors.Unexpected(e.message) });
            }
            return;
        }

        try {
            main.appendPages({ pages, pageIndex });
            main.closeAllModals();
            main.clearFumenData();
        } catch (e: any) {
            console.error(e);
            main.showOpenErrorMessage({ message: i18n.AppendFumen.Errors.Unexpected(e.message) });
        }
    })();

    return undefined;
};
