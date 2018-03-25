import { FumenError } from './error';
import { parsePiece, parsePieceName, Piece } from './enums';
import { Operation } from './fumen';

export class Quiz {
    constructor(private readonly quiz: string) {
        console.log(quiz);
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

        throw new FumenError('Unexpected hold piece in quiz');
    }

    private get current(): string {
        const index = this.quiz.indexOf('(') + 1;
        const name = this.quiz[index];
        if (name === undefined) {
            return '';
        }
        if (name === ')') {
            return '';
        }
        return name;
    }

    private get hold(): string {
        const index = this.quiz.indexOf('[') + 1;
        const name = this.quiz[index];
        if (name === undefined) {
            throw new FumenError('Unexpected value in quiz');
        }
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
        const names = this.quiz.substr(index);
        if (names === undefined) {
            return '';
        }
        return names;
    }

    direct(): Quiz {
        const next = this.next;
        // TODO: 実際の動作と異なる　
        // if (next === '') {
        //     return new Quiz(`#Q=[](${this.hold})${this.least}`);
        // }
        return new Quiz(`#Q=[${this.hold}](${next})${this.least}`);
    }

    swap(): Quiz {
        const next = this.next;
        // TODO: 実際の動作と異なる　
        // if (next === '') {
        //     return new Quiz(`#Q=[](${this.current})${this.least}`);
        // }
        return new Quiz(`#Q=[${this.current}](${next})${this.least}`);
    }

    stock(): Quiz {
        const least = this.least;

        if (1 < least.length) {
            return new Quiz(`#Q=[${this.current}](${least[0]})${least.substr(1)}`);
        }

        if (least.length === 1) {
            return new Quiz(`#Q=[${this.current}](${least[0]})`);
        }

        return new Quiz(`#Q=[${this.current}]()`);  // TODO: 実際の動作と異なる　
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

    toStr(): string {
        return this.quiz;
    }

    getHold(): Piece {
        const name = this.hold;
        if (name === undefined || name === '') {
            return Piece.Empty;
        }
        return parsePiece(name);
    }

    getNexts(max: number): Piece[] {
        const names = (this.current + this.next + this.least).substr(0, max);
        return names.split('').map((name) => {
            if (name === undefined || name === '') {
                return Piece.Empty;
            }
            return parsePiece(name);
        });
    }
}
