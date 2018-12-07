import { Piece } from './lib/enums';

export interface Block {
    piece: Piece | 'inference';
    highlight?: HighlightType;
}

export enum HighlightType {
    Normal = 0,
    Highlight1 = 1,
    Highlight2 = 2,
    Lighter = 3,
}
