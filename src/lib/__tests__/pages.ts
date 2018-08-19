import { Operation, Piece, Rotation } from '../enums';
import { Quiz } from '../fumen/quiz';
import { Pages } from '../pages';
import { Field } from '../fumen/field';
import { Move } from '../fumen/fumen';

describe('comment', () => {
    const commentText = (text: string) => ({
        comment: { text },
    });

    const commentRef = (ref: number) => ({
        comment: { ref },
    });

    const commentCached = (text: string, next: Piece[]) => ({
        comment: {
            ref: -1,
            cache: {
                text,
                next,
            },
        },
    });

    const quizText = (quiz: Quiz, operation?: Operation) => ({
        comment: { text: quiz.toString() },
        quiz: { operation },
    });

    const quizRef = (ref: number, operation?: Operation) => ({
        comment: { ref },
        quiz: { operation },
    });

    const quizRefWithPiece = (ref: number, piece?: Piece) => ({
        comment: { ref },
        quiz: { },
        piece: { type: piece },
        flags: {
            lock: piece !== undefined,
        },
    });

    const quizCache = (quiz: string, quizAfterOperation: Quiz) => ({
        comment: {
            ref: -1,
            cache: {
                quiz,
                quizAfterOperation,
            },
        },
    });

    const pieceRef = (piece: Move, lock: boolean = true) => ({
        piece,
        flags: { lock },
    });

    test('comment text only', () => {
        const pages = new Pages([commentText('hello'), commentRef(0)] as any);
        expect(pages.getComment(0)).toEqual({
            text: 'hello',
            next: [],
        });
    });

    test('comment ref', () => {
        const pages = new Pages([commentText('world'), commentRef(0)] as any);
        expect(pages.getComment(1)).toEqual({
            text: 'world',
            next: [],
        });
    });

    test('next ref', () => {
        const pages = new Pages([commentText('world'), commentRef(0)] as any);
        expect(pages.getComment(1)).toEqual({
            text: 'world',
            next: [],
        });
    });

    test('quiz text only', () => {
        const quiz = Quiz.create('IOT');
        const pages = new Pages([quizText(quiz)] as any);
        expect(pages.getComment(0)).toEqual({
            quiz: quiz.toString(),
            quizAfterOperation: quiz,
        });
    });

    test('quiz ref', () => {
        const pages = new Pages([quizText(Quiz.create('IOT'), Operation.Direct), quizRef(0, Operation.Stock)] as any);
        expect(pages.getComment(1)).toEqual({
            quiz: Quiz.create('OT').toString(),
            quizAfterOperation: Quiz.create('O', ''),
        });
    });

    test('using comment cache', () => {
        const pages = new Pages([commentCached('hello', [Piece.I])] as any);
        expect(pages.getComment(0)).toEqual({
            text: 'hello',
            next: [Piece.I],
        });
    });

    test('using quiz cache', () => {
        const quizString = Quiz.create('LJ').toString();
        const quizAfterOperation = Quiz.create('J');
        const pages = new Pages([quizCache(quizString, quizAfterOperation)] as any);
        expect(pages.getComment(0)).toEqual({
            quizAfterOperation,
            quiz: quizString,
        });
    });

    test('next', () => {
        const firstMove = { type: Piece.I, rotation: Rotation.Spawn, coordinate: { x: 1, y: 0 } };
        const secondMove = { type: Piece.J, rotation: Rotation.Left, coordinate: { x: 5, y: 1 } };
        const thirdMove = { type: Piece.T, rotation: Rotation.Spawn, coordinate: { x: 8, y: 0 } };
        const forthMove = { type: Piece.O, rotation: Rotation.Spawn, coordinate: { x: 1, y: 1 } };
        const fifthMove = forthMove;
        const sixthMove = { type: Piece.L, rotation: Rotation.Spawn, coordinate: { x: 3, y: 1 } };
        const pages = new Pages([
            commentText('hello'),
            pieceRef(firstMove, false),
            pieceRef(firstMove),
            pieceRef(secondMove),
            pieceRef(thirdMove, false),
            commentText('world'),
            pieceRef(forthMove),
            pieceRef(fifthMove),
            pieceRef(sixthMove),
        ] as any);
        expect(pages.getComment(0)).toEqual({
            text: 'hello',
            next: [Piece.I, Piece.J, Piece.T, Piece.O, Piece.O],
        });
    });

    test('last hold', () => {
        const pages = new Pages([
            quizText(Quiz.create('O', 'L'), Operation.Direct),
            quizRef(0),
            quizRef(0, Operation.Swap),
            quizRef(0),
            quizRefWithPiece(0, Piece.Z),
            quizRefWithPiece(0, Piece.Z),
        ] as any);

        expect(pages.getComment(0)).toMatchObject({
            quiz: Quiz.create('O', 'L').toString(),
            quizAfterOperation: Quiz.create('O', ''),
        });
        expect(pages.getComment(1)).toMatchObject({
            quiz: '#Q=[](O)',
            quizAfterOperation: Quiz.create('O', ''),
        });
        expect(pages.getComment(2)).toMatchObject({
            quiz: '#Q=[](O)',
            quizAfterOperation: Quiz.create(''),
        });
        expect(pages.getComment(3)).toMatchObject({
            text: '',
            next: [Piece.Z, Piece.Z],
        });
        expect(pages.getComment(4)).toMatchObject({
            text: '',
            next: [Piece.Z],
        });
    });

    test('last hold with comemnt cache', () => {
        const pages = new Pages([
            quizText(Quiz.create('O', 'L'), Operation.Direct),
            quizRef(0),
            quizRef(0, Operation.Swap),
            commentCached('', []),
            quizRef(0),
        ] as any);

        expect(pages.getComment(4)).toMatchObject({
            text: '',
            next: [],
        });
    });

    test('last hold with quiz cache', () => {
        const pages = new Pages([
            quizText(Quiz.create('O', 'L'), Operation.Direct),
            quizCache('#Q=[](O)', Quiz.create('O', '')),
            quizRef(0, Operation.Swap),
            quizRef(0),
            quizRef(0),
        ] as any);

        expect(pages.getComment(2)).toMatchObject({
            quiz: '#Q=[](O)',
            quizAfterOperation: Quiz.create(''),
        });
        expect(pages.getComment(3)).toMatchObject({
            text: '',
            next: [],
        });
    });
});

