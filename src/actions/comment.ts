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
    if (page === undefined) {
        return undefined;
    }

    const prevPageIndex = index - 1;
    const prevPage = pages[prevPageIndex];

    const pagesObj = new Pages(pages);
    const comment = prevPage !== undefined ? pagesObj.getComment(index - 1) : undefined;
    const tasks: OperationTask[] = [];

    if (page.comment.text === text) {
        return;
    }

    const isCurrentQuiz = text.startsWith('#Q=');
    if (isCurrentQuiz) {
        // Quizにする

        console.log(comment);
        console.log(comment !== undefined && isQuizCommentResult(comment) ? comment.quizAfterOperation.format().toString() : '');
        if (comment !== undefined && isQuizCommentResult(comment)
            && comment.quizAfterOperation.format().toString() === text) {
            // refにする
            if (page.comment.text !== undefined) {
                // commentをrefに変換する
                pagesObj.unfreezeComment(index);
                tasks.push(toUnfreezeCommentTask(index));
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
    } else {
        // テキストにする
        if (comment !== undefined && isTextCommentResult(comment) && comment.text === text) {
            // refにする
            if (page.comment.text !== undefined) {
                // commentをrefに変換する
                pagesObj.unfreezeComment(index);
                tasks.push(toUnfreezeCommentTask(index));
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
    }

    return sequence(state, [
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
        }),
        actions.saveToMemento(),
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, index) }),
    ]);
};
