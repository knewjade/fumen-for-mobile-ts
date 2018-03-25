import { Block, State } from './states';
import { AnimationState, getBlocks, isMinoPiece, Piece } from './lib/enums';
import { ViewError } from './lib/error';
import { resources } from './index';
import { Quiz } from './lib/quiz';

export type action = (state: State) => Partial<State>;

export interface Actions {
    setPage: (data: {
        pageIndex: number,
        field: Block[],
        blockUp?: Block[],
        comment?: string,
        hold?: Piece,
        nexts?: Piece[],
    }) => action;
    setComment: (data: { comment: string }) => action;
    resize: (data: { width: number, height: number }) => action;
    reload: () => action;
    pause: () => action;
    start: () => action;
    setMaxPage: (data: { maxPage: number }) => action;
    openPage: (data: { pageIndex: number }) => action;
    backPage: () => action;
    nextPage: () => action;
    inputFumenData: (data: { value?: string }) => action;
    showOpenErrorMessage: (data: { message: string }) => action;
}

function log(msg: string) {
    // console.log(msg);
}

export const actions: Actions = {
    setPage: ({ pageIndex, field, blockUp, comment, hold, nexts }) => (state) => {
        log('action: setFieldAndComment');

        const isChanged = comment !== undefined && comment !== state.comment.text;
        return {
            field,
            hold,
            nexts,
            blockUp: blockUp !== undefined ? blockUp : state.blockUp,
            comment: {
                isChanged,
                text: comment !== undefined ? comment : state.comment.text,
            },
            play: {
                ...state.play,
                pageIndex,
            },
        };
    },
    setComment: ({ comment }) => (state) => {
        log('action: setComment');

        const isChanged = comment !== undefined && comment !== state.comment.text;
        return {
            comment: {
                isChanged,
                text: comment !== undefined ? comment : state.comment.text,
            },
        };
    },
    resize: data => () => {
        log('action: resize');
        return { display: data };
    },
    reload: () => (state) => {
        log('action: reload');
        const action = actions.openPage({ pageIndex: state.play.pageIndex });
        return action(state);
    },
    start: () => (state) => {
        log('action: start');
        return {
            play: {
                ...state.play,
                status: AnimationState.Play,
            },
        };
    },
    pause: () => (state) => {
        log('action: pause');
        return {
            play: {
                ...state.play,
                status: AnimationState.Pause,
            },
        };
    },
    setMaxPage: data => () => {
        log('action: setMaxPage');
        return data;
    },
    openPage: ({ pageIndex }) => (state) => {
        log('action: openPage');
        const action = openPage(pageIndex);
        return action(state);
    },
    backPage: () => (state) => {
        log('action: backPage');
        const maxPage = state.maxPage;
        const action = openPage((state.play.pageIndex - 1 + maxPage) % maxPage);
        return action(state);
    },
    nextPage: () => (state) => {
        log('action: nextPage');
        const maxPage = state.maxPage;
        const action = openPage((state.play.pageIndex + 1) % maxPage);
        return action(state);
    },
    inputFumenData: ({ value }) => (state) => {
        log('action: inputFumenData');
        return {
            fumen: {
                ...state.fumen,
                value,
                errorMessage: undefined,
            },
        };
    },
    showOpenErrorMessage: ({ message }) => (state) => {
        log('action: showOpenErrorMessage');
        return {
            fumen: {
                ...state.fumen,
                errorMessage: message,
            },
        };
    },
};

function openPage(index: number): action {
    const page = resources.pages[index];

    if (page === undefined) {
        throw new ViewError('Cannot open page');
    }

    const field: Block[] = page.field.map((value) => {
        return {
            piece: value,
        };
    });
    const move = page.move;
    if (isMinoPiece(move.piece)) {
        const coordinate = move.coordinate;
        const blocks = getBlocks(move.piece, move.rotation);
        for (const block of blocks) {
            const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
            field[x + y * 10] = {
                piece: move.piece,
                highlight: true,
            };
        }
    }

    const blockUp = page.blockUp.map((value) => {
        return {
            piece: value,
        };
    });

    let comment = resources.pages[page.commentRef].comment;
    let hold;
    let nexts: Piece[] = [];
    if (comment !== undefined && comment.startsWith('#Q=')) {
        let quiz = new Quiz(comment);

        for (let i = page.commentRef; i < index; i += 1) {
            const operation = resources.pages[i].quizOperation;
            if (operation !== undefined) {
                quiz = quiz.operate(operation);
            }
        }

        comment = quiz.toStr();

        const operation = resources.pages[index].quizOperation;
        if (operation !== undefined) {
            quiz = quiz.operate(operation);
        }

        hold = quiz.getHold();
        nexts = quiz.getNexts(5);
    } else {
        for (const page of resources.pages.slice(index + 1)) {
            const piece = page.move.piece;
            if (page.isLock && isMinoPiece(piece)) {
                nexts.push(piece);
            }

            if (5 <= nexts.length) {
                break;
            }
        }
    }

    return actions.setPage({
        field,
        hold,
        nexts,
        blockUp,
        comment,
        pageIndex: index,
    });
}
