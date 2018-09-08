import { FumenError, ViewError } from './errors';
import { isMinoPiece, Piece } from './enums';
import { Quiz } from './fumen/quiz';
import { Page, PreCommand } from './fumen/fumen';
import { Field } from './fumen/field';

const NEXT_PIECES = 5;

type CommentResult = TextCommentResult | QuizCommentResult;

export interface TextCommentResult {
    text: string;
    next: Piece[];
}

function isTextCommentResult(result: CommentResult): result is TextCommentResult {
    return (result as TextCommentResult).text !== undefined;
}

export interface QuizCommentResult {
    quiz: string;
    quizAfterOperation: Quiz;
}

function isQuizCommentResult(result: CommentResult): result is QuizCommentResult {
    return (result as QuizCommentResult).quiz !== undefined;
}

// 必要があればCacheを作成しつつ、Pageを操作する
export class Pages {
    // Shallow copy
    constructor(public pages: Page[]) {
    }

    private static extractNext(pages: Page[]) {
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

    // 指定したページのコメントを取得する
    getComment(index: number): CommentResult {
        const currentPage = this.pages[index];
        const quiz = currentPage.quiz !== undefined;
        return quiz ? this.restructureQuiz(index) : this.getDescription(index);
    }

    // 指定したページのフィールドを取得する
    getField(index: number, operation: PageFieldOperation = PageFieldOperation.None): Field {
        return this.restructureField(index, operation);
    }

    // TODO: Add test
    insertRefPage(index: number) {
        if (index < 0) {
            throw new FumenError('Illegal index: ' + index);
        }

        // ひとつ前のページがないときはエラー
        const prev = this.pages[index - 1];
        if (prev === undefined) {
            throw new FumenError('Not found prev page: ' + index);
        }

        const page: Page = {
            index,
            field: { ref: undefined },
            comment: { ref: undefined },
            flags: {
                lock: prev.flags.lock,
                mirror: prev.flags.lock ? false : prev.flags.mirror,
                colorize: prev.flags.colorize,
                rise: prev.flags.lock ? false : prev.flags.rise,
            },
            piece: prev.flags.lock ? undefined : prev.piece,
            quiz: prev.quiz !== undefined ? { operation: undefined } : undefined,
        };

        // フィールドの参照
        if (prev.field.ref !== undefined) {
            page.field.ref = prev.field.ref;
        } else if (prev.field.obj !== undefined) {
            page.field.ref = index - 1;
        } else {
            throw new FumenError('Unexpected field: ' + prev.field);
        }

        // コメントの参照
        if (prev.comment.ref !== undefined) {
            page.comment.ref = prev.comment.ref;
        } else if (prev.comment.text !== undefined) {
            page.comment.ref = index - 1;
        } else {
            throw new FumenError('Unexpected comment: ' + prev.comment);
        }

        this.insertPage(index, page);
    }

    // TODO: Add test
    insertKeyPage(index: number) {
        if (index < 0) {
            throw new FumenError('Illegal index: ' + index);
        }

        // ひとつ前のページがないときはエラー
        const prev = this.pages[index - 1];
        if (prev === undefined) {
            throw new FumenError('Not found prev page: ' + index);
        }

        const currentField = this.restructureField(index - 1, PageFieldOperation.All);

        const page: Page = {
            index,
            field: { obj: currentField },
            comment: { ref: undefined },
            flags: {
                lock: prev.flags.lock,
                mirror: prev.flags.lock ? false : prev.flags.mirror,
                colorize: prev.flags.colorize,
                rise: prev.flags.lock ? false : prev.flags.rise,
            },
            piece: prev.flags.lock ? undefined : prev.piece,
            quiz: prev.quiz !== undefined ? { operation: undefined } : undefined,
        };

        // コメントの参照
        if (prev.comment.ref !== undefined) {
            page.comment.ref = prev.comment.ref;
        } else if (prev.comment.text !== undefined) {
            page.comment.ref = index - 1;
        } else {
            throw new FumenError('Unexpected comment: ' + prev.comment);
        }

        this.insertPage(index, page);
    }

    insertPage(index: number, page: Page) {
        const ref = {
            field: page.field.ref !== undefined ? page.field.ref : page.index,
            comment: page.comment.ref !== undefined ? page.comment.ref : page.index,
        };

        this.pages = this.pages.slice(0, index)
            .concat([page])
            .concat(this.pages.slice(index).map((page) => {
                page.index += 1;

                if (page.field.ref !== undefined) {
                    const currentRef = page.field.ref;
                    if (currentRef <= index) {
                        page.field.ref = ref.field;
                    } else if (index < currentRef) {
                        page.field.ref += 1;
                    }
                }

                if (page.comment.ref !== undefined) {
                    const currentRef = page.comment.ref;
                    if (currentRef <= index) {
                        page.comment.ref = ref.comment;
                    } else if (index < currentRef) {
                        page.comment.ref += 1;
                    }
                }
                return page;
            }));
    }

    // TODO: Add test
    toRefPage(index: number) {
        const pages = this.pages;

        if (index <= 0 || pages.length <= index) {
            throw new FumenError('Illegal index: ' + index);
        }

        if (pages[index].field.obj === undefined) {
            throw new FumenError('Not found field obj: ' + index);
        }

        // 現在のフィールドを取得
        const prevField = this.getField(index - 1, PageFieldOperation.All);
        const currentField = this.getField(index, PageFieldOperation.None);

        // 前のページで最も近いobjのインデックスを取得
        let ref = 0;
        for (let i = index - 1; 0 <= i; i -= 1) {
            if (pages[i].field.obj !== undefined) {
                ref = i;
                break;
            }
        }

        // 次のページ以降で、現在のページをrefにしていたページの参照先を置き換える
        for (let i = ref + 1; i < pages.length; i += 1) {
            const fieldRef = pages[i].field.ref;
            if (fieldRef === index) {
                pages[i].field.ref = ref;
            }
        }

        const page = pages[index];
        const currentCommands = page.commands ? page.commands : { pre: {} };
        const newCommands: Page['commands'] = {
            pre: {},
        };

        // 前ページとの差をコマンドに変換
        for (let y = -1; y < 24; y += 1) {
            for (let x = 0; x < 10; x += 1) {
                const currentPiece = currentField.get(x, y);
                const prevPiece = prevField.get(x, y);

                const isField = 0 <= y;
                const i = isField ? x + y * 10 : -x;
                const type = isField ? 'block' : 'sentBlock';
                const key = `${type}-${i}`;

                if (currentPiece !== prevPiece) {
                    // 操作の結果、最初のフィールドの状態から変化するとき
                    newCommands.pre[key] = { x, y, type, piece: currentPiece };
                } else {
                    // 操作の結果、最初のフィールドの状態に戻るとき
                    delete newCommands.pre[key];
                }
            }
        }

        // 現ページの操作を引き継ぐ
        Object.keys(currentCommands.pre).forEach((key) => {
            newCommands.pre[key] = currentCommands.pre[key];
        });

        // 反映
        page.commands = newCommands;

        pages[index].field = {
            ref,
        };
    }

    // TODO: Add test
    toKeyPage(index: number) {
        const pages = this.pages;

        if (index <= 0 || pages.length <= index) {
            return;
        }

        const ref = pages[index].field.ref;
        if (ref === undefined) {
            return;
        }

        // 現在のフィールドを取得
        const pagesObj = new Pages(pages);
        const currentField = pagesObj.getField(index, PageFieldOperation.None);

        // 次のページ以降で、現在のページより前をrefにしているページの参照先を置き換える
        for (let i = index + 1; i < pages.length; i += 1) {
            const fieldRef = pages[i].field.ref;
            if (fieldRef !== undefined && fieldRef < index) {
                pages[i].field.ref = index;
            }
        }

        // 反映
        pages[index].field = {
            obj: currentField,
        };
    }

    // TODO: Add unit test
    deletePage(index: number) {
        if (index < 0) {
            throw new FumenError('Illegal index: ' + index);
        }

        if (this.pages.length <= 1) {
            return;
        }

        // 最後のページのときはそのまま削除
        if (index === this.pages.length - 1) {
            this.pages = this.pages.slice(0, index);
            return;
        }

        // 現在のページがないときはエラー
        const current = this.pages[index];
        if (current === undefined) {
            throw new FumenError('Not found current page: ' + index);
        }

        // 次のページがないときはエラー
        const next = this.pages[index + 1];
        if (next === undefined) {
            throw new FumenError('Not found next page: ' + index + 1);
        }

        // フィールドの参照
        if (next.field.obj === undefined) {
            // 次のページが参照のときは統合する
            // 現ページにobjがあって、
            const currentFieldObj = this.restructureField(index, PageFieldOperation.All);
            const nextFieldObj = this.restructureField(index + 1, PageFieldOperation.None);
            if (currentFieldObj !== nextFieldObj) {
                next.field = { obj: currentFieldObj };
            }
        }

        // コメントの参照
        if (current.comment.text !== undefined && next.comment.text === undefined) {
            // コメント参照
            // 現ページにtextがあって、次のページが参照のときは統合する
            next.comment = { text: current.comment.text };
        } else if (current.quiz !== undefined && next.quiz !== undefined) {
            // Quizの参照
            // 現ページにquizがあって、次のページもquizのときは統合する
            const comment = this.restructureQuiz(index);
            if (!isQuizCommentResult(comment)) {
                throw new ViewError('Unexpected quiz comment');
            }
            next.comment = { text: comment.quizAfterOperation.format().toString() };
        }

        // 色の参照
        if (index === 0 && current.flags.colorize !== next.flags.colorize) {
            next.flags.colorize = current.flags.colorize;
        }

        const slidedPages = [next].concat(this.pages.slice(index + 2));
        const newFieldRef = next.field.ref !== undefined ? next.field.ref : index;
        const newCommentRef = next.comment.ref !== undefined ? next.comment.ref : index;
        for (const page of slidedPages) {
            page.index -= 1;

            if (page.field.ref !== undefined) {
                if (page.field.ref < index) {
                    page.field.ref = newFieldRef;
                } else if (index < page.field.ref) {
                    page.field.ref -= 1;
                }
            }

            if (page.comment.ref !== undefined) {
                if (page.comment.ref < index) {
                    page.comment.ref = newCommentRef;
                } else if (index < page.comment.ref) {
                    page.comment.ref -= 1;
                }
            }
        }

        this.pages = this.pages.slice(0, index).concat(slidedPages);
    }

    private restructureQuiz(index: number): TextCommentResult | QuizCommentResult {
        const currentPage = this.pages[index];

        const toCache = (quiz: string, quizAfterOperation: Quiz) => ({ quiz, quizAfterOperation });

        const getQuiz = (): TextCommentResult | QuizCommentResult => {
            let state: undefined | {
                comment: string;
                quiz: Quiz;
                startIndex: number;
            } = undefined;

            // コメントがあるときはそのまま返却
            if (currentPage.comment.text !== undefined) {
                const comment = currentPage.comment.text;
                state = {
                    comment,
                    quiz: new Quiz(comment),
                    startIndex: index,
                };
            } else {
                // 参照先から持ってくる
                const ref = currentPage.comment.ref;
                if (ref === undefined) {
                    throw new ViewError('Cannot open reference for comment');
                }

                // キャッシュが見つからなかったとき
                if (state === undefined) {
                    const refPage = this.pages[ref];
                    if (refPage.comment.text === undefined) {
                        throw new ViewError('Not found quiz');
                    }

                    const comment = refPage.comment.text;
                    state = {
                        comment,
                        quiz: new Quiz(comment),
                        startIndex: ref,
                    };
                }
            }

            if (state === undefined) {
                throw new ViewError('Unexpected state');
            }

            // 参照ページから現在のページまで操作を再現する
            let { quiz, comment } = state;
            let cache: TextCommentResult | QuizCommentResult | undefined;
            for (let i = state.startIndex; i <= index; i += 1) {
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
                    cache = toCache(comment, quizAfterOperation);

                    quiz = quizAfterOperation;
                    comment = quiz.format().toString();
                } else {
                    // Next, Holdを算出
                    const next = Pages.extractNext(this.pages.slice(i));

                    cache = {
                        next,
                        text: comment,
                    };
                }
            }

            return cache!;
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
        const next = Pages.extractNext(this.pages.slice(index));

        return {
            next,
            text: getText(),
        };
    }

    private restructureField(index: number, operation: PageFieldOperation): Field {
        const currentPage = this.pages[index];

        const getField = () => {
            let state: undefined | {
                field: Field;
                startIndex: number;
                cache: boolean;
            } = undefined;

            if (currentPage.field.obj !== undefined) {
                state = {
                    field: currentPage.field.obj.copy(),
                    startIndex: index,
                    cache: false,
                };
            } else {
                // 参照先から持ってくる
                const ref = currentPage.field.ref;
                if (ref === undefined) {
                    throw new ViewError('Cannot open reference for comment');
                }

                // キャッシュが見つからなかったとき
                if (state === undefined) {
                    const refPage = this.pages[ref];

                    if (refPage.field.obj === undefined) {
                        throw new ViewError('Not found quiz');
                    }

                    state = {
                        field: refPage.field.obj.copy(),
                        startIndex: ref,
                        cache: false,
                    };
                }
            }

            if (state === undefined) {
                throw new ViewError('Unexpected state');
            }

            // 参照ページから現在のページまで操作を再現する
            const { field, startIndex } = state;
            let cache: Field | undefined;
            for (let i = startIndex; i <= index; i += 1) {
                const isLast = i === index;

                if (isLast && operation === PageFieldOperation.None) {
                    return field;
                }

                // フィールドをキャッシュする
                cache = field.copy();

                const { flags, piece, commands } = this.pages[i];

                if (commands !== undefined) {
                    Object.keys(commands.pre)
                        .map(key => commands.pre[key])
                        .forEach((command: PreCommand) => {
                            switch (command.type) {
                            case 'block': {
                                const { x, y, piece } = command;
                                field.setToPlayField(x + y * 10, piece);
                                return;
                            }
                            case 'sentBlock': {
                                const { x, y, piece } = command;
                                field.setToSentLine(x + y * 10, piece);
                                return;
                            }
                            }
                        });
                }

                if (isLast && operation === PageFieldOperation.Command) {
                    return field;
                }

                if (flags.lock) {
                    if (piece !== undefined && isMinoPiece(piece.type)) {
                        field.put(piece);
                    }

                    field.clearLine();

                    if (flags.rise) {
                        field.up();
                    }

                    if (flags.mirror) {
                        field.mirror();
                    }
                }
            }

            return field;
        };

        return getField();
    }
}

export enum PageFieldOperation {
    None = 'None',
    Command = 'Command',
    All = 'All',
}