import { Field } from './field';
import { EncodePage, Move, Page, PreCommand } from './types';
import { generateKey } from '../random';
import { isMinoPiece } from '../enums';
import { Quiz } from './quiz';

interface CachePage {
    field: {
        obj: Field;
        ref?: number;
    };
    piece?: Move;
    comment: {
        text: string;
        ref?: number;
    };
    commands?: {
        pre: {
            [key in string]: PreCommand;
        };
    };
    quiz: { enable: false } | { enable: true, continue: boolean, quiz: Quiz, quizAfterOperation: Quiz };
    flags: {
        lock: boolean;
        mirror: boolean;
        colorize: boolean;
        rise: boolean;
        quiz: boolean;
    };
}

interface HashCachePage {
    page: CachePage;
    hash: string;
}

export class CachePages {
    private cache: HashCachePage[] = [];

    constructor(pages: Page[]) {
        const hash = generateKey();

        let field = new Field({});
        let comment = '';
        let quiz: CachePage['quiz'] = {
            enable: false,
        };

        for (const page of pages) {
            if (page.field.obj !== undefined) {
                field = page.field.obj.copy();
            }

            if (page.comment.text !== undefined) {
                comment = page.comment.text;

                if (page.flags.quiz) {
                    if (quiz.enable && quiz.quizAfterOperation.format().toString() === page.comment.text) {
                        quiz = {
                            enable: true,
                            continue: true,
                            quiz: quiz.quiz,
                            quizAfterOperation: quiz.quizAfterOperation,
                        };
                    } else {
                        quiz = {
                            enable: true,
                            continue: false,
                            quiz: new Quiz(page.comment.text),
                            quizAfterOperation: new Quiz(page.comment.text),
                        };
                    }
                } else {
                    quiz = {
                        enable: false,
                    };
                }
            }

            if (quiz.enable && page.flags.lock) {
                if (page.piece !== undefined && isMinoPiece(page.piece.type)) {
                    try {
                        // ミノを操作をする
                        const nextQuiz = quiz.quiz.nextIfEnd();
                        const operation = nextQuiz.getOperation(page.piece.type);
                        quiz.quizAfterOperation = nextQuiz.operate(operation);
                    } catch (e) {
                        console.error(e);

                        // Quizの解釈ができない
                        quiz.quizAfterOperation = quiz.quiz.format();
                    }
                } else {
                    quiz.quizAfterOperation = quiz.quiz.format();
                }
            }

            const p2: CachePage = {
                field: {
                    obj: field.copy(),
                    ref: page.field.ref,
                },
                piece: page.piece,
                comment: {
                    text: comment,
                    ref: page.comment.ref,
                },
                commands: page.commands !== undefined ? {
                    ...page.commands,
                } : undefined,
                flags: { ...page.flags },
                quiz: { ...quiz },
            };

            // 地形の更新
            if (page.flags.lock) {
                if (page.piece !== undefined && isMinoPiece(page.piece.type)) {
                    field.put(page.piece);
                }

                field.clearLine();

                if (page.flags.rise) {
                    field.up();
                }

                if (page.flags.mirror) {
                    field.mirror();
                }
            }

            this.cache.push({ hash, page: p2 });
        }
    }

    get encode() {
        const pages: EncodePage[] = [];
        for (let index = 0; index < this.cache.length; index += 1) {
            const cache = this.cache[index];
            const page = cache.page;
            const quiz = page.quiz;
            pages.push({
                field: page.field.obj,
                comment: quiz.enable && quiz.continue ? undefined : page.comment.text,
                piece: page.piece,
                flags: {
                    ...page.flags,
                    colorize: index === 0 ? page.flags.colorize : false,
                },
            });
        }
        return pages;
    }
}
