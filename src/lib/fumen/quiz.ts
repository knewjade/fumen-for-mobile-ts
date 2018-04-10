import { FumenError } from '../errors';
import { Operation, parsePiece, parsePieceName, Piece } from '../enums';

export class Quiz {
    static verify(quiz: string): boolean {
        const replaced = this.trim(quiz);

        if (!replaced.match(/^#Q=\[[TIOSZJL]{0,1}]\([TIOSZJL]{0,1}\)[TIOSZJL]*$/i)) {
            return false;
        }

        const index = replaced.indexOf(')');
        return !(replaced[index - 1] === '(' && replaced[index + 1] !== undefined);
    }

    private static trim(quiz: string) {
        return quiz.trim().replace(/\s+/g, '');
    }

    private readonly quiz: string;

    constructor(quiz: string) {
        if (!Quiz.verify(quiz)) {
            throw new FumenError(`Current piece doesn't exist, however next pieces exist: ${quiz}`);
        }

        this.quiz = Quiz.trim(quiz);
    }

    getOperation(used: Piece): Operation {
        const usedName = parsePieceName(used);
        if (usedName === this.current) {
            return Operation.Direct;
        }

        const hold = this.hold;
        if (hold === '') {
            // 次のミノを利用できる
            if (usedName === this.next) {
                return Operation.Stock;
            }
        } else if (usedName === hold) {
            return Operation.Swap;
        }

        throw new FumenError(`Unexpected hold piece in quiz: ${this.quiz}`);
    }

    private get current(): string {
        const index = this.quiz.indexOf('(') + 1;
        const name = this.quiz[index];
        if (name === ')') {
            return '';
        }
        return name;
    }

    private get hold(): string {
        const index = this.quiz.indexOf('[') + 1;
        const name = this.quiz[index];
        if (name === ']') {
            return '';
        }
        return name;
    }

    private get next(): string | undefined {
        const index = this.quiz.indexOf(')') + 1;
        const name = this.quiz[index];
        if (name === undefined) {
            return '';
        }
        return name;
    }

    private get least(): string {
        const index = this.quiz.indexOf(')') + 2;
        return this.quiz.substr(index);
    }

    direct(): Quiz {
        if (this.current === '') {
            throw new FumenError(`Cannot find next piece: ${this.quiz}`);
        }
        return new Quiz(`#Q=[${this.hold}](${this.next})${this.least}`);
    }

    swap(): Quiz {
        if (this.hold === '') {
            throw new FumenError(`Cannot find hold piece: ${this.quiz}`);
        }
        const next = this.next;
        return new Quiz(`#Q=[${this.current}](${next})${this.least}`);
    }

    stock(): Quiz {
        if (this.hold !== '' || this.next === '') {
            throw new FumenError(`Cannot stock: ${this.quiz}`);
        }

        const least = this.least;
        const head = least[0] !== undefined ? least[0] : '';

        if (1 < least.length) {
            return new Quiz(`#Q=[${this.current}](${head})${least.substr(1)}`);
        }

        return new Quiz(`#Q=[${this.current}](${head})`);
    }

    operate(operation: Operation): Quiz {
        switch (operation) {
        case Operation.Direct:
            return this.direct();
        case Operation.Swap:
            return this.swap();
        case Operation.Stock:
            return this.stock();
        }
        throw new FumenError('Unexpected operation');
    }

    format(): Quiz {
        const hold = this.hold;
        if (this.current === '' && hold !== '') {
            return new Quiz(`#Q=[](${hold})`);
        }
        return new Quiz(this.quiz);
    }

    getHoldPiece(): Piece {
        const name = this.hold;
        if (name === undefined || name === '') {
            return Piece.Empty;
        }
        return parsePiece(name);
    }

    getNextPieces(max?: number): Piece[] {
        let names = (this.current + this.next + this.least).substr(0, max);
        if (max !== undefined && names.length < max) {
            names += ' '.repeat(max - names.length);
        }

        return names.split('').map((name) => {
            if (name === undefined || name === ' ') {
                return Piece.Empty;
            }
            return parsePiece(name);
        });
    }

    toString(): string {
        return this.canOperate() ? this.quiz : '';
    }

    canOperate(): boolean {
        return this.quiz !== '#Q=[]()';
    }
}
