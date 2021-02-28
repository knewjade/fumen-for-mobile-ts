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
        const commentObj = resources.comment;
        if (commentObj === undefined) {
            return undefined;
        }

        const index = commentObj.pageIndex;
        if (state.fumen.currentIndex !== index) {
            return undefined;
        }

        resources.comment = undefined;

        return sequence(state, [
            commitCommentText(index, commentObj.text),
            actions.reopenCurrentPage(),
        ]);
    },
};

const commitCommentText = (index: number, text: string) => (state: State): NextState => {
    const page = state.fumen.pages[index];
    if (page === undefined || page.comment.text === text) {
        return undefined;
    }

    if (Quiz.isQuizComment(text)) {
        return commitQuizCommentText(index, text)(state);
    }
    return commitRegularCommentText(index, text)(state);
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

const commitQuizCommentText = (index: number, text: string) => (state: State): NextState => {
    let pages = state.fumen.pages;
    const pagesObj = new Pages(pages);

    const page = pages[index];
    const nextPageIndex = findFirstComment(pages, index + 1);

    const prevComment = pages[index - 1] !== undefined ? pagesObj.getComment(index - 1) : undefined;
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
            pagesObj.unfreezeComment(index);
            tasks.push(toUnfreezeCommentTask(index, backupComment));
        }

        pages = pagesObj.pages;
    } else {
        // textにする
        if (page.comment.text === undefined) {
            // commentをtextに変換する
            pagesObj.freezeComment(index);
            tasks.push(toFreezeCommentTask(index));
        }

        // Quizフラグを更新する
        if (!page.flags.quiz) {
            pagesObj.setQuizFlag(index);
            tasks.push(toSetQuizFlagTask(index));
        }

        // コメントを更新
        pages = pagesObj.pages;
        const currentPage = pages[index];
        const primitivePage = toPrimitivePage(currentPage);
        currentPage.comment = { text };
        tasks.push(toSinglePageTask(index, primitivePage, currentPage));
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
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, index) }),
    ]);
};

const commitRegularCommentText = (index: number, text: string) => (state: State): NextState => {
    let pages = state.fumen.pages;
    const pagesObj = new Pages(pages);

    const page = pages[index];
    const nextPageIndex = findFirstComment(pages, index + 1);

    const prevComment = pages[index - 1] !== undefined ? pagesObj.getComment(index - 1) : undefined;
    const tasks: OperationTask[] = [];

    // テキストにする
    if (prevComment !== undefined && isTextCommentResult(prevComment) && prevComment.text === text) {
        // refにする
        if (page.comment.text !== undefined) {
            // commentをrefに変換する
            const backupComment = page.comment.text;
            pagesObj.unfreezeComment(index);
            tasks.push(toUnfreezeCommentTask(index, backupComment));
        }

        pages = pagesObj.pages;
    } else {
        // textにする
        if (page.comment.text === undefined) {
            // commentをtextに変換する
            pagesObj.freezeComment(index);
            tasks.push(toFreezeCommentTask(index));
        }

        // Quizフラグを更新する
        if (page.flags.quiz) {
            pagesObj.unsetQuizFlag(index);
            tasks.push(toUnsetQuizFlagTask(index));
        }

        // コメントを更新
        pages = pagesObj.pages;
        const currentPage = pages[index];
        const primitivePage = toPrimitivePage(currentPage);
        currentPage.comment = { text };
        tasks.push(toSinglePageTask(index, primitivePage, currentPage));
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
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, index) }),
    ]);
};
