import { TouchTypes } from '../../lib/enums';
import { div } from '@hyperapp/html';
import { iconContents, keyButton, toolButton, toolSpace } from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';

export const toolMode = ({ layout, currentIndex, keyPage, touchType, actions }: {
    layout: EditorLayout;
    currentIndex: number;
    keyPage: boolean;
    touchType: TouchTypes;
    actions: {
        removePage: (data: { index: number }) => void;
        duplicatePage: (data: { index: number }) => void;
        openPage: (data: { index: number }) => void;
        insertNewPage: (data: { index: number }) => void;
        changeToDrawingMode: () => void;
        changeToFlagsMode: () => void;
        changeToShiftMode: () => void;
        changeToFillRowMode: () => void;
        changeToDrawPieceMode: () => void;
        changeToRef: (data: { index: number }) => void;
        changeToKey: (data: { index: number }) => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        keyButton({
            toolButtonMargin,
            keyPage,
            currentIndex,
            actions,
            width: layout.buttons.size.width,
            height: layout.buttons.size.height,
        }),
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-insert-new-page',
            key: 'btn-insert-new-page',
            onclick: () => {
                actions.insertNewPage({ index: currentIndex + 1 });
            },
        }, iconContents({
            description: 'add',
            iconSize: 22,
            iconName: 'note_add',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-duplicate-page',
            key: 'btn-duplicate-page',
            onclick: () => {
                const nextPage = currentIndex + 1;
                actions.duplicatePage({ index: nextPage });
                actions.openPage({ index: nextPage });
            },
        }, iconContents({
            description: 'copy',
            iconSize: 22,
            iconName: 'content_copy',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-remove-page',
            key: 'btn-remove-page',
            onclick: () => actions.removePage({ index: currentIndex }),
        }, iconContents({
            description: 'remove',
            iconSize: 22,
            iconName: 'remove_circle_outline',
        })),
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: touchType === TouchTypes.FillRow ? '#fff' : '#f44336',
            borderType: touchType === TouchTypes.FillRow ? 'double' : undefined,
            datatest: 'btn-fill-row-mode',
            key: 'btn-fill-row-mode',
            onclick: () => actions.changeToFillRowMode(),
        }, iconContents({
            description: 'row',
            iconSize: 24,
            iconName: 'power_input',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#f44336',
            datatest: 'btn-slide-mode',
            key: 'btn-slide-mode',
            onclick: () => actions.changeToShiftMode(),
        }, iconContents({
            description: 'slide',
            iconSize: 24,
            iconName: 'swap_vert',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#f44336',
            datatest: 'btn-flags-mode',
            key: 'btn-flags-mode',
            onclick: () => actions.changeToFlagsMode(),
        }, iconContents({
            description: 'flags',
            iconSize: 24,
            iconName: 'flag',
        })),
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: touchType === TouchTypes.Piece ? '#fff' : '#f44336',
            borderType: touchType === TouchTypes.Piece ? 'double' : undefined,
            datatest: 'btn-piece-mode',
            key: 'btn-piece-mode',
            onclick: () => actions.changeToDrawPieceMode(),
        }, iconContents({
            description: 'piece',
            iconSize: 20,
            iconName: 'extension',
        })),
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: touchType === TouchTypes.Drawing ? '#fff' : '#f44336',
            borderType: touchType === TouchTypes.Drawing ? 'double' : undefined,
            datatest: 'btn-block-mode',
            key: 'btn-block-mode',
            onclick: () => actions.changeToDrawingMode(),
        }, iconContents({
            description: 'block',
            iconSize: 22,
            iconName: 'edit',
        })),
    ]);
};
