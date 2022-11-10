import { Piece } from './lib/enums';

export interface Block {
    piece: Piece | 'inference';
    highlight?: HighlightType;
    markable?: boolean;
}

// ラインが揃ったとき、Highlight1より小さい値は上書きされる
export enum HighlightType {
    Normal = 0,
    Lighter = 1,
    Highlight1 = 10,
    Highlight2 = 11,
    Darker = 20,
}
