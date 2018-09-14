import { NextState, sequence } from './commons';
import { action, actions } from '../actions';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { resources } from '../states';
import { isQuizCommentResult, Pages } from '../lib/pages';

export interface CommentActions {
    updateCommentText: (data: { text?: string, pageIndex: number }) => action;
    commitCommentText: () => action;
}

export const commentActions: Readonly<CommentActions> = {
    updateCommentText: ({ text, pageIndex }) => (state): NextState => {
        if (state.fumen.currentIndex !== pageIndex) {
            return undefined;
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

        resources.comment = undefined;

        const currentIndex = commentObj.pageIndex;
        if (state.fumen.currentIndex !== currentIndex) {
            return undefined;
        }

        const pages = state.fumen.pages;
        const page = pages[currentIndex];
        if (page === undefined) {
            return undefined;
        }

        const primitivePage = toPrimitivePage(page);

        const prevPageIndex = currentIndex - 1;
        const prevPage = pages[prevPageIndex];

        const text = commentObj.text;
        if (text.startsWith('#Q=')) {
            // Quiz
            page.flags.quiz = true;

            const pagesObj = new Pages(pages);
            const comment = pagesObj.getComment(currentIndex);
            if (prevPage === undefined || (isQuizCommentResult(comment) && comment.quiz !== text)) {
                page.comment = { text };
            } else if (prevPage.comment.ref !== undefined) {
                // 前のページを参照する or 前のページと同じ参照先をコピーする
                page.comment = { ref: prevPage.comment.ref };
            } else {
                page.comment = { ref: prevPageIndex };
            }
        } else {
            page.flags.quiz = false;
            if (prevPage === undefined || text !== prevPage.comment.text) {
                page.comment = { text };
            } else if (prevPage.comment.ref !== undefined) {
                // 前のページを参照する or 前のページと同じ参照先をコピーする
                page.comment = { ref: prevPage.comment.ref };
            } else {
                page.comment = { ref: prevPageIndex };
            }
        }

        resources.comment = undefined;

        return sequence(state, [
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            state.fumen.currentIndex === currentIndex ? actions.reopenCurrentPage() : undefined,
        ]);
    },
};
