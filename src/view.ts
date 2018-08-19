import { View } from 'hyperapp';
import { div } from '@hyperapp/html';
import { Actions } from './actions';
import { State } from './states';
import { Screens } from './lib/enums';
import { view as readerView } from './views/reader';
import { view as editorView } from './views/editor';

export const view: View<State, Actions> = (state, actions) => {
    switch (state.mode.screen) {
    case Screens.Reader:
        return readerView(state, actions);
    case Screens.Editor:
        return editorView(state, actions);
    }
    return div(['Unexpected mode']);
};
