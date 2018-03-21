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
    off: (data: { x: number, y: number }) => (state) => {
        console.log('action: off');
        state.field[data.x + 10 * data.y] = Piece.I;
        return { field: state.field };
    },
};

// === Off 操作 ===
export interface FumenActions {
    setField: (data: { field: Piece[] }) => action;
}

const fumenActions: FumenActions = {
    setField: (data: { field: Piece[] }) => (state) => {
        console.log('action: setField');
        return { field: data.field.concat() };
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
