import { Piece } from '../../lib/enums';
import { div } from '@hyperapp/html';
import { colorButton, iconContents, toolButton, toolSpace } from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';
import { Move } from '../../lib/fumen/fumen';
import { action } from '../../actions';

export const pieceSelectMode = ({ layout, move, currentIndex, colorize, actions }: {
    layout: EditorLayout;
    move?: Move;
    currentIndex: number;
    colorize: boolean;
    actions: {
        spawnPiece: (data: { piece: Piece, guideline: boolean }) => void;
        clearPiece: () => void;
        changeToPieceMode: () => action;
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
            enable: move !== undefined,
            key: 'btn-reset-piece',
            onclick: () => {
                actions.clearPiece();
                actions.changeToPieceMode();
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
                actions.spawnPiece({ piece, guideline: colorize });
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
