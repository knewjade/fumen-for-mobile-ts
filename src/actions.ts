import { Block, State } from './states';
import { Piece } from './lib/enums';

export type action = (state: State) => Partial<State>;

export interface Actions {
    setFieldAndComment: (data: { field: Block[], comment?: string, hold?: Piece, nexts?: Piece[] }) => action;
    refresh: (data: { width: number, height: number }) => action;
    pause: () => action;
    start: () => action;
}

export const actions: Actions = {
    setFieldAndComment: ({ field, comment, hold, nexts }) => (state) => {
        console.log('action: setFieldAndComment');

        const isChanged = comment !== undefined && comment !== state.comment.text;
        return {
            field,
            hold,
            nexts,
            comment: {
                textColor: isChanged ? 'white' : 'black',
                backgroundColor: isChanged ? 'green' : 'white',
                text: comment !== undefined ? comment : state.comment.text,
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
                status: 'play',
            },
        };
    },
    pause: () => (state) => {
        return {
            play: {
                ...state.play,
                status: 'pause',
            },
        };
    },
};
