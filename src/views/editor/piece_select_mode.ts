import { Piece } from '../../lib/enums';
import { div } from '@hyperapp/html';
import { colorButton, iconContents, toolButton, toolSpace } from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';

export const pieceSelectMode = ({ layout, currentIndex, colorize, actions }: {
    layout: EditorLayout;
    currentIndex: number;
    colorize: boolean;
    actions: {
        spawnPiece: (data: { piece: Piece, guideline: boolean }) => void;
        changeToPieceMode: () => void;
        changeToMovePieceMode: () => void;
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
    ].concat(pieces.map(piece => (
        colorButton({
            layout,
            piece,
            colorize,
            onclick: ({ piece }) => {
                actions.spawnPiece({ piece, guideline: colorize });
                actions.changeToMovePieceMode();
                actions.changeToPieceMode();
            },
            highlight: false,
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
            onclick: () => actions.changeToPieceMode(),
        }, iconContents({
            description: 'Back',
            iconSize: 25,
            iconName: 'chevron_left',
        })),
    ]));
};
