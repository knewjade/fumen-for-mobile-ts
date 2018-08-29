import { FieldConstants, getBlocks, parsePiece, Piece, Rotation } from '../enums';
import { FumenError } from '../errors';

const FIELD_WIDTH = FieldConstants.Width;
const FIELD_TOP = FieldConstants.Height;
const PLAY_FIELD_BLOCKS = FIELD_TOP * FIELD_WIDTH;

export class Field {
    private readonly playField: PlayField;
    private readonly sentLine: PlayField;

    private static create(length: number): PlayField {
        return new PlayField({ length });
    }

    constructor({ field = Field.create(PLAY_FIELD_BLOCKS), sentLine = Field.create(FIELD_WIDTH) }: {
        field?: PlayField,
        sentLine?: PlayField,
    }) {
        this.playField = field;
        this.sentLine = sentLine;
    }

    add(x: number, y: number, value: number): void {
        if (0 <= y) {
            this.playField.add(x, y, value);
        } else {
            this.sentLine.add(x, -(y + 1), value);
        }
    }

    put(action: { type: Piece, rotation: Rotation, coordinate: { x: number, y: number } }): void {
        this.playField.put(action);
    }

    setToPlayField(index: number, value: number): void {
        this.playField.setAt(index, value);
    }

    setToSentLine(index: number, value: number): void {
        this.sentLine.setAt(index, value);
    }

    clearLine(): void {
        this.playField.clearLine();
    }

    up(): void {
        this.playField.up(this.sentLine);
        this.sentLine.clearAll();
    }

    mirror(): void {
        this.playField.mirror();
    }

    get(x: number, y: number): Piece {
        return 0 <= y ? this.playField.get(x, y) : this.sentLine.get(x, -(y + 1));
    }

    getAtIndex(index: number): Piece {
        return this.get(index % 10, Math.floor(index / 10));
    }

    copy(): Field {
        return new Field({ field: this.playField.copy(), sentLine: this.sentLine.copy() });
    }

    toPlayFieldPieces(): Piece[] {
        return this.playField.toArray();
    }

    toSentLintPieces(): Piece[] {
        return this.sentLine.toArray();
    }
}

export class PlayField {
    static load(...lines: string[]): PlayField {
        const blocks = lines.join('').trim();
        return PlayField.loadInner(blocks);
    }

    static loadMinify(...lines: string[]): PlayField {
        const blocks = lines.join('').trim();
        return PlayField.loadInner(blocks, blocks.length);
    }

    private static loadInner(blocks: string, length?: number): PlayField {
        const len = length !== undefined ? length : blocks.length;
        if (len % 10 !== 0) {
            throw new FumenError('Num of block in field should be mod 10');
        }

        const field = length !== undefined ? new PlayField({ length }) : new PlayField({});
        for (let index = 0; index < len; index += 1) {
            const block = blocks[index];
            field.set(index % 10, Math.floor((len - index - 1) / 10), parsePiece(block));
        }
        return field;
    }

    private readonly length: number;
    private pieces: Piece[];

    constructor({ pieces, length = PLAY_FIELD_BLOCKS }: {
        pieces?: Piece[],
        length?: number,
    }) {
        if (pieces !== undefined) {
            this.pieces = pieces;
        } else {
            this.pieces = Array.from({ length }).map(() => Piece.Empty);
        }
        this.length = length;
    }

    get(x: number, y: number): Piece {
        return this.pieces[x + y * FIELD_WIDTH];
    }

    add(x: number, y: number, value: number) {
        this.pieces[x + y * FIELD_WIDTH] += value;
    }

    set(x: number, y: number, piece: Piece) {
        this.setAt(x + y * FIELD_WIDTH, piece);
    }

    setAt(index: number, piece: Piece) {
        this.pieces[index] = piece;
    }

    put({ type, rotation, coordinate }: { type: Piece, rotation: Rotation, coordinate: { x: number, y: number } }) {
        const blocks = getBlocks(type, rotation);
        for (const block of blocks) {
            const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
            this.set(x, y, type);
        }
    }

    clearLine() {
        let newField = this.pieces.concat();
        const top = this.pieces.length / FIELD_WIDTH - 1;
        for (let y = top; 0 <= y; y -= 1) {
            const line = this.pieces.slice(y * FIELD_WIDTH, (y + 1) * FIELD_WIDTH);
            const isFilled = line.every(value => value !== Piece.Empty);
            if (isFilled) {
                const bottom = newField.slice(0, y * FIELD_WIDTH);
                const over = newField.slice((y + 1) * FIELD_WIDTH);
                newField = bottom.concat(over, Array.from({ length: FIELD_WIDTH }).map(() => Piece.Empty));
            }
        }
        this.pieces = newField;
    }

    up(blockUp: PlayField) {
        this.pieces = blockUp.pieces.concat(this.pieces).slice(0, this.length);
    }

    mirror() {
        const newField: Piece[] = [];
        for (let y = 0; y < this.pieces.length; y += 1) {
            const line = this.pieces.slice(y * FIELD_WIDTH, (y + 1) * FIELD_WIDTH);
            line.reverse();
            for (const obj of line) {
                newField.push(obj);
            }
        }
        this.pieces = newField;
    }

    toArray(): Piece[] {
        return this.pieces.concat();
    }

    get numOfBlocks(): number {
        return this.pieces.length;
    }

    copy(): PlayField {
        return new PlayField({ pieces: this.pieces.concat(), length: this.length });
    }

    toShallowArray() {
        return this.pieces;
    }

    clearAll() {
        this.pieces = this.pieces.map(() => Piece.Empty);
    }
}
