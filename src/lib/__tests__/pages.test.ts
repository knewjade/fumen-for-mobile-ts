import { Piece, Rotation } from '../enums';
import { Quiz } from '../fumen/quiz';
import { Field } from '../fumen/field';
import { Move } from '../fumen/types';
import { Pages } from '../pages';

describe('comment', () => {
    const commentText = (text: string) => ({
        comment: { text },
        flags: { quiz: false },
    });

    const commentRef = (ref: number) => ({
        comment: { ref },
        flags: { quiz: false },
    });

    const quizText = (quiz: Quiz, piece?: Piece) => ({
        comment: { text: quiz.toString() },
        piece: piece !== undefined ? { type: piece } : undefined,
        flags: {
            lock: true,
            quiz: true,
        },
    });

    const quizRef = (ref: number, piece?: Piece) => ({
        comment: { ref },
        piece: piece !== undefined ? { type: piece } : undefined,
        flags: {
            lock: true,
            quiz: true,
        },
    });

    const quizRefWithPiece = (ref: number, piece?: Piece) => ({
        comment: { ref },
        piece: { type: piece },
        flags: {
            quiz: true,
            lock: piece !== undefined,
        },
    });

    const pieceRef = (piece: Move, lock: boolean = true) => ({
        piece,
        flags: {
            lock,
            quiz: true,
        },
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
        const pages = new Pages([quizText(Quiz.create('IOT'), Piece.I), quizRef(0, Piece.T)] as any);
        expect(pages.getComment(1)).toEqual({
            quiz: Quiz.create('OT').toString(),
            quizAfterOperation: Quiz.create('O', ''),
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
            quizText(Quiz.create('O', 'L'), Piece.L),
            quizRef(0),
            quizRef(0, Piece.O),
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
});
