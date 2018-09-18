import { NextState, sequence } from './commons';
import { action, actions } from '../actions';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { resources, State } from '../states';
import { isQuizCommentResult, Pages } from '../lib/pages';

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
    const pages = state.fumen.pages;
    const page = pages[index];
    if (page === undefined) {
        return undefined;
    }

    const primitivePage = toPrimitivePage(page);

    const prevPageIndex = index - 1;
    const prevPage = pages[prevPageIndex];

    if (text.startsWith('#Q=')) {
        const pagesObj = new Pages(pages);
        const comment = pagesObj.getComment(index);
        if (prevPage === undefined || (isQuizCommentResult(comment) && comment.quiz !== text)) {
            page.comment = { text };
        } else if (prevPage.comment.ref !== undefined) {
            // 前のページを参照する or 前のページと同じ参照先をコピーする
            page.comment = { ref: prevPage.comment.ref };
        } else {
            page.comment = { ref: prevPageIndex };
        }

        page.flags.quiz = true;
    } else {
        if (prevPage === undefined || text !== prevPage.comment.text) {
            page.comment = { text };
        } else if (prevPage.comment.ref !== undefined) {
            // 前のページを参照する or 前のページと同じ参照先をコピーする
            page.comment = { ref: prevPage.comment.ref };
        } else {
            page.comment = { ref: prevPageIndex };
        }

        page.flags.quiz = false;
    }

    return sequence(state, [
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
        }),
        actions.saveToMemento(),
        actions.registerHistoryTask({ task: toSinglePageTask(index, primitivePage, page) }),
    ]);
};
