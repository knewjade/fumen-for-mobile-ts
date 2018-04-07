import { Block, State } from './states';
import { AnimationState, Piece } from './lib/enums';

export type action = update | refresh;
export type update = (state: Readonly<State>) => Partial<Readonly<State>>;
export type refresh = (state: Readonly<State>) => undefined;

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
    loadFumen: (data: { value?: string }) => action;
    showOpenErrorMessage: (data: { message: string }) => action;
    stopAnimation: () => action;
    startAnimation: () => action;
}

function log(msg: string) {
    console.log(msg);
}

export const actions: Readonly<Actions> = {
    setPage: ({ pageIndex, field, blockUp, comment, hold, nexts }) => (state): Partial<State> => {
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
    setComment: ({ comment }) => (state): Partial<State> => {
        log('action: setComment');

        const isChanged = comment !== undefined && comment !== state.comment.text;
        return {
            comment: {
                isChanged,
                text: comment !== undefined ? comment : state.comment.text,
            },
        };
    },
    resize: data => (): Partial<State> => {
        log('action: resize');
        return { display: data };
    },
    reload: () => (state): undefined => {
        log('action: reload');
        return undefined;
    },
    start: () => (state): Partial<State> => {
        log('action: start');
        return {
            play: {
                ...state.play,
                status: AnimationState.Play,
            },
        };
    },
    pause: () => (state): Partial<State> => {
        log('action: pause');
        return {
            play: {
                ...state.play,
                status: AnimationState.Pause,
            },
        };
    },
    setMaxPage: data => (): Partial<State> => {
        log('action: setMaxPage');
        return data;
    },
    openPage: ({ pageIndex }) => (state): undefined => {
        log('action: openPage');
        return undefined;
    },
    backPage: () => (state): undefined => {
        log('action: backPage');
        return undefined;
    },
    nextPage: () => (state): undefined => {
        log('action: nextPage');
        return undefined;
    },
    inputFumenData: ({ value }) => (state): Partial<State> => {
        log('action: inputFumenData');
        return {
            fumen: {
                ...state.fumen,
                value,
                errorMessage: undefined,
            },
        };
    },
    loadFumen: ({ value }) => (state): undefined => {
        log('action: loadFumen');
        return undefined;
    },
    stopAnimation: () => (): undefined => {
        log('action: stopAnimation');
        return undefined;
    },
    startAnimation: () => (): undefined => {
        log('action: startAnimation');
        return undefined;
    },
    showOpenErrorMessage: ({ message }) => (state): undefined => {
        log('action: showOpenErrorMessage');
        return undefined;
    },
};
