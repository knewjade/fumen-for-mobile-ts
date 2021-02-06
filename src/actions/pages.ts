import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { AnimationState, Piece, TouchTypes } from '../lib/enums';
import { Move, Page, PreCommand } from '../lib/fumen/types';
import { Block } from '../state_types';
import { isQuizCommentResult, PageFieldOperation, Pages } from '../lib/pages';
import {
    OperationTask,
    toFreezeCommentTask,
    toInsertPageTask,
    toKeyPageTask,
    toPageTaskStack,
    toPrimitivePage,
    toRefPageTask,
    toRemovePageTask,
    toSinglePageTask,
} from '../history_task';
import { State } from '../states';
import { FumenError } from '../lib/errors';
import { Field } from '../lib/fumen/field';

export interface PageActions {
    reopenCurrentPage: () => action;
    openPage: (data: { index: number }) => action;
    openPageWhenChange: (data: { index: number }) => action;
    insertPage: (data: { index: number }) => action;
    insertRefPage: (data: { index: number }) => action;
    insertKeyPage: (data: { index: number }) => action;
    insertNewPage: (data: { index: number }) => action;
    removePage: (data: { index: number }) => action;
    duplicatePage: (data: { index: number }) => action;
    removeUnsettledItems: () => action;
    backLoopPage: () => action;
    nextLoopPage: () => action;
    backPage: (data: { loop: boolean }) => action;
    nextPage: (data: { loop: boolean }) => action;
    nextPageOrNewPage: () => action;
    firstPage: () => action;
    lastPage: () => action;
    clearToEnd: () => action;
    clearPast: () => action;
    changeToRef: (data: { index: number }) => action;
    changeToKey: (data: { index: number }) => action;
    changeLockFlag: (data: { index: number, enable: boolean }) => action;
    changeRiseFlag: (data: { index: number, enable: boolean }) => action;
    changeMirrorFlag: (data: { index: number, enable: boolean }) => action;
}

