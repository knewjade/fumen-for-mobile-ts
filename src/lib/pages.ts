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

export function isQuizCommentResult(result: CommentResult): result is QuizCommentResult {
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
        return currentPage.flags.quiz ? this.restructureQuiz(index) : this.getDescription(index);
    }

    // 指定したページのフィールドを取得する
    getField(index: number, operation: PageFieldOperation = PageFieldOperation.None): Field {
        return this.restructureField(index, operation);
    }

    // TODO: Add test
    insertRefPage(index: number) {
        if (index < 0) {
            throw new FumenError(`Illegal index: ${index}`);
        }

        // ひとつ前のページがないときはエラー
        const prev = this.pages[index - 1];
        if (prev === undefined) {
            throw new FumenError(`Not found prev page: ${index}`);
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
                quiz: prev.flags.quiz,
            },
            piece: prev.flags.lock ? undefined : prev.piece,
        };

        // フィールドの参照
        if (prev.field.ref !== undefined) {
            page.field.ref = prev.field.ref;
        } else if (prev.field.obj !== undefined) {
            page.field.ref = index - 1;
        } else {
            throw new FumenError(`Unexpected field: ${prev.field}`);
        }

        // コメントの参照
        if (prev.comment.ref !== undefined) {
            page.comment.ref = prev.comment.ref;
        } else if (prev.comment.text !== undefined) {
            page.comment.ref = index - 1;
        } else {
            throw new FumenError(`Unexpected comment: ${prev.comment}`);
        }

        this.insertPage(index, page);
    }

    // TODO: Add test
    insertKeyPage(index: number) {
        if (index < 0) {
            throw new FumenError(`Illegal index: ${index}`);
        }

        // ひとつ前のページがないときはエラー
        const prev = this.pages[index - 1];
        if (prev === undefined) {
            throw new FumenError(`Not found prev page: ${index}`);
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
                quiz: prev.flags.quiz,
            },
            piece: prev.flags.lock ? undefined : prev.piece,
        };

        // コメントの参照
        if (prev.comment.ref !== undefined) {
            page.comment.ref = prev.comment.ref;
        } else if (prev.comment.text !== undefined) {
            page.comment.ref = index - 1;
        } else {
            throw new FumenError(`Unexpected comment: ${prev.comment}`);
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
                    if (currentRef < index) {
                        page.field.ref = ref.field;
                    } else if (index <= currentRef) {
                        page.field.ref += 1;
                    }
                }

                if (page.comment.ref !== undefined) {
                    const currentRef = page.comment.ref;
                    if (currentRef < index) {
                        page.comment.ref = ref.comment;
                    } else if (index <= currentRef) {
                        page.comment.ref += 1;
                    }
                }
                return page;
            }));
    }

    // TODO: Add test
    duplicatePage(index: number) {
        if (index < 0) {
            throw new FumenError(`Illegal index: ${index}`);
        }

        // ひとつ前のページがないときはエラー
        const prev = this.pages[index - 1];
        if (prev === undefined) {
            throw new FumenError(`Not found prev page: ${index}`);
        }

        const currentField = this.restructureField(index - 1, PageFieldOperation.Command);

        const page: Page = {
            index,
            field: { obj: currentField },
            comment: { ref: undefined },
            flags: {
                ...prev.flags,
            },
            piece: prev.piece !== undefined ? {
                type: prev.piece.type,
                rotation: prev.piece.rotation,
                coordinate: {
                    ...prev.piece.coordinate,
                },
            } : undefined,
        };

        // コメントの参照
        if (prev.comment.ref !== undefined) {
            page.comment.ref = prev.comment.ref;
        } else if (prev.comment.text !== undefined) {
            page.comment.ref = index - 1;
        } else {
            throw new FumenError(`Unexpected comment: ${prev.comment}`);
        }

        this.insertPage(index, page);
    }

    // TODO: Add unit test
    deletePage(index: number) {
        const nextPage = this.pages[index + 1];

        const ref = {
            field: 0,
            comment: 0,
        };

        const reversedHeadPages = this.pages.slice(0, index).reverse();
        if (nextPage !== undefined && nextPage.field.obj !== undefined) {
            ref.field = index;
        } else {
            const lastKeyIndex = reversedHeadPages.findIndex(page => page.field.obj !== undefined);
            ref.field = 0 <= lastKeyIndex ? index - lastKeyIndex - 1 : 0;
        }

        if (nextPage !== undefined && nextPage.comment.text !== undefined) {
            ref.comment = index;
        } else {
            const lastKeyIndex = reversedHeadPages.findIndex(page => page.comment.text !== undefined);
            ref.comment = 0 <= lastKeyIndex ? index - lastKeyIndex - 1 : 0;
        }

        this.pages = this.pages.slice(0, index)
            .concat(this.pages.slice(index + 1).map((page) => {
                page.index -= 1;

                if (page.field.ref !== undefined) {
                    const currentRef = page.field.ref;
                    if (currentRef <= index) {
                        page.field.ref = ref.field;
                    } else if (index < currentRef) {
                        page.field.ref -= 1;
                    }
                }

                if (page.comment.ref !== undefined) {
                    const currentRef = page.comment.ref;
                    if (currentRef <= index) {
                        page.comment.ref = ref.comment;
                    } else if (index < currentRef) {
                        page.comment.ref -= 1;
                    }
                }
                return page;
            }));
    }

    // TODO: Add test
    toRefPage(index: number) {
        const pages = this.pages;

        if (index <= 0 || pages.length <= index) {
            throw new FumenError(`Illegal index: ${index}`);
        }

        if (pages[index].field.obj === undefined) {
            throw new FumenError(`Not found field obj: ${index}`);
        }

        // フィールドの差分をコマンドにする
        const prevField = this.getField(index - 1, PageFieldOperation.All);
        const currentField = this.getField(index, PageFieldOperation.Command);

        pages[index].commands = parseToCommands(prevField, currentField);

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

        // 現在のフィールドを参照に置き換える
        pages[index].field = { ref };
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
        const currentField = this.getField(index, PageFieldOperation.None);

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

    // TODO: Add test
    freezeComment(index: number) {
        const pages = this.pages;

        if (index <= 0 || pages.length <= index) {
            return;
        }

        const page = pages[index];
        if (page === undefined) {
            throw new FumenError('Not found page');
        }

        if (page.comment.text !== undefined) {
            return;
        }

        const ref = page.comment.ref;
        if (ref === undefined) {
            return;
        }

        // 現在のコメントを取得
        const currentCommentResult = this.getComment(index);
        if (isTextCommentResult(currentCommentResult)) {
            page.comment = { text: currentCommentResult.text };
        } else {
            page.comment = { text: currentCommentResult.quiz };
        }

        // 次のページ以降で、現在のページより前をrefにしているページの参照先を置き換える
        for (let i = index + 1; i < pages.length; i += 1) {
            const commentRef = pages[i].comment.ref;
            if (commentRef !== undefined && commentRef < index) {
                pages[i].comment.ref = index;
            }
        }
    }

    // TODO: Add test
    unfreezeComment(index: number) {
        const pages = this.pages;

        if (index <= 0 || pages.length <= index) {
            return;
        }

        const page = pages[index];
        if (page === undefined) {
            throw new FumenError('Not found page');
        }

        if (page.comment.ref !== undefined) {
            return;
        }

        const text = page.comment.text;
        if (text === undefined) {
            return;
        }

        // 参照させるページを取得
        let ref = 0;
        for (let i = index - 1; 0 <= i; i -= 1) {
            if (pages[i].comment.ref === undefined) {
                ref = i;
                break;
            }
        }

        // 次のページ以降で、現在のページをrefにしているページの参照先を置き換える
        for (let i = index + 1; i < pages.length; i += 1) {
            const commentRef = pages[i].comment.ref;
            if (commentRef !== undefined && commentRef === index) {
                pages[i].comment.ref = ref;
            }
        }

        // 反映
        pages[index].comment = { ref };
    }

    private restructureQuiz(pageIndex: number): TextCommentResult | QuizCommentResult {
        const currentPage = this.pages[pageIndex];

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
                    startIndex: pageIndex,
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
            let cache = { quiz: state.quiz, comment: state.comment };
            let result: QuizCommentResult = { quizAfterOperation: cache.quiz, quiz: cache.comment };
            for (let index = state.startIndex; index <= pageIndex; index += 1) {
                const quizPage = this.pages[index];

                if (!quizPage.flags.quiz) {
                    throw new ViewError('Unexpected quiz operation');
                }

                const currentQuiz = cache.quiz;
                if (currentQuiz.canOperate()) {
                    if (quizPage.piece !== undefined && quizPage.flags.lock) {
                        try {
                            // ミノを操作をする
                            const operation = currentQuiz.getOperation(quizPage.piece.type);
                            const quizAfterOperation = currentQuiz.operate(operation);

                            result = { quizAfterOperation, quiz: cache.comment };
                            cache = { quiz: quizAfterOperation, comment: quizAfterOperation.format().toString() };
                        } catch (e) {
                            // Quizの解釈ができない
                            result = { quizAfterOperation: cache.quiz, quiz: cache.comment };
                        }
                    } else {
                        result = { quizAfterOperation: cache.quiz, quiz: cache.comment };
                    }
                } else {
                    // Quizが終了した後、変化することはないため、目的のページのNext, Holdを直接算出
                    return {
                        text: cache.comment,
                        next: Pages.extractNext(this.pages.slice(pageIndex)),
                    };
                }
            }

            return result;
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

// targetと同じ地形になるようなコマンドに変換
const parseToCommands = (current: Field, goal: Field): Page['commands'] => {
    const commands: Page['commands'] = {
        pre: {},
    };

    // 地形の差をコマンドに変換
    for (let y = -1; y < 24; y += 1) {
        for (let x = 0; x < 10; x += 1) {
            const currentPiece = current.get(x, y);
            const goalPiece = goal.get(x, y);

            const isField = 0 <= y;
            const i = isField ? x + y * 10 : -x;
            const type = isField ? 'block' : 'sentBlock';
            const key = `${type}-${i}`;

            if (currentPiece !== goalPiece) {
                // 操作の結果、最初のフィールドの状態から変化するとき
                commands.pre[key] = { x, y, type, piece: goalPiece };
            }
        }
    }

    return commands;
};
