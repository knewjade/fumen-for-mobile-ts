import { NextState, sequence } from './commons';
import { action, actions } from '../actions';
import { resources, State } from '../states';
import { Quiz } from '../lib/fumen/quiz';
import { Page } from '../lib/fumen/types';
import {
    OperationTask,
    toFreezeCommentTask,
    toPageTaskStack,
    toPrimitivePage,
    toSetQuizFlagTask,
    toSinglePageTask,
    toUnfreezeCommentTask,
    toUnsetQuizFlagTask,
} from '../history_task';
import { isQuizCommentResult, isTextCommentResult, Pages } from '../lib/pages';

export interface CommentActions {
    updateCommentText: (data: { text?: string, pageIndex: number }) => action;
    commitCommentText: () => action;
    setCommentText: (data: { text: string, pageIndex: number }) => action;
    resetCommentText: (data: { pageIndex: number }) => action;
}

export const commentActions: Readonly<CommentActions> = {
    updateCommentText: ({ text, pageIndex }) => (state): NextState => {
        if (state.fumen.currentIndex !== pageIndex) {
            resources.comment = undefined;

            return sequence(state, [
                commitCommentText(pageIndex, text !== undefined ? text : ''),
                actions.reopenCurrentPage(),
            ]);
        }

        let refresh = false;
        if (text !== undefined) {
            refresh = resources.comment === undefined;
            resources.comment = { pageIndex, text };
        }

        return refresh ? {} : undefined;
    },
    commitCommentText: () => (state): NextState => {
        if (resources.comment === undefined) {
            return undefined;
        }

        const { text, pageIndex } = resources.comment;
        resources.comment = undefined;

        return sequence(state, [
            actions.setCommentText({ text, pageIndex }),
        ]);
    },
    setCommentText: ({ text, pageIndex }) => (state): NextState => {
        return sequence(state, [
            commitCommentText(pageIndex, text),
            actions.reopenCurrentPage(),
        ]);
    },
    resetCommentText: ({ pageIndex }) => (state): NextState => {
        return sequence(state, [
            unfreezeCommentText(pageIndex),
            actions.reopenCurrentPage(),
        ]);
    },
};

const commitCommentText = (pageIndex: number, text: string) => (state: State): NextState => {
    const page = state.fumen.pages[pageIndex];
    if (page === undefined || page.comment.text === text) {
        return undefined;
    }

    if (Quiz.isQuizComment(text)) {
        return commitQuizCommentText(pageIndex, text)(state);
    }
    return commitRegularCommentText(pageIndex, text)(state);
};

const findFirstComment = (pages: Page[], startIndex: number) => {
    let nextPageIndex: number | undefined = undefined;
    for (let i = startIndex; i < pages.length; i += 1) {
        if (pages[i].comment.text !== undefined) {
            nextPageIndex = i;
        }
    }
    return nextPageIndex;
};

const commitQuizCommentText = (pageIndex: number, text: string) => (state: State): NextState => {
    let pages = state.fumen.pages;
    const pagesObj = new Pages(pages);

    const page = pages[pageIndex];
    const nextPageIndex = findFirstComment(pages, pageIndex + 1);

    const prevComment = pages[pageIndex - 1] !== undefined
        ? pagesObj.getComment(pageIndex - 1)
        : undefined;
    const tasks: OperationTask[] = [];

    // 前のページがQuiz、かつ同じコメントになるか
    if (
        prevComment !== undefined && isQuizCommentResult(prevComment)
        && prevComment.quizAfterOperation.format().toString() === text
    ) {
        // refにする
        if (page.comment.text !== undefined) {
            // commentをrefに変換する
            const backupComment = page.comment.text;
            pagesObj.unfreezeComment(pageIndex);
            tasks.push(toUnfreezeCommentTask(pageIndex, backupComment));
        }

        pages = pagesObj.pages;
    } else {
        // textにする
        if (page.comment.text === undefined) {
            // commentをtextに変換する
            pagesObj.freezeComment(pageIndex);
            tasks.push(toFreezeCommentTask(pageIndex));
        }

        // Quizフラグを更新する
        if (!page.flags.quiz) {
            pagesObj.setQuizFlag(pageIndex);
            tasks.push(toSetQuizFlagTask(pageIndex));
        }

        // コメントを更新
        pages = pagesObj.pages;
        const currentPage = pages[pageIndex];
        const primitivePage = toPrimitivePage(currentPage);
        currentPage.comment = { text };
        tasks.push(toSinglePageTask(pageIndex, primitivePage, currentPage));
    }

    // 次のコメントと同じになるか
    if (nextPageIndex !== undefined && pages[nextPageIndex] !== undefined) {
        const comment = pagesObj.getComment(nextPageIndex - 1);
        if (isQuizCommentResult(comment)) {
            const lastQuizComment = comment.quizAfterOperation.format().toString();
            const nextPage = pages[nextPageIndex];
            if (nextPage.comment.text !== undefined && nextPage.comment.text === lastQuizComment) {
                // commentをrefに変換する
                const backupComment = nextPage.comment.text;
                pagesObj.unfreezeComment(nextPageIndex);
                tasks.push(toUnfreezeCommentTask(nextPageIndex, backupComment));
            }
        }
    }

    return sequence(state, [
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
        }),
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, pageIndex) }),
    ]);
};

