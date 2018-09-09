import { NextState, sequence } from './commons';
import { action, actions } from '../actions';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { resources } from '../states';

export interface CommentActions {
    updateCommentText: (data: { text?: string }) => action;
    commitCommentText: () => action;
}

export const commentActions: Readonly<CommentActions> = {
    updateCommentText: ({ text }) => (state): NextState => {
        if (state.comment.text === text) {
            resources.comment = undefined;
        } else {
            resources.comment = text !== undefined ? text : '';
        }
        return undefined;
    },
    commitCommentText: () => (state): NextState => {
        const text = resources.comment;
        if (text === undefined) {
            return undefined;
        }

        const pages = state.fumen.pages;
        const currentIndex = state.fumen.currentIndex;
        const page = pages[currentIndex];
        if (page === undefined) {
            return undefined;
        }

        const primitivePage = toPrimitivePage(page);

        const prevPageIndex = currentIndex - 1;
        const prevPage = pages[prevPageIndex];

        if (prevPage === undefined || text !== prevPage.comment.text) {
            page.comment = { text };
        } else if (prevPage.comment.ref !== undefined) {
            // 前のページを参照する or 前のページと同じ参照先をコピーする
            page.comment = { ref: prevPage.comment.ref };
        } else {
            page.comment = { ref: prevPageIndex };
        }

        return sequence(state, [
            () => ({
                events: {
                    ...state.events,
                },
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
        ]);
    },
};
