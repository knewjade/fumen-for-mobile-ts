import { Piece, TouchTypes } from '../../lib/enums';
import { div } from '@hyperapp/html';
import {
    dualButton,
    dualSwitchButton,
    iconContents,
    rotationButton,
    switchButton,
    switchIconContents,
    toolButton,
    toolSpace,
} from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';
import { Move } from '../../lib/fumen/fumen';

export const pieceMode = ({ layout, keyPage, currentIndex, touchType, move, flags, actions }: {
    layout: EditorLayout;
    keyPage: boolean;
    currentIndex: number;
    touchType: TouchTypes;
    move?: Move;
    flags: {
        lock: boolean;
    },
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
        changeLockFlag: (data: { index: number, enable: boolean }) => void;
    };
}) => {
    const toolButtonMargin = 5;
    const operate = move !== undefined;
    const operateRotation = move !== undefined ? move.rotation : undefined;

    return div({ style: toolStyle(layout) }, [
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-lock-flag',
            key: 'btn-lock-flag',
            onclick: () => actions.changeLockFlag({ index: currentIndex, enable: !flags.lock }),
            enable: flags.lock,
        }, switchIconContents({
            description: 'lock',
            iconSize: 22,
            enable: flags.lock,
        })),
        rotationButton({
            layout,
            rotation: operateRotation,
            highlight: false,
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
            enable: operate,
            onclick: () => actions.moveToLeftEnd(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'skip_previous',
            }),
        }, {
            datatest: 'btn-move-to-right-end',
            key: 'btn-move-to-right-end',
            enable: operate,
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
            enable: operate,
            onclick: () => actions.moveToLeft(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'keyboard_arrow_left',
            }),
        }, {
            datatest: 'btn-move-to-right',
            key: 'btn-move-to-right',
            enable: operate,
            onclick: () => actions.moveToRight(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'keyboard_arrow_right',
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
            datatest: 'btn-rotate-to-left',
            key: 'btn-rotate-to-left',
            enable: operate,
            onclick: () => actions.rotateToLeft(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'rotate_left',
            }),
        }, {
            datatest: 'btn-rotate-to-right',
            key: 'btn-rotate-to-right',
            enable: operate,
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
            datatest: 'btn-harddrop',
            key: 'btn-harddrop',
            enable: operate,
            onclick: () => actions.harddrop(),
        }, iconContents({
            description: 'drop',
            iconSize: 22,
            iconName: 'vertical_align_bottom',
        })),
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
