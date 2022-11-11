import { FumenError } from './errors';

export enum Piece {
    Empty = 0,
    I = 1,
    L = 2,
    O = 3,
    Z = 4,
    T = 5,
    J = 6,
    S = 7,
    Gray = 8,
}

export enum Rotation {
    Spawn = 0,
    Right = 1,
    Reverse = 2,
    Left = 3,
}

export enum AnimationState {
    Pause = 'pause',
    Play = 'play',
}

export enum Operation {
    Direct = 'direct',
    Swap = 'swap',
    Stock = 'stock',
}

export enum Action {
    Block = 'block',
}

export enum FieldConstants {
    Width = 10,
    Height = 23,
    SentLine = 1,
    PlayBlocks = FieldConstants.Height * FieldConstants.Width,
    AllBlocks = (FieldConstants.Height + FieldConstants.SentLine) * FieldConstants.Width,
}

export enum Screens {
    Reader = 'Reader',
    Editor = 'Editor',
}

export enum ModeTypes {
    Drawing = 'Drawing',
    Piece = 'Piece',
    Fill = 'Fill',
    DrawingTool = 'DrawingTool',
    Flags = 'Flags',
    Utils = 'Utils',
    Slide = 'Slide',
    FillRow = 'FillRow',
    SelectPiece = 'SelectPiece',
    Comment = 'Comment',
}

export enum TouchTypes {
    None = 'None',
    Drawing = 'Drawing',
    Piece = 'Piece',
    Fill = 'Fill',
    MovePiece = 'MovePiece',
    FillRow = 'FillRow',
}

export enum CommentType {
    Writable = 'Writable',
    Readonly = 'Readonly',
    PageSlider = 'PageSlider',
}

export enum Platforms {
    PC = 'PC',
    Mobile = 'Mobile',  // Smart Phone or Tablet
}

export enum GradientPattern {
    None = 0,
    Line = 1,
    Triangle = 2,
    Circle = 3,
}

export function gradientPatternFrom(value: string): GradientPattern | undefined {
    switch (value) {
    case '0':
    case '1':
    case '2':
    case '3':
        return parseInt(value, 10) as GradientPattern;
    }
    return undefined;
}

export function parsePieceName(piece: Piece) {
    switch (piece) {
    case Piece.I:
        return 'I';
    case Piece.L:
        return 'L';
    case Piece.O:
        return 'O';
    case Piece.Z:
        return 'Z';
    case Piece.T:
        return 'T';
    case Piece.J:
        return 'J';
    case Piece.S:
        return 'S';
    case Piece.Gray:
        return 'Gray';
    case Piece.Empty:
        return 'Empty';
    }
}

export function parsePiece(piece: string) {
    switch (piece.toUpperCase()) {
    case 'I':
        return Piece.I;
    case 'L':
        return Piece.L;
    case 'O':
        return Piece.O;
    case 'Z':
        return Piece.Z;
    case 'T':
        return Piece.T;
    case 'J':
        return Piece.J;
    case 'S':
        return Piece.S;
    case 'X':
        return Piece.Gray;
    case ' ':
    case '_':
        return Piece.Empty;
    }
    throw new FumenError(`Unexpected piece: ${piece}`);
}

export function isMinoPiece(b: Piece) {
    return b !== Piece.Empty && b !== Piece.Gray;
}

export function toPositionIndex(position: number[]): number {
    return position[0] + position[1] * 10;
}

export function nextRotationToLeft(rotation: Rotation): Rotation {
    switch (rotation) {
    case Rotation.Spawn:
        return Rotation.Left;
    case Rotation.Left:
        return Rotation.Reverse;
    case Rotation.Reverse:
        return Rotation.Right;
    case Rotation.Right:
        return Rotation.Spawn;
    }
}

export function nextRotationToRight(rotation: Rotation): Rotation {
    switch (rotation) {
    case Rotation.Spawn:
        return Rotation.Right;
    case Rotation.Right:
        return Rotation.Reverse;
    case Rotation.Reverse:
        return Rotation.Left;
    case Rotation.Left:
        return Rotation.Spawn;
    }
}

export function parseRotationName(rotation: Rotation) {
    switch (rotation) {
    case Rotation.Spawn:
        return 'Spawn';
    case Rotation.Left:
        return 'Left';
    case Rotation.Right:
        return 'Right';
    case Rotation.Reverse:
        return 'Reverse';
    }
}

export function isInPlayField(x: number, y: number) {
    return 0 <= x && x < FieldConstants.Width && 0 <= y && y < FieldConstants.Height;
}
