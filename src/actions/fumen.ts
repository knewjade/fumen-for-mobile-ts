import { Block, CachedPage } from '../states';
import { ViewError } from '../lib/errors';
import { Quiz } from '../lib/fumen/quiz';
import { Field } from '../lib/fumen/field';
import { Move } from '../lib/fumen/fumen';
import { getBlocks, isMinoPiece, Piece } from '../lib/enums';

const NEXT_PIECES = 5;

export interface TextCommentResult {
    text: string;
    next: Piece[];
}

export interface QuizCommentResult {
    quiz: string;
    quizAfterOperation: Quiz;
}

// 必要があればCacheを作成しつつ、Pageを操作する
export class Pages {
    constructor(private readonly pages: CachedPage[]) {
    }

    // 指定したページのコメントを取得する
    getComment(index: number): TextCommentResult | QuizCommentResult {
        const currentPage = this.pages[index];

        if (currentPage.comment.cache !== undefined) {
            return currentPage.comment.cache;
        }

        const quiz = currentPage.quiz !== undefined;
        return quiz ? this.restructureQuiz(index) : this.getDescription(index);
    }

    private restructureQuiz(index: number): TextCommentResult | QuizCommentResult {
        const currentPage = this.pages[index];

        const toCache = (quiz: string, quizAfterOperation: Quiz) => ({ quiz, quizAfterOperation });

        const getQuiz = () => {

            // コメントがあるときはそのまま返却
            let comment: string;
            let quiz: Quiz;
            let startIndex;
            if (currentPage.comment.text !== undefined) {
                comment = currentPage.comment.text;
                quiz = new Quiz(comment);
                startIndex = index;
            } else {
                // 参照先から持ってくる
                const ref = currentPage.comment.ref;
                if (ref === undefined) {
                    throw new ViewError('Cannot open reference for comment');
                }

                const refPage = this.pages[ref];
                if (refPage.comment.text === undefined) {
                    throw new ViewError('Not found quiz');
                }

                comment = refPage.comment.text;
                quiz = new Quiz(comment);
                startIndex = ref;
            }

            // 参照ページから現在のページまで操作を再現する
            for (let i = startIndex; i <= index; i += 1) {
                const quizPage = this.pages[i];
                if (quizPage.quiz === undefined) {
                    throw new ViewError('Unexpected quiz operation');
                }

                if (quiz.canOperate()) {
                    // ミノを操作をする
                    let quizAfterOperation = quiz;
                    if (quizPage.quiz.operation !== undefined) {
                        quizAfterOperation = quiz.operate(quizPage.quiz.operation);
                    }

                    // コメントをキャッシュする
                    quizPage.comment.cache = toCache(comment, quizAfterOperation);

                    quiz = quizAfterOperation;
                    comment = quiz.format().toString();
                } else {
                    // Next, Holdを算出
                    const next = this.extractNext(this.pages.slice(index));

                    quizPage.comment.cache = {
                        next,
                        text: comment,
                    };
                }
            }

            return this.pages[index].comment.cache!;
        };

        return getQuiz();
    }

    // 通常のコメントを取得
    private getDescription(index: number): TextCommentResult {
        const page = this.pages[index];

        const getText = () => {
            // textがあるとき
            if (page.comment.text !== undefined) {
                return page.comment.text;
            }

            // 参照先から持ってくる
            if (page.comment.ref !== undefined) {
                const refPage = this.pages[page.comment.ref];

                if (refPage.comment.text === undefined) {
                    throw new ViewError('Unexpected comment');
                }

                return refPage.comment.text;
            }

            throw new ViewError('Not found comment');
        };

        // Next, Holdを算出
        const next = this.extractNext(this.pages.slice(index));

        const result = {
            next,
            text: getText(),
        };

        // コメントをキャッシュする
        this.pages[index].comment.cache = result;

        return result;
    }

    private extractNext(pages: CachedPage[]) {
        const next: Piece[] = [];
        const head = pages[0];
        let currentPiece = head.piece !== undefined ? head.piece.type : Piece.Empty;

        for (const nextPage of pages) {
            // ミノが変わったときは記録する
            if (nextPage.piece !== undefined && currentPiece !== nextPage.piece.type) {
                const pieceType = nextPage.piece.type;
                if (isMinoPiece(pieceType)) {
                    next.push(pieceType);
                }

                currentPiece = pieceType;
            }

            // 必要な数が溜まったら終了する
            if (NEXT_PIECES <= next.length) {
                break;
            }

            // ミノを接着したときは現在の使用ミノをEmptyに置き換える
            if (nextPage.piece === undefined || nextPage.flags.lock) {
                currentPiece = Piece.Empty;
            }
        }

        return next;
    }

// 指定したページのフィールドを取得する
    getField(index: number) {
        const currentPage = this.pages[index];

        if (currentPage.field.cache !== undefined) {
            return currentPage.field.cache.obj;
        }

        return currentPage.field.obj !== undefined ? currentPage.field.obj : this.restructureField(index);
    }

    private restructureField(index: number) {
        const currentPage = this.pages[index];

        // 参照先から持ってくる
        const ref = currentPage.field.ref;
        if (ref === undefined) {
            throw new ViewError('Cannot open reference for comment');
        }

        const refPage = this.pages[ref];
        if (refPage.field.obj === undefined) {
            throw new ViewError('Not found quiz');
        }

        // 参照ページから現在のページまで操作を再現する
        const field = refPage.field.obj.copy();
        for (let i = ref; i < index; i += 1) {
            // フィールドをキャッシュする
            const fieldPage = this.pages[i];
            fieldPage.field.cache = {
                obj: field.copy(),
            };

            const { flags, piece } = this.pages[i];

            if (flags.lock) {
                if (piece !== undefined && isMinoPiece(piece.type)) {
                    field.put(piece);
                }

                field.clearLine();
            }

            if (flags.blockUp) {
                field.up();
            }

            if (flags.mirrored) {
                field.mirror();
            }
        }

        // フィールドをキャッシュする
        currentPage.field.cache = {
            obj: field.copy(),
        };

        return field;
    }
}

export const parseToBlocks = (field: Field, move?: Move) => {
    const parse = (piece: Piece) => ({ piece });

    const playField: Block[] = field.toPlayFieldPieces().map(parse);
    const sentLine: Block[] = field.toSentLintPieces().map(parse);

    if (move !== undefined && isMinoPiece(move.type)) {
        const coordinate = move.coordinate;
        const blocks = getBlocks(move.type, move.rotation);
        for (const block of blocks) {
            const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
            playField[x + y * 10] = {
                piece: move.type,
                highlight: true,
            };
        }
    }

    return { playField, sentLine };
};
