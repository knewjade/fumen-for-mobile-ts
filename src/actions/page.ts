import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { AnimationState, Piece } from '../lib/enums';
import { Pages, parseToBlocks, QuizCommentResult, TextCommentResult } from '../lib/pages';

export interface PageActions {
    openPage: (data: { index: number }) => action;
    insertPage: (data: { index: number }) => action;
    backLoopPage: () => action;
    nextLoopPage: () => action;
    backPage: () => action;
    nextPageOrNewPage: () => action;
}

export const pageActions: Readonly<PageActions> = {
    openPage: ({ index }) => (state): NextState => {
        const pages = new Pages(state.fumen.pages);

        const comment = pages.getComment(index);

        const isQuiz = (comment: TextCommentResult | QuizCommentResult): comment is QuizCommentResult => {
            return (<QuizCommentResult>comment).quiz !== undefined;
        };

        let text;
        let next;
        let hold;
        if (isQuiz(comment)) {
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

        const field = pages.getField(index);

        const page = state.fumen.pages[index];
        const blocks = parseToBlocks(field, page.piece);

        return sequence(state, [
            state.play.status === AnimationState.Play ? actions.startAnimation() : undefined,
            actions.setComment({ comment: text }),
            actions.setField({ field: blocks.playField, filledHighlight: page.flags.lock }),
            actions.setSentLine({ sentLine: blocks.sentLine }),
            actions.setHold({ hold }),
            actions.setNext({ next }),
            () => ({
                fumen: {
                    ...state.fumen,
                    currentIndex: index,
                },
            }),
        ]);
    },
    insertPage: ({ index }) => (state): NextState => {
        const pages = new Pages(state.fumen.pages);
        pages.insertPage(index);
        const newPages = pages.pages;
        return {
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
            },
        };
    },
    backLoopPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex - 1 + state.fumen.maxPage) % state.fumen.maxPage;
        return pageActions.openPage({ index })(state);
    },
    nextLoopPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex + 1) % state.fumen.maxPage;
        return pageActions.openPage({ index })(state);
    },
    backPage: () => (state): NextState => {
        const backPage = state.fumen.currentIndex - 1;
        if (backPage < 0) return;

        return pageActions.openPage({ index: backPage })(state);
    },
    nextPageOrNewPage: () => (state): NextState => {
        const nextPage = state.fumen.currentIndex + 1;
        if (state.fumen.maxPage <= nextPage) {
            return sequence(state, [
                pageActions.insertPage({ index: nextPage }),
                pageActions.openPage({ index: nextPage }),
            ]);
        }
        return pageActions.openPage({ index: nextPage })(state);
    },
};
