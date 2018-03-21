import { State } from './states';
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

// === Off 操作 ===
export interface OffActions {
    off: (data: { x: number, y: number }) => action;
}

const offActions: OffActions = {
    off: data => (state) => {
        console.log('action: off');
        state.field[data.x + 10 * data.y] = Piece.I;
        return { field: state.field };
    },
};

// === Fumen 操作 ===
export interface FumenActions {
    setField: (data: { field: Piece[] }) => action;
    refresh: (data: { width: number, height: number }) => action;
}

const fumenActions: FumenActions = {
    setField: data => () => {
        console.log('action: setField');
        return { field: data.field.concat() };
    },
    refresh: data => () => {
        console.log('action: refresh');
        return { display: data };
    },
};

// === すべての操作 ===
export type Actions = UpActions & DownActions & OffActions & FumenActions;

export const actions: Actions = {
    ...upActions,
    ...downActions,
    ...offActions,
    ...fumenActions,
};
