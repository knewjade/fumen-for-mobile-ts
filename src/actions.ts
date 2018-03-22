import { Block, State } from './states';
import { Piece } from './lib/enums';

export type action = (state: State) => Partial<State>;

// ===  Up 操作 ===
export interface UpActions {
    up: (value: number) => action;
}

const upActions: UpActions = {
    up: (value = 1) => state => ({
        count: state.count + value,
    }),
};

// === Down 操作 ===
export interface DownActions {
    down: (value: number) => action;
}

const downActions: DownActions = {
    down: (value = 1) => state => ({
        count: state.count - value,
    }),
};

// === Fumen 操作 ===
export interface FumenActions {
    setFieldAndComment: (data: { field: Block[], comment?: string, hold?: Piece, nexts?: Piece[] }) => action;
    refresh: (data: { width: number, height: number }) => action;
}

const fumenActions: FumenActions = {
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
};

// === すべての操作 ===
export type Actions = UpActions & DownActions & FumenActions;

export const actions: Actions = {
    ...upActions,
    ...downActions,
    ...fumenActions,
};
