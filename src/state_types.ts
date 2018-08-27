import { Piece } from './lib/enums';

export interface Block {
    piece: Piece | 'inference';
    highlight?: boolean;
}
