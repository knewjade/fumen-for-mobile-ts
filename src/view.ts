import { View } from 'hyperapp';
import { button, h1, main } from '@hyperapp/html';
import { Actions, DownActions, UpActions } from './actions';
import { State } from './states';

// === メイン ===
export const view: View<State, Actions<State>> = (state, actions) => (
    main([
        h1(state.count),
        up(state.count, actions),
        down(state.count, actions),
    ])
);

// ===  Up 操作 ===
const up: View<number, UpActions> = (count, actions) => (
    button({ onclick: () => actions.up(3), disabled: 10 <= count }, '+3')
);

// === Down 操作 ===
const down: View<number, DownActions> = (count, actions) => (
    button({ onclick: () => actions.down(2), disabled: count <= 0 }, '-2')
);