export const pageActions: Readonly<PageActions> = {
    reopenCurrentPage: () => (state): NextState => {
        return pageActions.openPage({ index: state.fumen.currentIndex })(state);
    },
    openPage: ({ index }) => (state): NextState => {
        const pages = new Pages(state.fumen.pages);

        const comment = pages.getComment(index);

        let text;
        let next;
        let hold;
        if (isQuizCommentResult(comment)) {
            text = comment.quiz;
            if (comment.quiz !== '') {
                next = comment.quizAfterOperation.getNextPieces(5).filter(piece => piece !== Piece.Empty);
                hold = comment.quizAfterOperation.getHoldPiece();
            }
        } else {
            text = comment.text;
            next = comment.next;
            hold = undefined;
        }

        const field = pages.getField(index, PageFieldOperation.None);

        const page = state.fumen.pages[index];
        const blocks = parseToBlocks(field, page.piece, page.commands);

        // テト譜の仕様により、最初のページのフラグが全体に反映される
        const guideLineColor = state.fumen.pages[0] !== undefined ? state.fumen.pages[0].flags.colorize : true;

        return sequence(state, [
            state.play.status === AnimationState.Play ? actions.startAnimation() : undefined,
            state.fumen.currentIndex !== index ? actions.fixInferencePiece() : undefined,
            state.fumen.currentIndex !== index ? actions.clearInferencePiece() : undefined,
            state.fumen.currentIndex !== index ? actions.commitCommentText() : undefined,
            actions.setComment({ comment: text }),
            actions.setField({
                field: blocks.playField,
                move: page.piece,
                filledHighlight: page.flags.lock,
                inferences: state.events.inferences,
                ghost: state.mode.ghostVisible,
                allowSplit: state.mode.touch === TouchTypes.Drawing,
            }),
            actions.setFieldColor({ guideLineColor }),
            actions.setSentLine({ sentLine: blocks.sentLine }),
            actions.setHold({ hold }),
            actions.setNext({ next }),
            newState => ({
                fumen: {
                    ...newState.fumen,
                    currentIndex: index,
                },
                cache: {
                    ...newState.cache,
                    currentInitField: field,
                },
            }),
        ]);
    },
    openPageWhenChange: ({ index }) => (state): NextState => {
        if (state.fumen.currentIndex === index) {
            return undefined;
        }

        return pageActions.openPage({ index })(state);
    },
    insertPage: ({ index }) => (state): NextState => {
        const fumen = state.fumen;
        const pages = fumen.pages;

        const prevPage = pages[index - 1];
        const insert = prevPage !== undefined && prevPage.field.obj === undefined
            ? pageActions.insertRefPage
            : pageActions.insertKeyPage;

        return insert({ index })(state);
    },
    insertRefPage: ({ index }) => (state): NextState => {
        const fumen = state.fumen;
        const pages = fumen.pages;
        if (pages.length < index) {
            return undefined;
        }

        return sequence(state, [
            actions.removeUnsettledItems(),
            actions.commitCommentText(),
            insertRefPage({ index }),
            actions.reopenCurrentPage(),
        ]);
    },
    insertKeyPage: ({ index }) => (state): NextState => {
        const fumen = state.fumen;
        const pages = fumen.pages;
        if (pages.length < index) {
            return undefined;
        }

        return sequence(state, [
            actions.removeUnsettledItems(),
            actions.commitCommentText(),
            insertKeyPage({ index }),
            actions.reopenCurrentPage(),
        ]);
    },
    insertNewPage: ({ index }) => (state): NextState => {
        const fumen = state.fumen;
        const pages = fumen.pages;
        if (pages.length < index) {
            return undefined;
        }

        return sequence(state, [
            actions.removeUnsettledItems(),
            actions.commitCommentText(),
            insertNewPage({ index }),
            actions.reopenCurrentPage(),
        ]);
    },
    duplicatePage: ({ index }) => (state): NextState => {
        const fumen = state.fumen;
        const pages = fumen.pages;
        if (pages.length < index) {
            return undefined;
        }

        return sequence(state, [
            actions.removeUnsettledItems(),
            actions.commitCommentText(),
            duplicatePage({ index }),
            actions.reopenCurrentPage(),
        ]);
    },
    removePage: ({ index }) => (state): NextState => {
        return sequence(state, [
            actions.removeUnsettledItems(),
            actions.commitCommentText(),
            removePage({ index }),
            actions.reopenCurrentPage(),
        ]);
    },
    removeUnsettledItems: () => (state): NextState => {
        return actions.removeUnsettledItemsInField()(state);
    },
    backLoopPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex - 1 + state.fumen.maxPage) % state.fumen.maxPage;
        return pageActions.openPage({ index })(state);
    },
    nextLoopPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex + 1) % state.fumen.maxPage;
        return pageActions.openPage({ index })(state);
    },
    backPage: ({ loop }) => (state): NextState => {
        const backPage = state.fumen.currentIndex - 1;
        if (backPage < 0) {
            if (loop) {
                return sequence(state, [
                    actions.lastPage(),
                ]);
            }
            return;
        }

        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            actions.commitCommentText(),
            pageActions.openPage({ index: backPage }),
        ]);
    },
    nextPage: ({ loop }) => (state): NextState => {
        const fumen = state.fumen;
        const nextPage = fumen.currentIndex + 1;

        if (fumen.maxPage <= nextPage) {
            if (loop) {
                return sequence(state, [
                    actions.firstPage(),
                ]);
            }
            return;
        }

        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            actions.commitCommentText(),
            pageActions.openPage({ index: nextPage }),
        ]);
    },
    nextPageOrNewPage: () => (state): NextState => {
        const fumen = state.fumen;
        const nextPage = fumen.currentIndex + 1;

        if (fumen.maxPage <= nextPage) {
            return sequence(state, [
                pageActions.insertPage({ index: nextPage }),
                pageActions.openPage({ index: nextPage }),
            ]);
        }

        return sequence(state, [
            actions.nextPage({ loop: false }),
        ]);
    },
    firstPage: () => (state): NextState => {
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            pageActions.openPage({ index: 0 }),
        ]);
    },
    lastPage: () => (state): NextState => {
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            pageActions.openPage({ index: state.fumen.pages.length - 1 }),
        ]);
    },
    changeToRef: ({ index }) => (state): NextState => {
        if (index <= 0) {
            return undefined;
        }

        const task = toRefPageTask(index);

        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            actions.registerHistoryTask({ task }),
            (newState) => {
                const pages = new Pages(newState.fumen.pages);
                pages.toRefPage(index);

                return {
                    fumen: {
                        ...newState.fumen,
                        pages: pages.pages,
                    },
                };
            },
            (newState) => {
                return pageActions.openPage({ index: newState.fumen.currentIndex })(newState);
            },
        ]);

    },
    changeToKey: ({ index }) => (state): NextState => {
        if (index <= 0) {
            return undefined;
        }

        const task = toKeyPageTask(index);
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            actions.registerHistoryTask({ task }),
            (newState) => {
                const pages = new Pages(newState.fumen.pages);
                pages.toKeyPage(index);
                return {
                    fumen: {
                        ...newState.fumen,
                        pages: pages.pages,
                    },
                };
            },
            (newState) => {
                return pageActions.openPage({ index: newState.fumen.currentIndex })(newState);
            },
        ]);
    },
    changeLockFlag: ({ index, enable }) => (state): NextState => {
        const pages = state.fumen.pages;
        if (index < 0 || pages.length <= index) {
            return undefined;
        }

        const page = pages[index];
        const primitivePrev = toPrimitivePage(page);

        page.flags.lock = enable;

        const task = toSinglePageTask(index, primitivePrev, page);

        return sequence(state, [
            actions.registerHistoryTask({ task }),
            (newState) => {
                return {
                    fumen: {
                        ...newState.fumen,
                        pages,
                    },
                };
            },
            actions.reopenCurrentPage(),
        ]);
    },
    changeRiseFlag: ({ index, enable }) => (state): NextState => {
        const pages = state.fumen.pages;
        if (index < 0 || pages.length <= index) {
            return undefined;
        }

        const page = pages[index];
        const primitivePrev = toPrimitivePage(page);

        page.flags.rise = enable;

        const task = toSinglePageTask(index, primitivePrev, page);

        return sequence(state, [
            actions.registerHistoryTask({ task }),
            (newState) => {
                return {
                    fumen: {
                        ...newState.fumen,
                        pages,
                    },
                };
            },
        ]);
    },
    changeMirrorFlag: ({ index, enable }) => (state): NextState => {
        const pages = state.fumen.pages;
        if (index < 0 || pages.length <= index) {
            return undefined;
        }

        const page = pages[index];
        const primitivePrev = toPrimitivePage(page);

        page.flags.mirror = enable;

        const task = toSinglePageTask(index, primitivePrev, page);

        return sequence(state, [
            actions.registerHistoryTask({ task }),
            (newState) => {
                return {
                    fumen: {
                        ...newState.fumen,
                        pages,
                    },
                };
            },
        ]);
    },
    clearToEnd: () => (state): NextState => {
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            actions.commitCommentText(),
            clearToEnd({ pageIndex: state.fumen.currentIndex }),
            actions.reopenCurrentPage(),
        ]);
    },
    clearPast: () => (state): NextState => {
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            actions.commitCommentText(),
            clearPast({ pageIndex: state.fumen.currentIndex }),
            actions.reopenCurrentPage(),
        ]);
    },
};

