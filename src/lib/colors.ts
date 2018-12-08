import { Piece, Screens } from './enums';
import { Block, HighlightType } from '../state_types';

export interface ColorPalette {
    baseClass: string;
    baseCode: string;
    darkCode: string;
}

export const Palette = (screen: Screens): ColorPalette => {
    const getBaseClass = () => {
        switch (screen) {
        case Screens.Editor:
            return 'red';
        default:
            return 'teal';
        }
    };

    const getBaseCode = () => {
        switch (screen) {
        case Screens.Editor:
            return '#f44336';
        default:
            return '#009688';
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
        baseCode: getBaseCode(),
        darkCode: getDarkCode(),
    };
};

export function decidePieceColor(piece: Block['piece'], highlight: HighlightType | undefined, isGuideLine: boolean) {
    const colors = isGuideLine ? guideLineColors : classicColors;
    return colors[piece][highlight !== undefined ? highlight : HighlightType.Normal];
}

const guideLineColors = {
    ['inference']: {
        [HighlightType.Normal]: '#ffffff',
        [HighlightType.Highlight1]: '#ffffff',
        [HighlightType.Highlight2]: '#ffffff',
        [HighlightType.Lighter]: '#ffffff',
    },
    [Piece.Gray]: {
        [HighlightType.Normal]: '#999999',
        [HighlightType.Highlight1]: '#cccccc',
        [HighlightType.Highlight2]: '#ffffff',
        [HighlightType.Lighter]: '#333333',
    },
    [Piece.I]: {
        [HighlightType.Normal]: '#009999',
        [HighlightType.Highlight1]: '#33cccc',
        [HighlightType.Highlight2]: '#00ffff',
        [HighlightType.Lighter]: '#003333',
    },
    [Piece.T]: {
        [HighlightType.Normal]: '#990099',
        [HighlightType.Highlight1]: '#cc33cc',
        [HighlightType.Highlight2]: '#ff00ff',
        [HighlightType.Lighter]: '#4d004d',
    },
    [Piece.S]: {
        [HighlightType.Normal]: '#009900',
        [HighlightType.Highlight1]: '#33cc33',
        [HighlightType.Highlight2]: '#00ff00',
        [HighlightType.Lighter]: '#003300',
    },
    [Piece.Z]: {
        [HighlightType.Normal]: '#990000',
        [HighlightType.Highlight1]: '#cc3333',
        [HighlightType.Highlight2]: '#ff0000',
        [HighlightType.Lighter]: '#4d0000',
    },
    [Piece.L]: {
        [HighlightType.Normal]: '#996600',
        [HighlightType.Highlight1]: '#cc9933',
        [HighlightType.Highlight2]: '#ff9900',
        [HighlightType.Lighter]: '#3b1d00',
    },
    [Piece.J]: {
        [HighlightType.Normal]: '#0000BB',
        [HighlightType.Highlight1]: '#3333cc',
        [HighlightType.Highlight2]: '#0000ff',
        [HighlightType.Lighter]: '#000061',
    },
    [Piece.O]: {
        [HighlightType.Normal]: '#999900',
        [HighlightType.Highlight1]: '#cccc33',
        [HighlightType.Highlight2]: '#ffff00',
        [HighlightType.Lighter]: '#333300',
    },
    [Piece.Empty]: {
        [HighlightType.Normal]: '#000000',
        [HighlightType.Highlight1]: '#000000',
        [HighlightType.Highlight2]: '#000000',
        [HighlightType.Lighter]: '#000000',
    },
};

const classicColors = {
    ['inference']: guideLineColors['inference'],
    [Piece.Gray]: guideLineColors[Piece.Gray],
    [Piece.I]: guideLineColors[Piece.Z],
    [Piece.T]: guideLineColors[Piece.I],
    [Piece.S]: guideLineColors[Piece.T],
    [Piece.Z]: guideLineColors[Piece.S],
    [Piece.L]: guideLineColors[Piece.L],
    [Piece.J]: guideLineColors[Piece.J],
    [Piece.O]: guideLineColors[Piece.O],
    [Piece.Empty]: guideLineColors[Piece.Empty],
};

export const decideBackgroundColor = (yIndex: number) => {
    return yIndex < 20 ? '#000000' : '#333333';
};
