import { VNode } from '@hyperapp/hyperapp';
import { State } from '../../states';
import { OpenFumenModal } from '../../components/modals/open';
import { Actions } from '../../actions';
import { MenuModal } from '../../components/modals/menu';
import { AppendFumenModal } from '../../components/modals/append';
import { ClipboardModal } from '../../components/modals/clipboard';

export enum Scenes {
    Open = 'Open',
    Menu = 'Menu',
    Append = 'Append',
    Clipboard = 'Clipboard',
}

export class ModalManager {
    private scene: string | null = null;

    next(scene: Scenes) {
        this.scene = scene;
    }

    close() {
        this.scene = null;
    }

    closeAll() {
        this.scene = null;
    }

    html(state: State, actions: Actions): VNode | undefined {
        switch (this.scene) {
        case Scenes.Open:
            return OpenFumenModal({
                actions,
                errorMessage: state.fumen.errorMessage,
                textAreaValue: state.fumen.value !== undefined ? state.fumen.value : '',
            });
        case Scenes.Menu:
            return MenuModal({
                actions,
                version: state.version,
                pages: state.fumen.pages,
                screen: state.mode.screen,
                currentIndex: state.fumen.currentIndex,
                maxPageIndex: state.fumen.maxPage,
                comment: state.mode.comment,
                ghostVisible: state.mode.ghostVisible,
            });
        case Scenes.Append:
            return AppendFumenModal({
                actions,
                errorMessage: state.fumen.errorMessage,
                textAreaValue: state.fumen.value !== undefined ? state.fumen.value : '',
                currentIndex: state.fumen.currentIndex,
                maxPage: state.fumen.maxPage,
            });
        case Scenes.Clipboard:
            return ClipboardModal({
                actions,
                pages: state.fumen.pages,
            });
        }

        return undefined;
    }
}