export const parseToBlocks = (field: Field, move?: Move, commands?: Page['commands']) => {
    const parse = (piece: Piece) => ({ piece });

    const playField: Block[] = field.toPlayFieldPieces().map(parse);
    const sentLine: Block[] = field.toSentLintPieces().map(parse);

    if (commands !== undefined) {
        Object.keys(commands.pre)
            .map(key => commands.pre[key])
            .forEach((command: PreCommand) => {
                switch (command.type) {
                case 'block': {
                    const { x, y, piece } = command;
                    playField[x + y * 10] = { piece };
                    return;
                }
                case 'sentBlock': {
                    const { x, y, piece } = command;
                    sentLine[x + y * 10] = { piece };
                    return;
                }
                }
            });
    }

    return { playField, sentLine };
};

const insertRefPage = ({ index }: { index: number }) => (state: Readonly<State>): NextState => {
    const pages = new Pages(state.fumen.pages);
    pages.insertRefPage(index);
    const newPages = pages.pages;

    const task = toInsertPageTask(index, [toPrimitivePage(newPages[index])], state.fumen.currentIndex);
    return sequence(state, [
        actions.registerHistoryTask({ task }),
        () => ({
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
            },
        }),
    ]);
};

const insertKeyPage = ({ index }: { index: number }) => (state: Readonly<State>): NextState => {
    const pages = new Pages(state.fumen.pages);
    pages.insertKeyPage(index);
    const newPages = pages.pages;

    const task = toInsertPageTask(index, [toPrimitivePage(newPages[index])], state.fumen.currentIndex);
    return sequence(state, [
        actions.registerHistoryTask({ task }),
        () => ({
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
            },
        }),
    ]);
};

