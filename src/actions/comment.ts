import { NextState, sequence } from './commons';
import { action, actions } from '../actions';
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
import { resources, State } from '../states';
import { isQuizCommentResult, isTextCommentResult, Pages } from '../lib/pages';
import { Quiz } from '../lib/fumen/quiz';
import { Page } from '../lib/fumen/types';

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

        if (state.comment.text === text) {
            resources.comment = undefined;
        } else {
            resources.comment = {
                pageIndex,
                text: text !== undefined ? text : '',
            };
        }

        return undefined;
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
    let pages = state.fumen.pages;
    const page = pages[index];
    if (page === undefined || page.comment.text === text) {
        return undefined;
    }

    const prevPage: Page | undefined = pages[index - 1];

    let nextPageIndex: number | undefined = undefined;
    for (let i = index + 1; i < pages.length; i += 1) {
        if (pages[i].comment.text !== undefined) {
            nextPageIndex = i;
        }
    }

    const pagesObj = new Pages(pages);
    const prevComment = prevPage !== undefined ? pagesObj.getComment(index - 1) : undefined;
    const tasks: OperationTask[] = [];

    // 新しく追加するコメントがQuizか
    const isCurrentQuiz = Quiz.isQuizComment(text);
    if (isCurrentQuiz) {
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
            const c = pagesObj.getComment(nextPageIndex - 1);
            if (isQuizCommentResult(c)) {
                const p = c.quizAfterOperation.format().toString();
                const nextPage = pages[nextPageIndex];
                if (nextPage.comment.text !== undefined && nextPage.comment.text === p) {
                    // commentをrefに変換する
                    const backupComment = nextPage.comment.text;
                    pagesObj.unfreezeComment(nextPageIndex);
                    tasks.push(toUnfreezeCommentTask(nextPageIndex, backupComment));
                }
            }
        }
    } else {
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
