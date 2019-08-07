import { View } from 'hyperapp';
import { div } from '@hyperapp/html';
import { Actions } from './actions';
import { State } from './states';
import { Screens } from './lib/enums';
import { view as readerView } from './views/reader';
import { view as editorView } from './views/editor/editor';
import { managers } from './repository/managers';

export const view: View<State, Actions> = (state, actions) => {
    const selectView = () => {
        const screens = state.mode.screen;
        switch (screens) {
        case Screens.Reader:
            return readerView(state, actions);
        case Screens.Editor:
            return editorView(state, actions);
        default:
            return div(['Unexpected mode']);
        }
    };

    managers.caches.next();

    return div([
        selectView(),

        managers.modals.render(state, actions),
    ]);
};
