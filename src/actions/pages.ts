import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { AnimationState, getBlocks, isMinoPiece, Piece } from '../lib/enums';
import { Move, Page, PreCommand } from '../lib/fumen/fumen';
import { Field } from '../lib/fumen/field';
import { Block } from '../state_types';
import { Pages, QuizCommentResult, TextCommentResult } from '../lib/pages';
import { toInsertPageTask, toPrimitivePage, toRemovePageTask } from '../history_task';

export interface PageActions {
    openPage: (data: { index: number }) => action;
    insertPage: (data: { index: number }) => action;
    removePage: (data: { index: number }) => action;
    backLoopPage: () => action;
    nextLoopPage: () => action;
    backPage: () => action;
    nextPageOrNewPage: () => action;
    firstPage: () => action;
    lastPage: () => action;
    changeToRef: (data: { index: number }) => action;
    changeToKey: (data: { index: number }) => action;
}

export const pageActions: Readonly<PageActions> = {
    openPage: ({ index }) => (state): NextState => {
        const pages = new Pages(state.fumen.pages);

        const comment = pages.getComment(index);

        const isQuiz = (comment: TextCommentResult | QuizCommentResult): comment is QuizCommentResult => {
            return (<QuizCommentResult>comment).quiz !== undefined;
        };

        let text;
        let next;
        let hold;
        if (isQuiz(comment)) {
            text = comment.quiz;
            if (comment.quiz !== '') {
                next = comment.quizAfterOperation.getNextPieces(5).filter(piece => piece !== Piece.Empty);
                hold = comment.quizAfterOperation.getHoldPiece();
            }
        } else {
            text = comment.text;
            next = comment.next;
            hold = undefined;
        }

        const field = pages.getField(index);

        const page = state.fumen.pages[index];
        const blocks = parseToBlocks(field, page.piece, page.commands);

        return sequence(state, [
            state.play.status === AnimationState.Play ? actions.startAnimation() : undefined,
            actions.setComment({ comment: text }),
            actions.setField({
                field: blocks.playField,
                filledHighlight: page.flags.lock,
                inferences: state.events.inferences,
            }),
            actions.setSentLine({ sentLine: blocks.sentLine }),
            actions.setHold({ hold }),
            actions.setNext({ next }),
            () => ({
                fumen: {
                    ...state.fumen,
                    currentIndex: index,
                },
                cache: {
                    currentInitField: field,
                },
            }),
        ]);
    },
    insertPage: ({ index }) => (state): NextState => {
        const pages = new Pages(state.fumen.pages);
        pages.insertPage(index);
        const newPages = pages.pages;

        return sequence(state, [
            actions.registerHistoryTask({ task: toInsertPageTask(index, toPrimitivePage(newPages[index])) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages: newPages,
                    maxPage: newPages.length,
                },
            }),
        ]);
    },
    removePage: ({ index }) => (state): NextState => {
        const fumen = state.fumen.pages;
        const primitivePrev = toPrimitivePage(fumen[index]);

        const pages = new Pages(fumen);
        pages.deletePage(index);

        const newPages = pages.pages;
        const nextIndex = index < newPages.length ? index : newPages.length - 1;
        const task = toRemovePageTask(index, primitivePrev);

        return sequence(state, [
            actions.registerHistoryTask({ task }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages: newPages,
                    maxPage: newPages.length,
                    currentIndex: nextIndex,
                },
            }),
            actions.openPage({ index: nextIndex }),
        ]);
    },
    backLoopPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex - 1 + state.fumen.maxPage) % state.fumen.maxPage;
        return pageActions.openPage({ index })(state);
    },
    nextLoopPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex + 1) % state.fumen.maxPage;
        return pageActions.openPage({ index })(state);
    },
    backPage: () => (state): NextState => {
        const backPage = state.fumen.currentIndex - 1;
        if (backPage < 0) return;

        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            pageActions.openPage({ index: backPage }),
        ]);
    },
    nextPageOrNewPage: () => (state): NextState => {
        const nextPage = state.fumen.currentIndex + 1;
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            state.fumen.maxPage <= nextPage ? pageActions.insertPage({ index: nextPage }) : undefined,
            pageActions.openPage({ index: nextPage }),
        ]);
    },
    firstPage: () => (state): NextState => {
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            pageActions.openPage({ index: 0 }),
        ]);
    },
    lastPage: () => (state): NextState => {
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            pageActions.openPage({ index: state.fumen.pages.length - 1 }),
        ]);
    },
    changeToRef: ({ index }: { index: number }) => (state): NextState => {
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            (newState) => {
                const pages = newState.fumen.pages;

                if (index <= 0 || pages.length <= index) {
                    return;
                }

                if (pages[index].field.obj === undefined) {
                    return;
                }

                // 現在のフィールドを取得
                const pagesObj = new Pages(pages);
                const prevField = pagesObj.getField(index - 1, true);
                const currentField = pagesObj.getField(index, false);

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

                return {
                    fumen: {
                        ...newState.fumen,
                        pages,
                    },
                };
            },
            (newState) => {
                return pageActions.openPage({ index: newState.fumen.currentIndex })(newState);
            },
        ]);

    },
    changeToKey: ({ index }: { index: number }) => (state): NextState => {
        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            (newState) => {
                const pages = newState.fumen.pages;

                if (index <= 0 || pages.length <= index) {
                    return;
                }

                const ref = pages[index].field.ref;
                if (ref === undefined) {
                    return;
                }

                // 現在のフィールドを取得
                const pagesObj = new Pages(pages);
                const currentField = pagesObj.getField(index, false);

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

                return {
                    fumen: {
                        ...newState.fumen,
                        pages,
                    },
                };
            },
            (newState) => {
                return pageActions.openPage({ index: newState.fumen.currentIndex })(newState);
            },
        ]);
    },
};

export const parseToBlocks = (field: Field, move?: Move, commands?: Page['commands']) => {
    const parse = (piece: Piece) => ({ piece });

    const playField: Block[] = field.toPlayFieldPieces().map(parse);
    const sentLine: Block[] = field.toSentLintPieces().map(parse);

    if (commands !== undefined) {
        Object.keys(commands.pre)
            .map(key => commands.pre[key])
            .forEach((command: PreCommand) => {
                switch (command.type) {
                case 'block': {
                    const { x, y, piece } = command;
                    playField[x + y * 10] = { piece, highlight: false };
                    return;
                }
                case 'sentBlock': {
                    const { x, y, piece } = command;
                    sentLine[x + y * 10] = { piece, highlight: false };
                    return;
                }
                }
            });
    }

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
