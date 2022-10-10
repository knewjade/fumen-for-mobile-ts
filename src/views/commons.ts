import { Platforms } from '../lib/enums';

export interface Size {
    width: number;
    height: number;
}

export interface Coordinate {
    x: number;
    y: number;
}

export const getNavigatorHeight = (platform: Platforms) => platform === Platforms.PC ? 30 : 0;
