import { ViewError } from './errors';
import { Piece, Screens } from './enums';

export const Palette = (screen: Screens) => {
    const getBaseClass = () => {
        switch (screen) {
        case Screens.Editor:
            return 'red';
        default:
            return 'teal';
        }
    };

    const getDarkCode = () => {
        switch (screen) {
        case Screens.Editor:
            return '#d32f2f';
        default:
            return '#00796b';
        }
    };

    return {
        baseClass: getBaseClass(),
        darkCode: getDarkCode(),
    };
};

export function getHighlightColor(piece: Piece): string {
    switch (piece) {
    case Piece.Gray:
        return '#CCCCCC';
    case Piece.I:
        return '#24CCCD';
    case Piece.T:
        return '#CE27CE';
    case Piece.S:
        return '#26CE22';
    case Piece.Z:
        return '#CE312D';
    case Piece.L:
        return '#CD9A24';
    case Piece.J:
        return '#3229CF';
    case Piece.O:
        return '#CCCE19';
    case Piece.Empty:
        return '#000000';
    }
    throw new ViewError('Not found highlight color: ' + piece);
}

export function getNormalColor(piece: Piece): string {
    switch (piece) {
    case Piece.Gray:
        return '#999999';
    case Piece.I:
        return '#009999';
    case Piece.T:
        return '#9B009B';
    case Piece.S:
        return '#009B00';
    case Piece.Z:
        return '#9B0000';
    case Piece.L:
        return '#9A6700';
    case Piece.J:
        return '#0000BE';
    case Piece.O:
        return '#999900';
    case Piece.Empty:
        return '#000000';
    }
    throw new ViewError('Not found normal color: ' + piece);
}
