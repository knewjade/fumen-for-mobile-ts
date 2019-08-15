import { Piece } from '../../lib/enums';
import { div } from '@hyperapp/html';
import { colorButton, toolSpace } from '../editor_buttons';
import { toolStyle } from './editor';
import { EditorLayout } from '../../componentsv2/editor/layout';

export const fillMode = ({ layout, modePiece, colorize, actions }: {
    layout: EditorLayout;
    modePiece: Piece | undefined;
    colorize: boolean;
    actions: {
        selectPieceColor: (data: { piece: Piece }) => void;
        selectInferencePieceColor: () => void;
    };
}) => {
    const pieces = [Piece.I, Piece.L, Piece.O, Piece.Z, Piece.T, Piece.J, Piece.S, Piece.Empty, Piece.Gray];

    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
    ].concat(pieces.map(piece => (
        colorButton({ layout, piece, colorize, onclick: actions.selectPieceColor, highlight: modePiece === piece })
    ))));
};
