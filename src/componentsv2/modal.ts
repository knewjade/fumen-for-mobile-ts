import { managers } from '../repository/managers';
import { Scenes } from '../repository/modals/manager';

declare const M: any;

export const createModal = (scene: Scenes, elementId?: string) => {
    let modalInstance: { close: () => void } | undefined;

    return {
        onCreate: (element: HTMLDivElement) => {
            const instance = M.Modal.init(element, {
                onOpenEnd: () => {
                    if (elementId === undefined) {
                        return;
                    }

                    const element = document.getElementById(elementId);
                    if (element !== null) {
                        element.focus();
                    }
                },
                onCloseStart: () => {
                    managers.modals.close(scene);
                },
            });

            instance.open();

            modalInstance = instance;
        },
        onDestroy: () => {
            if (modalInstance !== undefined) {
                modalInstance.close();
            }
        },
    };
};
