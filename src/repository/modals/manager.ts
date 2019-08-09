import { VNode } from '@hyperapp/hyperapp';
import { State } from '../../states';
import { OpenFumenModal } from '../../componentsv2/modals/open';
import { Actions, main } from '../../actions';
import { MenuModal } from '../../componentsv2/modals/menu';
import { AppendFumenModal } from '../../componentsv2/modals/append';
import { ClipboardModal } from '../../componentsv2/modals/clipboard';
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
            const props = state;
            const modal = managers.caches.get('managers.modals.open', () => {
                return OpenFumenModal(props, actions);
            });
            return modal.render(props);
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
            const modal = managers.caches.get('managers.modals.menu', () => {
                return MenuModal(props, actions);
            });
            return modal.render(props);
        }
        case Scenes.Append: {
            const props = {
                currentIndex: state.fumen.currentIndex,
                maxPage: state.fumen.maxPage,
            };
            const modal = managers.caches.get('managers.modals.append', () => {
                return AppendFumenModal(props, actions);
            });
            return modal.render(props);
        }
        case Scenes.Clipboard: {
            const props = {
                pages: state.fumen.pages,
            };
            const modal = managers.caches.get('managers.modals.append', () => {
                return ClipboardModal(props, actions);
            });
            return modal.render(props);
        }
        }

        return undefined;
    }
}
