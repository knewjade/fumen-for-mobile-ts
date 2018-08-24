import { Piece } from './lib/enums';

export interface Block {
    piece: Piece;
    highlight?: boolean;
}
