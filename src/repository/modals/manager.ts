import { VNode } from '@hyperapp/hyperapp';
import { State } from '../../states';
import { OpenFumenModal } from '../../componentsv2/modals/open';
import { Actions, main } from '../../actions';
import { MenuModal } from '../../componentsv2/modals/menu';
import { AppendFumenModal } from '../../components/modals/append';
import { ClipboardModal } from '../../components/modals/clipboard';
import { managers } from '../managers';

export enum Scenes {
    Open = 'Open',
    Menu = 'Menu',
    Append = 'Append',
    Clipboard = 'Clipboard',
}

export class ModalManager {
    private scene: Scenes | null = null;

    next(scene: Scenes) {
        this.scene = scene;
        main.refresh();
    }

    close(scene: Scenes) {
        if (this.scene === scene) {
            this.scene = null;
        }
        main.refresh();
    }

    closeAll() {
        this.scene = null;
        main.refresh();
    }

    render(state: State, actions: Actions): VNode | undefined {
        switch (this.scene) {
        case Scenes.Open: {
            const modal = managers.caches.get('open-fumen-modal', () => {
                return OpenFumenModal(state, actions);
            });
            return modal.render(state);
        }
        case Scenes.Menu: {
            const props = {
                version: state.version,
                pages: state.fumen.pages,
                screen: state.mode.screen,
                currentIndex: state.fumen.currentIndex,
                maxPageIndex: state.fumen.maxPage,
                comment: state.mode.comment,
                ghostVisible: state.mode.ghostVisible,
            };
            const modal = managers.caches.get('open-menu-modal', () => {
                return MenuModal(props, actions);
            });
            return modal.render(props);
        }
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
