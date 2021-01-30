import { View } from 'hyperapp';
import { div } from '@hyperapp/html';
import { Actions } from './actions';
import { State } from './states';
import { Screens } from './lib/enums';
import { view as readerView } from './views/reader';
import { view as editorView } from './views/editor/editor';
import { OpenFumenModal } from './components/modals/open';
import { MenuModal } from './components/modals/menu';
import { AppendFumenModal } from './components/modals/append';
import { ClipboardModal } from './components/modals/clipboard';
import { UserSettingsModal } from './components/modals/user_settings';

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

    return div([
        selectView(),

        state.modal.fumen ? OpenFumenModal({
            actions,
            errorMessage: state.fumen.errorMessage,
            textAreaValue: state.fumen.value !== undefined ? state.fumen.value : '',
        }) : undefined as any,

        state.modal.menu ? MenuModal({
            actions,
            version: state.version,
            screen: state.mode.screen,
            currentIndex: state.fumen.currentIndex,
            maxPageIndex: state.fumen.maxPage,
            comment: state.mode.comment,
        }) : undefined as any,

        state.modal.append ? AppendFumenModal({
            actions,
            errorMessage: state.fumen.errorMessage,
            textAreaValue: state.fumen.value !== undefined ? state.fumen.value : '',
            currentIndex: state.fumen.currentIndex,
            maxPage: state.fumen.maxPage,
        }) : undefined as any,

        state.modal.clipboard ? ClipboardModal({
            actions,
            pages: state.fumen.pages,
        }) : undefined as any,

        state.modal.userSettings ? UserSettingsModal({
            actions,
            ghostVisible: state.temporary.userSettings.ghostVisible,
        }) : undefined as any,
    ]);
};
