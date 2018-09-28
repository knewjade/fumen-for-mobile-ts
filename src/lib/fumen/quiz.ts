import { FumenError } from '../errors';
import { Operation, parsePiece, parsePieceName, Piece } from '../enums';

export class Quiz {
    private get next(): string | undefined {
        const index = this.quiz.indexOf(')') + 1;
        const name = this.quiz[index];
        if (name === undefined || name === ';') {
            return '';
        }
        return name;
    }

    static create(nexts: string): Quiz;
    static create(hold: string, nexts: string): Quiz;
    static create(first: string, second?: string): Quiz {
        const create = (hold: string | undefined, other: string) => {
            const parse = (s?: string) => s ? s : '';
            return new Quiz(`#Q=[${parse(hold)}](${parse(other[0])})${parse(other.substring(1))}`);
        };

        return second !== undefined ? create(first, second) : create(undefined, first);
    }

    private static trim(quiz: string) {
        return quiz.trim().replace(/\s+/g, '');
    }

    private readonly quiz: string;

    constructor(quiz: string) {
        this.quiz = Quiz.verify(quiz);
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

    private get least(): string {
        const index = this.quiz.indexOf(')');
        if (this.quiz[index + 1] === ';') {
            return this.quiz.substr(index + 1);
        }
        return this.quiz.substr(index + 2);
    }

    private get leastInActiveBag(): string {
        const separateIndex = this.quiz.indexOf(';');
        const quiz = 0 <= separateIndex ? this.quiz.substring(0, separateIndex) : this.quiz;
        const index = quiz.indexOf(')');
        if (quiz[index + 1] === ';') {
            return quiz.substr(index + 1);
        }
        return quiz.substr(index + 2);
    }

    private static verify(quiz: string): string {
        const replaced = this.trim(quiz);

        if (replaced.startsWith('#Q=()[];')) {
            return replaced;
        }

        if (replaced.length === 0 || quiz === '#Q=[]()' || !quiz.startsWith('#Q=')) {
            return quiz;
        }

        if (!replaced.match(/^#Q=\[[TIOSZJL]?]\([TIOSZJL]?\)[TIOSZJL]*;?.*$/i)) {
            throw new FumenError(`Current piece doesn't exist, however next pieces exist: ${quiz}`);
        }

        const index = replaced.indexOf(')');
        if (replaced[index - 1] === '(' && (replaced[index + 1] !== undefined && replaced[index + 1] !== ';')) {
            throw new FumenError('Unexpected quiz');
        }

        return replaced;
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
            return this.nextIfEnd(this.direct());
        case Operation.Swap:
            return this.nextIfEnd(this.swap());
        case Operation.Stock:
            return this.nextIfEnd(this.stock());
        }
        throw new FumenError('Unexpected operation');
    }

    format(): Quiz {
        if (this.quiz === '#Q=[]()') {
            return new Quiz('');
        }

        const hold = this.hold;
        if (this.current === '' && hold !== '') {
            return new Quiz(`#Q=[](${hold})${this.least}`);
        }
        return new Quiz(this.quiz);
    }

    getHoldPiece(): Piece {
        if (!this.canOperate()) {
            return Piece.Empty;
        }

        const name = this.hold;
        if (name === undefined || name === '' || name === ';') {
            return Piece.Empty;
        }
        return parsePiece(name);
    }

    getNextPieces(max?: number): Piece[] {
        if (!this.canOperate()) {
            return max !== undefined ? Array.from({ length: max }).map(() => Piece.Empty) : [];
        }

        let names = (this.current + this.next + this.leastInActiveBag).substr(0, max);
        if (max !== undefined && names.length < max) {
            names += ' '.repeat(max - names.length);
        }

        return names.split('').map((name) => {
            if (name === undefined || name === ' ' || name === ';') {
                return Piece.Empty;
            }
            return parsePiece(name);
        });
    }

    toString(): string {
        return this.quiz;
    }

    canOperate(): boolean {
        return this.quiz.startsWith('#Q=') && this.quiz.substr(0, 7) !== '#Q=[]()';
    }

    private nextIfEnd(target: Quiz): Quiz {
        if (target.quiz.startsWith('#Q=[]();')) {
            return new Quiz(target.quiz.substr(8));
        }
        return target;
    }
}
