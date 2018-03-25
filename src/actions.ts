import { Block, State } from './states';
import { AnimationState, getBlocks, isMinoPiece, Piece } from './lib/enums';
import { ViewError } from './lib/error';
import { resources } from './index';

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
    refresh: (data: { width: number, height: number }) => action;
    pause: () => action;
    start: () => action;
    setMaxPage: (data: { maxPage: number }) => action;
    backPage: () => action;
    nextPage: () => action;
    goToHead: () => action;
}

export const actions: Actions = {
    setPage: ({ pageIndex, field, blockUp, comment, hold, nexts }) => (state) => {
        console.log('action: setFieldAndComment');

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
    refresh: data => () => {
        console.log('action: refresh');
        return { display: data };
    },
    start: () => (state) => {
        return {
            play: {
                ...state.play,
                status: AnimationState.Play,
            },
        };
    },
    pause: () => (state) => {
        return {
            play: {
                ...state.play,
                status: AnimationState.Pause,
            },
        };
    },
    setMaxPage: data => () => {
        return data;
    },
    backPage: () => (state) => {
        const maxPage = state.maxPage;
        const action = openPage((state.play.pageIndex - 1 + maxPage) % maxPage);
        return action(state);
    },
    nextPage: () => (state) => {
        const maxPage = state.maxPage;
        const action = openPage((state.play.pageIndex + 1) % maxPage);
        return action(state);
    },
    goToHead: () => (state) => {
        const action = openPage(0);
        return action(state);
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

    return actions.setPage({
        field,
        blockUp,
        comment: page.comment,
        pageIndex: index,
    });
}