const insertNewPage = ({ index }: { index: number }) => (state: Readonly<State>): NextState => {
    let pages = state.fumen.pages;

    const tasks = [];

    // 次のページをKeyにする
    const nextPage = pages[index];
    if (nextPage !== undefined && nextPage.field.ref !== undefined) {
        const pagesObj = new Pages(pages);
        pagesObj.toKeyPage(index);
        pages = pagesObj.pages;

        const task = toKeyPageTask(index);
        tasks.push(task);
    }

    // 次のページのコメントを固定する
    if (nextPage !== undefined && nextPage.comment.ref !== undefined) {
        const pagesObj = new Pages(pages);
        pagesObj.freezeComment(index);
        pages = pagesObj.pages;

        const task = toFreezeCommentTask(index);
        tasks.push(task);
    }

    // 次のページの前にKeyPageを追加
    {
        const pagesObj = new Pages(pages);
        pagesObj.insertKeyPage(index);
        pages = pagesObj.pages;

        const task = toInsertPageTask(index, [toPrimitivePage(pages[index])], state.fumen.currentIndex);
        tasks.push(task);
    }

    // 追加したページのコメントを固定する
    const insertedPage = pages[index];
    if (insertedPage !== undefined && insertedPage.comment.text === undefined) {
        const pagesObj = new Pages(pages);
        pagesObj.freezeComment(index);
        pages = pagesObj.pages;

        const task = toFreezeCommentTask(index);
        tasks.push(task);
    }

    const primitivePage = toPrimitivePage(insertedPage);

    // フィールドをリセットする
    if (insertedPage.field.obj !== undefined) {
        insertedPage.field.obj = new Field({});
    }

    // コメントをリセットする
    if (insertedPage.comment.text !== undefined) {
        insertedPage.comment.text = '';
    }

    // ページの変更を記録する
    {
        const task = toSinglePageTask(index, primitivePage, insertedPage);
        tasks.push(task);
    }

    return sequence(state, [
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, state.fumen.currentIndex) }),
        () => ({
            fumen: {
                ...state.fumen,
                pages,
                maxPage: pages.length,
                currentIndex: index,
            },
        }),
    ]);
};

const duplicatePage = ({ index }: { index: number }) => (state: Readonly<State>): NextState => {
    const pages = new Pages(state.fumen.pages);
    pages.duplicatePage(index);
    const newPages = pages.pages;

    const task = toInsertPageTask(index, [toPrimitivePage(newPages[index])], state.fumen.currentIndex);
    return sequence(state, [
        actions.registerHistoryTask({ task }),
        () => ({
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
            },
        }),
    ]);
};

