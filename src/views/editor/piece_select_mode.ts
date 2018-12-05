import { Piece } from '../../lib/enums';
import { div } from '@hyperapp/html';
import { colorButton, iconContents, toolButton, toolSpace } from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';

export const pieceSelectMode = ({ layout, keyPage, currentIndex, modePiece, colorize, actions }: {
    layout: EditorLayout;
    keyPage: boolean;
    currentIndex: number;
    modePiece: Piece | undefined;
    colorize: boolean;
    actions: {
        spawnPiece: (data: { piece: Piece }) => void;
        clearPiece: () => void;
        changeToDrawPieceMode: () => void;
    };
}) => {
    const pieces = [Piece.I, Piece.L, Piece.O, Piece.Z, Piece.T, Piece.J, Piece.S];

    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
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
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#f44336',
            datatest: 'btn-reset-piece',
            key: 'btn-reset-piece',
            onclick: () => {
                actions.changeToDrawPieceMode();
                actions.clearPiece();
            },
        }, iconContents({
            description: 'reset',
            iconSize: 23,
            iconName: 'clear',
        })),
    ].concat(pieces.map(piece => (
        colorButton({
            layout,
            piece,
            colorize,
            onclick: ({ piece }) => {
                actions.spawnPiece({ piece });
                actions.changeToDrawPieceMode();
            },
            highlight: modePiece === piece,
        })
    ))).concat([
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#f44336',
            datatest: 'btn-piece-mode',
            key: 'btn-piece-mode',
            onclick: () => actions.changeToDrawPieceMode(),
        }, iconContents({
            description: 'Back',
            iconSize: 25,
            iconName: 'chevron_left',
        })),
    ]));
};
