import { Field } from './field';
import { EncodePage, Move, Page, PreCommand } from './types';
import { generateKey } from '../random';
import { isMinoPiece } from '../enums';
import { Quiz } from './quiz';
import { FumenError } from '../errors';

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
    quiz: { enable: false } | { enable: true, quiz: Quiz, quizAfterOperation: Quiz };
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
        let comment: { text: string, ref: number } = { text: '', ref: -1 };
        let quiz: CachePage['quiz'] = {
            enable: false,
        };

        for (let index = 0; index < pages.length; index += 1) {
            const page = pages[index];

            if (page.field.obj !== undefined) {
                field = page.field.obj.copy();
            }

            if (page.comment.text !== undefined) {
                console.log(page);

                if (page.flags.quiz) {
                    // Quiz comment

                    if (quiz.enable && quiz.quizAfterOperation.format().toString() === page.comment.text) {
                        console.log('continue');
                        // Quiz on at prev page
                        comment = {
                            text: quiz.quizAfterOperation.format().toString(),
                            ref: comment.ref,
                        };
                        quiz = {
                            enable: true,
                            quiz: quiz.quizAfterOperation,
                            quizAfterOperation: quiz.quizAfterOperation,
                        };
                    } else {
                        console.log('first');
                        // Quiz on first
                        comment = {
                            text: page.comment.text,
                            ref: index,
                        };
                        quiz = {
                            enable: true,
                            quiz: new Quiz(page.comment.text),
                            quizAfterOperation: new Quiz(page.comment.text),
                        };
                    }
                } else {
                    console.log('normal');

                    // Normal comment
                    comment = {
                        text: page.comment.text,
                        ref: page.comment.text === comment.text ? comment.ref : index,
                    };
                    quiz = {
                        enable: false,
                    };
                }
            } else {
                if (page.flags.quiz) {
                    // Quiz on at prev page

                    if (quiz.enable) {
                        // Quiz on at prev page
                        comment = {
                            text: quiz.quizAfterOperation.format().toString(),
                            ref: comment.ref,
                        };
                        quiz = {
                            enable: true,
                            quiz: quiz.quizAfterOperation,
                            quizAfterOperation: quiz.quizAfterOperation,
                        };
                    } else {
                        throw new FumenError('No reachable');
                    }
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

            if (page.commands !== undefined) {
                const commands = page.commands;
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

            const p2: CachePage = {
                field: {
                    obj: field.copy(),
                    ref: page.field.ref,
                },
                piece: page.piece,
                comment: {
                    text: comment.text,
                    ref: comment.ref,
                },
                commands: page.commands !== undefined ? {
                    ...page.commands,
                } : undefined,
                flags: { ...page.flags },
                quiz: { ...quiz },
            };
            console.log('p2');
            console.log(p2);

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
            pages.push({
                field: page.field.obj,
                comment: page.comment.ref === index ? page.comment.text : undefined,
                piece: page.piece,
                flags: {
                    ...page.flags,

                    // 公式テト譜は最初のページ以外でcolorize=trueにならない
                    // 各ページに色フラグが必要になるまで仕様を統一する
                    colorize: index === 0 ? page.flags.colorize : false,
                },
            });
        }
        return pages;
    }
}
