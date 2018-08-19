import { State } from '../states';
import { action } from '../actions';

export type NextState = Partial<State> | undefined;

export function sequence(
    state: Readonly<State>,
    actions: (action | undefined)[],
): Partial<Readonly<State>> {
    let currentState = state;
    let merged: Partial<Readonly<State>> = {};
    for (const action of actions) {
        if (action === undefined) {
            continue;
        }

        const partial = action(currentState);
        merged = {
            ...merged,
            ...partial,
        };
        currentState = {
            ...state,
            ...merged,
        };
    }
    return merged;
}
