import { Block, initState, State } from './states';
import { AnimationState, Piece } from './lib/enums';
import { decode, Page } from './lib/fumen/fumen';
import { view } from './view';
import { app } from 'hyperapp';

export type action = (state: Readonly<State>) => Partial<State> | undefined;

export interface Actions {
    loadFumen: (args: { fumen: string }) => action;
    updatePages: (args: { pages: Page[] }) => action;
    inputFumenData: (args: { value?: string }) => action;
    startAnimation: () => action;
    pauseAnimation: () => action;


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
    openPage: (data: { pageIndex: number }) => action;
    backPage: () => action;
    nextPage: () => action;
    showOpenErrorMessage: (data: { message: string }) => action;
}

export const actions: Readonly<Actions> = {
    loadFumen: ({ fumen }) => (state) => {
        log('action: loadFumen = ' + fumen);

        (async () => {
            const pages: Page[] = [];
            await decode(fumen, (page) => {
                pages[page.index] = page;
            });
            router.updatePages({ pages });
        })();

        return undefined;
    },
    updatePages: ({ pages }) => (state) => {
        log('action: updatePages = ' + pages.length);

        return mix(state, [
            supportActions.setMaxPage({ maxPage: pages.length }),
            () => ({ fumen: { pages } }),
        ]);
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
    startAnimation: () => (state) => {
        log('action: startAnimation');
        return {
            play: {
                ...state.play,
                status: AnimationState.Play,
            },
        };
    },
    pauseAnimation: () => (state) => {
        log('action: pauseAnimation');
        return {
            play: {
                ...state.play,
                status: AnimationState.Pause,
            },
        };
    },

    setPage: ({ pageIndex, field, blockUp, comment, hold, nexts }) => (state) => {
        log('action: setFieldAndComment');

        const isChanged = comment !== undefined && comment !== state.comment.text;
        return {
            field,
            hold,
            nexts,
            sentLine: blockUp !== undefined ? blockUp : state.sentLine,
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
        return undefined;
    },


    openPage: ({ pageIndex }) => (state) => {
        log('action: openPage');
        return undefined;
    },
    backPage: () => (state) => {
        log('action: backPage');
        return undefined;
    },
    nextPage: () => (state) => {
        log('action: nextPage');
        return {};
    },


    showOpenErrorMessage: ({ message }) => (state) => {
        log('action: showOpenErrorMessage');
        return undefined;
    },
};

interface SupportActions {
    setMaxPage: (data: { maxPage: number }) => action;
}

const supportActions: SupportActions = {
    setMaxPage: ({ maxPage }: { maxPage: number }) => (): Partial<State> => {
        log('support action: setMaxPage = ' + maxPage);
        return { maxPage };
    },
};

function log(msg: string) {
    console.log(msg);
}

function mix(
    state: Readonly<State>,
    actions: action[],
): Partial<Readonly<State>> {
    let merged: Partial<Readonly<State>> = {};
    for (const action of actions) {
        const partial = action(state);
        merged = {
            ...merged,
            ...partial,
        };
    }
    return merged;
}

export const router = app(initState, actions, view(), document.body);

window.onresize = () => {
    router.resize({
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    });
};

function extractFumenFromURL() {
    const url = decodeURIComponent(location.search);
    const paramQuery = url.substr(1).split('&').find(value => value.startsWith('d='));
    return paramQuery !== undefined ? paramQuery.substr(2) : 'v115@vhAAgH';
}

router.loadFumen({ fumen: extractFumenFromURL() });