const commitRegularCommentText = (pageIndex: number, text: string) => (state: State): NextState => {
    let pages = state.fumen.pages;
    const pagesObj = new Pages(pages);

    const page = pages[pageIndex];
    const nextPageIndex = findFirstComment(pages, pageIndex + 1);

    const prevComment = pages[pageIndex - 1] !== undefined
        ? pagesObj.getComment(pageIndex - 1)
        : undefined;
    const tasks: OperationTask[] = [];

    // テキストにする
    if (prevComment !== undefined && isTextCommentResult(prevComment) && prevComment.text === text) {
        // refにする
        if (page.comment.text !== undefined) {
            // commentをrefに変換する
            const backupComment = page.comment.text;
            pagesObj.unfreezeComment(pageIndex);
            tasks.push(toUnfreezeCommentTask(pageIndex, backupComment));
        }

        pages = pagesObj.pages;
    } else {
        // textにする
        if (page.comment.text === undefined) {
            // commentをtextに変換する
            pagesObj.freezeComment(pageIndex);
            tasks.push(toFreezeCommentTask(pageIndex));
        }

        // Quizフラグを更新する
        if (page.flags.quiz) {
            pagesObj.unsetQuizFlag(pageIndex);
            tasks.push(toUnsetQuizFlagTask(pageIndex));
        }

        // コメントを更新
        pages = pagesObj.pages;
        const currentPage = pages[pageIndex];
        const primitivePage = toPrimitivePage(currentPage);
        currentPage.comment = { text };
        tasks.push(toSinglePageTask(pageIndex, primitivePage, currentPage));
    }

    // 次のコメントと同じになるか
    if (nextPageIndex !== undefined && pages[nextPageIndex] !== undefined) {
        const nextPage = pages[nextPageIndex];
        if (nextPage.comment.text !== undefined && nextPage.comment.text === text) {
            // commentをrefに変換する
            const backupComment = nextPage.comment.text;
            pagesObj.unfreezeComment(nextPageIndex);
            tasks.push(toUnfreezeCommentTask(nextPageIndex, backupComment));
        }
    }

    return sequence(state, [
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
        }),
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, pageIndex) }),
    ]);
};

const unfreezeCommentText = (pageIndex: number) => (state: State): NextState => {
    const pages = state.fumen.pages;
    const pagesObj = new Pages(pages);

    const page = pages[pageIndex];
    const tasks: OperationTask[] = [];

    // 前のページがない場合はスキップ
    if (pageIndex <= 0) {
        return undefined;
    }

    // すでにrefになっているか
    if (page.comment.text === undefined) {
        return undefined;
    }

    // commentをrefに変換する
    const backupComment = page.comment.text;
    pagesObj.unfreezeComment(pageIndex);
    tasks.push(toUnfreezeCommentTask(pageIndex, backupComment));

    return sequence(state, [
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
        }),
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, pageIndex) }),
    ]);
};
