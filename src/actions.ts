import { State } from './states';
import { Block } from './enums';

type action = (state: State) => Partial<State>;

// ===  Up 操作 ===
export interface UpActions {
    up: (value: number) => action;
}

export const upActions: UpActions = {
    up: (value = 1) => state => ({
        count: state.count + value,
    }),
};

// === Down 操作 ===
export interface DownActions {
    down: (value: number) => action;
}

export const downActions: DownActions = {
    down: (value = 1) => state => ({
        count: state.count - value,
    }),
};

// === Off 操作 ===
export interface OffActions {
    off: (data: { x: number, y: number }) => action;
    change: (data: { width: number, height: number }) => action;
    refresh: action;
}

export const offActions: OffActions = {
    off: (data: { x: number, y: number }) => (state) => {
        state.field[data.x + 10 * data.y] = Block.I;
        return { field: state.field };
    },
    change: (data: { width: number, height: number }) => (state) => {
        console.log('action: change');
        return { canvas: data };
    },
    refresh: state => state,
};

// === すべての操作 ===
export type Actions = UpActions & DownActions & OffActions;

export const actions: Actions = {
    ...upActions,
    ...downActions,
    ...offActions,
};
