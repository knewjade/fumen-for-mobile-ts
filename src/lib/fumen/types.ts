import { Piece, Rotation } from '../enums';
import { Field } from './field';

export interface Action {
    piece: {
        type: Piece;
        rotation: Rotation;
        coordinate: {
            x: number,
            y: number,
        };
    };
    rise: boolean;
    mirror: boolean;
    colorize: boolean;
    comment: boolean;
    lock: boolean;
}

export interface Move {
    type: Piece;
    rotation: Rotation;
    coordinate: {
        x: number;
        y: number;
    };
}

export interface Page {
    index: number;
    field: {
        obj?: Field;
        ref?: number;
    };
    piece?: Move;
    comment: {
        text?: string;
        ref?: number;
    };
    commands?: {
        pre: {
            [key in string]: PreCommand;
        };
    };
    flags: {
        lock: boolean;
        mirror: boolean;
        colorize: boolean;
        rise: boolean;
        quiz: boolean;
    };
}

export type PreCommand = BlockAction;

export interface BlockAction {
    type: 'block' | 'sentBlock';
    x: number;
    y: number;
    piece: Piece;
}
