import { Quiz } from '../fumen/quiz';
import { Operation, Piece } from '../enums';
import { FumenError } from '../errors';

describe('quiz', () => {
    describe('new', () => {
        it('regular quiz', () => {
            new Quiz('#Q=[]()');
            new Quiz('#Q=[T]()');
            new Quiz('#Q=[](I)');
            new Quiz(' # Q = [ ] ( ) ');
            new Quiz('#Q=[i](t)oszlj');
        });

        it('broken quiz', () => {
            expect(() => new Quiz('#Q=[]()O')).toThrowError(FumenError);
            expect(() => new Quiz('#Q=[T]()SZOJL')).toThrowError(FumenError);
            expect(() => new Quiz('Q=[T](I)SZOJL')).toThrowError(FumenError);
            expect(() => new Quiz('"=[T](I)SZOJL')).toThrowError(FumenError);
            expect(() => new Quiz('#Q=T](I)SZOJL')).toThrowError(FumenError);
            expect(() => new Quiz('#Q=[T(I)SZOJL')).toThrowError(FumenError);
            expect(() => new Quiz('#Q=[T]I)SZOJL')).toThrowError(FumenError);
            expect(() => new Quiz('#Q=[T]ISZOJL')).toThrowError(FumenError);
            expect(() => new Quiz('#Q=[T]ISZOJL')).toThrowError(FumenError);
            expect(() => new Quiz('#Q=[TI]()')).toThrowError(FumenError);
            expect(() => new Quiz('#Q=[](TI)')).toThrowError(FumenError);
        });
    });

    describe('hold & current', () => {
        const quiz = new Quiz('#Q=[T](I)SZOJL');

        it('getPiece', () => {
            expect(quiz.getHoldPiece()).toEqual(Piece.T);
            expect(quiz.getNextPieces(1)).toEqual([Piece.I]);
            expect(quiz.getNextPieces(5)).toEqual([Piece.I, Piece.S, Piece.Z, Piece.O, Piece.J]);
        });

        it('getOperation', () => {
            expect(quiz.getOperation(Piece.I)).toEqual(Operation.Direct);
            expect(quiz.getOperation(Piece.T)).toEqual(Operation.Swap);
            expect(() => quiz.getOperation(Piece.S)).toThrowError(FumenError);
        });

        it('direct', () => {
            const next = quiz.direct();
            expect(next).toEqual(new Quiz('#Q=[T](S)ZOJL'));
        });

        it('swap', () => {
            const next = quiz.swap();
            expect(next).toEqual(new Quiz('#Q=[I](S)ZOJL'));
        });

        it('stock', () => {
            expect(() => quiz.stock()).toThrowError(FumenError);
        });

        it('format', () => {
            const format = quiz.format();
            expect(format).toEqual(new Quiz('#Q=[T](I)SZOJL'));
        });

        it('toString', () => {
            const str = quiz.toString();
            expect(str).toEqual('#Q=[T](I)SZOJL');
        });
    });

    describe('hold & current / last one', () => {
        const quiz = new Quiz('#Q=[T](I)');

        it('getPiece', () => {
            expect(quiz.getHoldPiece()).toEqual(Piece.T);
            expect(quiz.getNextPieces(0)).toEqual([]);
            expect(quiz.getNextPieces(3)).toEqual([Piece.I, Piece.Empty, Piece.Empty]);
        });

        it('direct', () => {
            const next = quiz.direct();
            expect(next).toEqual(new Quiz('#Q=[T]()'));
        });

        it('swap', () => {
            const next = quiz.swap();
            expect(next).toEqual(new Quiz('#Q=[I]()'));
        });

        it('stock', () => {
            expect(() => quiz.stock()).toThrowError(FumenError);
        });

        it('format', () => {
            const format = quiz.format();
            expect(format).toEqual(new Quiz('#Q=[T](I)'));
        });
    });

    describe('current only', () => {
        const quiz = new Quiz('#Q=[](S)OLJZ');

        it('getOperation', () => {
            expect(quiz.getOperation(Piece.S)).toEqual(Operation.Direct);
            expect(quiz.getOperation(Piece.O)).toEqual(Operation.Stock);
            expect(() => quiz.getOperation(Piece.T)).toThrowError(FumenError);
        });

        it('getPiece', () => {
            expect(quiz.getHoldPiece()).toEqual(Piece.Empty);
            expect(quiz.getNextPieces(3)).toEqual([Piece.S, Piece.O, Piece.L]);
        });

        it('direct', () => {
            const next = quiz.direct();
            expect(next).toEqual(new Quiz('#Q=[](O)LJZ'));
        });

        it('swap', () => {
            expect(() => quiz.swap()).toThrowError(FumenError);
        });

        it('stock', () => {
            const next = quiz.stock();
            expect(next).toEqual(new Quiz('#Q=[S](L)JZ'));
        });

        it('format', () => {
            const format = quiz.format();
            expect(format).toEqual(new Quiz('#Q=[](S)OLJZ'));
        });
    });

    describe('current only / last one', () => {
        const quiz = new Quiz('#Q=[](S)');

        it('getPiece', () => {
            expect(quiz.getHoldPiece()).toEqual(Piece.Empty);
            expect(quiz.getNextPieces()).toEqual([Piece.S]);
        });

        it('direct', () => {
            const next = quiz.direct();
            expect(next).toEqual(new Quiz('#Q=[]()'));
        });

        it('swap', () => {
            expect(() => quiz.swap()).toThrowError(FumenError);
        });

        it('stock', () => {
            expect(() => quiz.stock()).toThrowError(FumenError);
        });

        it('format', () => {
            const format = quiz.format();
            expect(format).toEqual(new Quiz('#Q=[](S)'));
        });
    });

    describe('current only / last two', () => {
        const quiz = new Quiz('#Q=[](I)L');

        it('getPiece', () => {
            expect(quiz.getHoldPiece()).toEqual(Piece.Empty);
            expect(quiz.getNextPieces(2)).toEqual([Piece.I, Piece.L]);
            expect(quiz.getNextPieces(3)).toEqual([Piece.I, Piece.L, Piece.Empty]);
        });

        it('stock', () => {
            const next = quiz.stock();
            expect(next).toEqual(new Quiz('#Q=[I]()'));
        });

        it('format', () => {
            const format = quiz.format();
            expect(format).toEqual(new Quiz('#Q=[](I)L'));
        });

        it('toString', () => {
            const str = quiz.toString();
            expect(str).toEqual('#Q=[](I)L');
        });
    });

    describe('hold only', () => {
        const quiz = new Quiz('#Q=[Z]()');

        it('getOperation', () => {
            expect(quiz.getOperation(Piece.Z)).toEqual(Operation.Swap);
            expect(() => quiz.getOperation(Piece.S)).toThrowError(FumenError);
        });

        it('getPiece', () => {
            expect(quiz.getHoldPiece()).toEqual(Piece.Z);
            expect(quiz.getNextPieces()).toEqual([]);
        });

        it('direct', () => {
            expect(() => quiz.direct()).toThrowError(FumenError);
        });

        it('swap', () => {
            const next = quiz.swap();
            expect(next).toEqual(new Quiz('#Q=[]()'));
        });

        it('stock', () => {
            expect(() => quiz.stock()).toThrowError(FumenError);
        });

        it('format', () => {
            const format = quiz.format();
            expect(format).toEqual(new Quiz('#Q=[](Z)'));
        });

        it('toString', () => {
            const str = quiz.toString();
            expect(str).toEqual('#Q=[Z]()');
        });
    });

    describe('empty', () => {
        const quiz = new Quiz('#Q=[]()');

        it('getOperation', () => {
            expect(() => quiz.getOperation(Piece.I)).toThrowError(FumenError);
        });

        it('getPiece', () => {
            expect(quiz.getHoldPiece()).toEqual(Piece.Empty);
            expect(quiz.getNextPieces()).toEqual([]);
        });

        it('direct', () => {
            expect(() => quiz.direct()).toThrowError(FumenError);
        });

        it('swap', () => {
            expect(() => quiz.swap()).toThrowError(FumenError);
        });

        it('stock', () => {
            expect(() => quiz.stock()).toThrowError(FumenError);
        });

        it('format', () => {
            const format = quiz.format();
            expect(format).toEqual(new Quiz('#Q=[]()'));
        });

        it('toString', () => {
            const str = quiz.toString();
            expect(str).toEqual('');
        });
    });
});
