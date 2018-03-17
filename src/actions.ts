import { ActionType } from 'hyperapp';
import { State } from './states';

// ===  Up 操作 ===
export interface UpActions {
    up: ActionType<State, Actions<State>>;
}

export const upActions: UpActions = {
    up: (value = 1) => state => ({
        ...state,
        count: state.count + value,
    }),
};

// === Down 操作 ===
export interface DownActions {
    down: ActionType<State, Actions<State>>;
}

export const downActions: DownActions = {
    down: (value = 1) => state => ({
        ...state,
        count: state.count - value,
    }),
};

// === すべての操作 ===
export type Actions<State> = UpActions & DownActions;

export const actions: Actions<State> = {
    ...upActions,
    ...downActions,
};
