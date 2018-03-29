import { getBlocks, parsePiece, Piece, Rotation } from '../enums';
import { FumenError } from '../errors';

const FIELD_WIDTH = 10;
const FIELD_TOP = 23;
const FIELD_BLOCKS = (FIELD_TOP + 1) * FIELD_WIDTH;

export class Field {
    static load(...lines: string[]): Field {
        const blocks = lines.join('').trim();
        return Field.loadInner(blocks);
    }

    static loadMinify(...lines: string[]): Field {
        const blocks = lines.join('').trim();
        return Field.loadInner(blocks, blocks.length);
    }

    private static loadInner(blocks: string, num?: number): Field {
        const len = num !== undefined ? num : blocks.length;
        if (len % 10 !== 0) {
            throw new FumenError('Num of block in field should be mod 10');
        }

        const field = num !== undefined ? new Field(num) : new Field();
        for (let index = 0; index < len; index += 1) {
            const block = blocks[index];
            field.set(index % 10, Math.floor((len - index - 1) / 10), parsePiece(block));
        }
        return field;
    }

    private pieces: Piece[];

    constructor(private readonly num: number = FIELD_BLOCKS) {
        this.pieces = Array.from({ length: num }).map(() => Piece.Empty);
    }

    get(x: number, y: number): Piece {
        return this.pieces[x + y * FIELD_WIDTH];
    }

    add(x: number, y: number, value: number) {
        this.pieces[x + y * FIELD_WIDTH] += value;
    }

    set(x: number, y: number, piece: Piece) {
        this.pieces[x + y * FIELD_WIDTH] = piece;
    }

    put(piece: Piece, rotation: Rotation, coordinate: { x: number, y: number }) {
        const blocks = getBlocks(piece, rotation);
        for (const block of blocks) {
            const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
            this.set(x, y, piece);
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

    up(blockUp: Field) {
        console.log(blockUp);
        this.pieces = blockUp.pieces.concat(this.pieces).slice(0, this.num);
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
}
