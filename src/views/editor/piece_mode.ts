import { Piece, TouchTypes } from '../../lib/enums';
import { div } from '@hyperapp/html';
import { dualButton, dualSwitchButton, iconContents, toolButton, toolSpace } from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';

export const pieceMode = ({ layout, keyPage, currentIndex, touchType, operatePiece, actions }: {
    layout: EditorLayout;
    keyPage: boolean;
    currentIndex: number;
    touchType: TouchTypes;
    operatePiece: boolean;
    actions: {
        selectPieceColor: (data: { piece: Piece }) => void;
        selectInferencePieceColor: () => void;
        changeToDrawPieceMode: () => void;
        changeToMovePieceMode: () => void;
        clearPiece: () => void;
        rotateToLeft: () => void;
        rotateToRight: () => void;
        moveToLeft: () => void;
        moveToLeftEnd: () => void;
        moveToRight: () => void;
        moveToRightEnd: () => void;
        harddrop: () => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
        dualButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
        }, {
            datatest: 'btn-move-to-left-end',
            key: 'btn-move-to-left-end',
            enable: operatePiece,
            onclick: () => actions.moveToLeftEnd(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'skip_previous',
            }),
        }, {
            datatest: 'btn-move-to-right-end',
            key: 'btn-move-to-right-end',
            enable: operatePiece,
            onclick: () => actions.moveToRightEnd(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'skip_next',
            }),
        }),
        dualButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
        }, {
            datatest: 'btn-move-to-left',
            key: 'btn-move-to-left',
            enable: operatePiece,
            onclick: () => actions.moveToLeft(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'keyboard_arrow_left',
            }),
        }, {
            datatest: 'btn-move-to-right',
            key: 'btn-move-to-right',
            enable: operatePiece,
            onclick: () => actions.moveToRight(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'keyboard_arrow_right',
            }),
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-harddrop',
            key: 'btn-harddrop',
            enable: operatePiece,
            onclick: () => actions.harddrop(),
        }, iconContents({
            description: 'drop',
            iconSize: 22,
            iconName: 'vertical_align_bottom',
        })),
        dualButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
        }, {
            datatest: 'btn-rotate-to-left',
            key: 'btn-rotate-to-left',
            enable: operatePiece,
            onclick: () => actions.rotateToLeft(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'rotate_left',
            }),
        }, {
            datatest: 'btn-rotate-to-right',
            key: 'btn-rotate-to-right',
            enable: operatePiece,
            onclick: () => actions.rotateToRight(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'rotate_right',
            }),
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-reset-piece',
            key: 'btn-reset-piece',
            onclick: () => actions.clearPiece(),
        }, iconContents({
            description: 'reset',
            iconSize: 22,
            iconName: 'clear',
        })),
        dualSwitchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
        }, {
            datatest: 'btn-move-piece',
            key: 'btn-move-piece',
            enable: touchType === TouchTypes.MovePiece,
            onclick: () => actions.changeToMovePieceMode(),
            contents: iconContents({
                description: '',
                iconSize: 18,
                iconName: 'pan_tool',
            }),
        }, {
            datatest: 'btn-draw-piece',
            key: 'btn-draw-piece',
            enable: touchType === TouchTypes.Piece,
            onclick: () => actions.changeToDrawPieceMode(),
            contents: iconContents({
                description: '',
                iconSize: 21,
                iconName: 'edit',
            }),
        }),
    ]);
};
