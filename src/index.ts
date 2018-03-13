import { app, View } from 'hyperapp';
import { button, h1, main } from '@hyperapp/html';

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
    return main([
        h1(state.count),
        button({ onclick: actions.down, disabled: state.count <= 0 }, '-'),
        button({ onclick: actions.up }, '+'),
    ]);
};

const mainApp = app(new State(0), new Actions(), view, document.body);

// for unittest
function hello(): string {
    return 'hello';
}
