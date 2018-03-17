import { h, View } from 'hyperapp';
import { button, div, h1, main, span } from '@hyperapp/html';

export interface State {
    count: number;
}

export class Actions {
    public up(): (state: State) => State {
        return state => ({ count: state.count + 1 });
    }

    public down(): (state: State) => State {
        return state => ({ count: state.count - 1 });
    }
}

export const counter: () => View<State, Actions> = () => (state, actions) => (
    div([
        h1(state.count),
        button({ onclick: actions.down, disabled: state.count <= 0 }, '-'),
        button({ onclick: actions.up }, '+'),
    ])
);

export const view: View<State, Actions> = (state, actions) => (
    <main>
        <button onclick={() => actions.down()}>-</button>
        <span>{state.count}</span>
        <button onclick={() => actions.up()}>+</button>
    </main>
);