describe('field', () => {
    const fieldObj = (obj: Field, piece?: Move) => ({
        piece,
        field: { obj },
        flags: {
            lock: piece !== undefined,
            blockUp: false,
            mirrored: false,
        },
    });

    const fieldRef = (ref: number, piece?: Move) => ({
        piece,
        field: { ref },
        flags: {
            lock: piece !== undefined,
            blockUp: false,
            mirrored: false,
        },
    });

    const fieldCache = (obj: Field, piece?: Move) => ({
        piece,
        field: {
            cache: { obj },
        },
        flags: {
            lock: piece !== undefined,
            blockUp: false,
            mirrored: false,
        },
    });

    test('field obj only', () => {
        const field = new Field({});
        field.put({ type: Piece.I, rotation: Rotation.Spawn, coordinate: { x: 1, y: 0 } });
        const pages = new Pages([fieldObj(field)] as any);
        expect(pages.getField(0)).toEqual(field);
    });

    test('field ref', () => {
        const field = new Field({});
        const firstMove = { type: Piece.I, rotation: Rotation.Spawn, coordinate: { x: 1, y: 0 } };
        const secondMove = { type: Piece.T, rotation: Rotation.Reverse, coordinate: { x: 1, y: 1 } };

        const pages = new Pages([fieldObj(field, firstMove), fieldRef(0, secondMove), fieldRef(0)] as any);

        {
            const expectedField = field.copy();
            expectedField.put(firstMove);
            expectedField.put(secondMove);
            expect(pages.getField(2)).toEqual(expectedField);
        }
    });

    test('using cache', () => {
        const field = new Field({});
        field.put({ type: Piece.O, rotation: Rotation.Spawn, coordinate: { x: 8, y: 0 } });

        const pages = new Pages([fieldCache(field)] as any);
        expect(pages.getField(0)).toEqual(field);
    });

    test('using cache ref', () => {
        const field = new Field({});
        const firstMove = { type: Piece.I, rotation: Rotation.Spawn, coordinate: { x: 1, y: 0 } };
        const secondMove = { type: Piece.T, rotation: Rotation.Reverse, coordinate: { x: 1, y: 1 } };
        const thirdMove = { type: Piece.O, rotation: Rotation.Spawn, coordinate: { x: 8, y: 0 } };

        const cache = field.copy();
        cache.put(firstMove);
        cache.put(secondMove);

        const pages = new Pages([
            fieldObj(field, firstMove),
            fieldCache(cache, secondMove),
            fieldRef(0, thirdMove),
        ] as any);

        {
            const expectedField = field.copy();
            expectedField.put(firstMove);
            expectedField.put(secondMove);
            expect(pages.getField(2)).toEqual(expectedField);
        }
    });
});
