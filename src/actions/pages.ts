import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { AnimationState, getBlocks, isMinoPiece, Piece } from '../lib/enums';
import { Move, Page, PreCommand } from '../lib/fumen/fumen';
import { Field } from '../lib/fumen/field';
import { Block } from '../state_types';
import { Pages, QuizCommentResult, TextCommentResult } from '../lib/pages';
import { toInsertPageTask, toPrimitivePage, toRemovePageTask } from '../history_task';

export interface PageActions {
    openPage: (data: { index: number }) => action;
    insertPage: (data: { index: number }) => action;
    removePage: (data: { index: number }) => action;
    backLoopPage: () => action;
    nextLoopPage: () => action;
    backPage: () => action;
    nextPageOrNewPage: () => action;
    firstPage: () => action;
    lastPage: () => action;
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
        const blocks = parseToBlocks(field, page.piece, page.commands);

        return sequence(state, [
            state.play.status === AnimationState.Play ? actions.startAnimation() : undefined,
            actions.setComment({ comment: text }),
            actions.setField({
                field: blocks.playField,
                filledHighlight: page.flags.lock,
                inferences: state.events.inferences,
            }),
            actions.setSentLine({ sentLine: blocks.sentLine }),
            actions.setHold({ hold }),
            actions.setNext({ next }),
            () => ({
                fumen: {
                    ...state.fumen,
                    currentIndex: index,
                },
                cache: {
                    currentInitField: field,
                },
            }),
        ]);
    },
    insertPage: ({ index }) => (state): NextState => {
        const pages = new Pages(state.fumen.pages);
        pages.insertPage(index);
        const newPages = pages.pages;

        return sequence(state, [
            actions.registerHistoryTask({ task: toInsertPageTask(index, toPrimitivePage(newPages[index])) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages: newPages,
                    maxPage: newPages.length,
                },
            }),
        ]);
    },
    removePage: ({ index }) => (state): NextState => {
        const fumen = state.fumen.pages;
        const primitivePrev = toPrimitivePage(fumen[index]);

        const pages = new Pages(fumen);
        pages.deletePage(index);
        const newPages = pages.pages;
        const nextIndex = index < newPages.length ? index : newPages.length - 1;
        return sequence(state, [
            actions.registerHistoryTask({ task: toRemovePageTask(index, primitivePrev) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages: newPages,
                    maxPage: newPages.length,
                    currentIndex: nextIndex,
                },
            }),
            actions.openPage({ index: nextIndex }),
        ]);
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

        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            pageActions.openPage({ index: backPage }),
        ]);
    },
    nextPageOrNewPage: () => (state): NextState => {
        const nextPage = state.fumen.currentIndex + 1;
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            state.fumen.maxPage <= nextPage ? pageActions.insertPage({ index: nextPage }) : undefined,
            pageActions.openPage({ index: nextPage }),
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
                    playField[x + y * 10] = { piece, highlight: false };
                    return;
                }
                case 'sentBlock': {
                    const { x, y, piece } = command;
                    sentLine[x + y * 10] = { piece, highlight: false };
                    return;
                }
                }
            });
    }

    if (move !== undefined && isMinoPiece(move.type)) {
        const coordinate = move.coordinate;
        const blocks = getBlocks(move.type, move.rotation);
        for (const block of blocks) {
            const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
            playField[x + y * 10] = {
                piece: move.type,
                highlight: true,
            };
        }
    }

    return { playField, sentLine };
};