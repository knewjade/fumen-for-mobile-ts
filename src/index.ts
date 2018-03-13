import { app, h, View } from 'hyperapp';

class State {
    public constructor(public readonly count: number) {
    }
}

class Actions {
    public down() {
        return (state: State) => new State(state.count - 1);
    }

    public up() {
        return (state: State) => new State(state.count + 1);
    }
}

const view: View<State, Actions> = (state, actions) => {
    return h('main', {}, [
        h('h1', {}, state.count),
        h('button', { onclick: actions.down, disabled: state.count <= 0 }, '-'),
        h('button', { onclick: actions.up }, '+'),
    ]);
};

const mainApp = app(new State(0), new Actions(), view, document.body);

// for unittest
function hello(): string {
    return 'hello';
}