const removePage = ({ index }: { index: number }) => (state: Readonly<State>): NextState => {
    const fumen = state.fumen;
    const pages = fumen.pages;

    if (index < 0) {
        throw new FumenError(`Illegal index: ${index}`);
    }

    if (pages.length <= 1) {
        return;
    }

    const currentPage = pages[index];
    const nextPageIndex = index + 1;
    const nextPage = pages[nextPageIndex];
    const pagesObj = new Pages(pages);
    const tasks: OperationTask[] = [];

    // 次のページがあるときはKeyにする
    if (nextPage !== undefined) {
        if (nextPage.field.obj === undefined) {
            pagesObj.toKeyPage(nextPageIndex);
            tasks.push(toKeyPageTask(nextPageIndex));
        }

        if (nextPage.comment.ref !== undefined) {
            pagesObj.freezeComment(nextPageIndex);
            tasks.push(toFreezeCommentTask(nextPageIndex));
        }

        if (index === 0 && currentPage.flags.colorize !== nextPage.flags.colorize) {
            const primitiveNextPage = toPrimitivePage(nextPage);
            nextPage.flags.colorize = currentPage.flags.colorize;
            tasks.push(toSinglePageTask(nextPageIndex, primitiveNextPage, nextPage));
        }
    }

    // 現ページの削除
    {
        const primitiveCurrentPage = toPrimitivePage(currentPage);
        pagesObj.deletePage(index, index + 1);
        tasks.push(toRemovePageTask(index, index + 1, [primitiveCurrentPage], index));
    }

    const newPages = pagesObj.pages;
    const nextIndex = index < newPages.length ? index : newPages.length - 1;

    return sequence(state, [
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, index) }),
        () => ({
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
                currentIndex: nextIndex,
            },
        }),
    ]);
};

const clearToEnd = ({ pageIndex }: { pageIndex: number }) => (state: Readonly<State>): NextState => {
    const fumen = state.fumen;
    const pages = fumen.pages;

    if (pageIndex < 0) {
        throw new FumenError(`Illegal index: ${pageIndex}`);
    }

    const nextPageIndex = pageIndex + 1;
    if (pages.length <= 1 || pages.length <= nextPageIndex) {
        return;
    }

    const pagesObj = new Pages(pages);

    // 次のページ以降を削除
    const primitivePages = pages.slice(nextPageIndex).map(toPrimitivePage);
    pagesObj.deletePage(nextPageIndex, pages.length);
    const task = toRemovePageTask(nextPageIndex, pages.length, primitivePages, pageIndex);

    const newPages = pagesObj.pages;
    const nextIndex = pageIndex < newPages.length ? pageIndex : newPages.length - 1;

    return sequence(state, [
        actions.registerHistoryTask({ task }),
        () => ({
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
                currentIndex: nextIndex,
            },
        }),
    ]);
};

const clearPast = ({ pageIndex }: { pageIndex: number }) => (state: Readonly<State>): NextState => {
    const fumen = state.fumen;
    const pages = fumen.pages;

    if (pageIndex < 0) {
        throw new FumenError(`Illegal index: ${pageIndex}`);
    }

    if (pages.length <= 1 || pageIndex === 0) {
        return;
    }

    const firstPage = pages[0];
    if (firstPage === undefined) {
        return;
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

        if (firstPage.flags.colorize !== currentPage.flags.colorize) {
            const primitivePage = toPrimitivePage(currentPage);
            currentPage.flags.colorize = firstPage.flags.colorize;
            tasks.push(toSinglePageTask(pageIndex, primitivePage, currentPage));
        }
    }

    // 前までのページを削除
    {
        const primitivePages = pages.slice(0, pageIndex).map(toPrimitivePage);
        pagesObj.deletePage(0, pageIndex);
        tasks.push(toRemovePageTask(0, pageIndex, primitivePages, 0));
    }

    const newPages = pagesObj.pages;
    return sequence(state, [
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, pageIndex) }),
        () => ({
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
                currentIndex: 0,
            },
        }),
        actions.reopenCurrentPage(),
    ]);
};
