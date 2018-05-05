import { Block, initState, State } from './states';
import { AnimationState, FieldConstants, Piece, Screens } from './lib/enums';
import { decode, Page } from './lib/fumen/fumen';
import { view } from './view';
import { app } from 'hyperapp';
import { ViewError } from './lib/errors';
import { withLogger } from '@hyperapp/logger';
import { Pages, parseToBlocks, QuizCommentResult, TextCommentResult } from './actions/fumen';
import { Field } from './lib/fumen/field';

type NextState = Partial<State> | undefined;
export type action = (state: Readonly<State>) => NextState;

export interface Actions {
    resize: (data: { width: number, height: number }) => action;
    loadFumen: (args: { fumen: string | undefined }) => action;
    setPages: (args: { pages: Page[] }) => action;
    inputFumenData: (args: { value?: string }) => action;
    clearFumenData: () => action;
    startAnimation: () => action;
    pauseAnimation: () => action;
    setComment: (data: { comment: string }) => action;
    setField: (data: { field: Block[], filledHighlight: boolean }) => action;
    setSentLine: (data: { sentLine: Block[] }) => action;
    setHold: (data: { hold?: Piece }) => action;
    setNext: (data: { next?: Piece[] }) => action;
    openPage: (data: { index: number }) => action;
    backPage: () => action;
    nextPage: () => action;
    showOpenErrorMessage: (data: { message: string }) => action;
    openFumenModal: () => action;
    openSettingsModal: () => action;
    closeFumenModal: () => action;
    closeSettingsModal: () => action;
    refresh: () => action;
    changeToReaderMode: () => void;
    changeToDrawerMode: () => void;

    ontapCanvas: (e: any) => action;

    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEndField(): action;

    ontouchStartSentLine(data: { index: number }): action;

    ontouchMoveSentLine(data: { index: number }): action;

    ontouchEndSentLine(): action;
}

export const actions: Readonly<Actions> = {
    resize: ({ width, height }) => (): NextState => {
        return {
            display: { width, height },
        };
    },
    loadFumen: ({ fumen }) => (): NextState => {
        main.pauseAnimation();

        if (fumen === undefined) {
            main.showOpenErrorMessage({ message: 'データを入力してください' });
            return undefined;
        }

        (async () => {
            try {
                const pages: Page[] = await decode(fumen);

                main.setPages({ pages });
                main.closeFumenModal();
                main.clearFumenData();
            } catch (e) {
                console.error(e);
                if (e instanceof ViewError) {
                    main.showOpenErrorMessage({ message: e.message });
                } else {
                    main.showOpenErrorMessage({ message: 'テト譜を読み込めませんでした' });
                }
            }
        })();

        return undefined;
    },
    setPages: ({ pages }) => (state): NextState => {
        if (pages.length < 1) {
            return undefined;
        }

        setImmediate(() => {
            main.openPage({ index: 0 });
        });

        return {
            fumen: {
                ...state.fumen,
                pages,
                maxPage: pages.length,
            },
        };
    },
    inputFumenData: ({ value }) => (state): NextState => {
        return {
            fumen: {
                ...state.fumen,
                value,
                errorMessage: undefined,
            },
        };
    },
    clearFumenData: () => (state): NextState => {
        return actions.inputFumenData({ value: undefined })(state);
    },
    startAnimation: () => (state): NextState => {
        return sequence(state, [
            state.handlers.animation !== undefined ? actions.pauseAnimation() : undefined,
            () => ({
                play: {
                    ...state.play,
                    status: AnimationState.Play,
                },
                handlers: {
                    animation: setInterval(() => {
                        main.nextPage();
                    }, state.play.intervalTime),
                },
            }),
        ]);
    },
    pauseAnimation: () => (state): NextState => {
        if (state.handlers.animation !== undefined) {
            clearInterval(state.handlers.animation);
        }

        return {
            play: {
                ...state.play,
                status: AnimationState.Pause,
            },
            handlers: {
                animation: undefined,
            },
        };
    },
    setComment: ({ comment }) => (state): NextState => {
        return {
            comment: {
                isChanged: comment !== undefined && comment !== state.comment.text,
                text: comment !== undefined ? comment : state.comment.text,
            },
        };
    },
    setField: ({ field, filledHighlight }) => (): NextState => {
        if (!filledHighlight) {
            return { field };
        }

        const drawnField: Block[] = [];
        for (let y = 0; y < FieldConstants.Height + FieldConstants.SentLine; y += 1) {
            const [start, end] = [y * FieldConstants.Width, (y + 1) * FieldConstants.Width];
            const line = field.slice(start, end);
            const filled = line.every(block => block.piece !== Piece.Empty);
            if (filled) {
                for (let index = start; index < end; index += 1) {
                    drawnField[index] = {
                        ...field[index],
                        highlight: true,
                    };
                }
            } else {
                for (let index = start; index < end; index += 1) {
                    drawnField[index] = field[index];
                }
            }
        }

        return { field: drawnField };
    },
    setSentLine: ({ sentLine }) => (): NextState => {
        return { sentLine };
    },
    setHold: ({ hold }) => (): NextState => {
        return { hold };
    },
    setNext: ({ next }) => (): NextState => {
        return { nexts: next };
    },
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
        const blocks = parseToBlocks(field, page.piece);

        return sequence(state, [
            state.play.status === AnimationState.Play ? actions.startAnimation() : undefined,
            actions.setComment({ comment: text }),
            actions.setField({ field: blocks.playField, filledHighlight: page.flags.lock }),
            actions.setSentLine({ sentLine: blocks.sentLine }),
            actions.setHold({ hold }),
            actions.setNext({ next }),
            () => ({
                fumen: {
                    ...state.fumen,
                    currentIndex: index,
                },
            }),
        ]);
    },
    backPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex - 1 + state.fumen.maxPage) % state.fumen.maxPage;
        return actions.openPage({ index })(state);
    },
    nextPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex + 1) % state.fumen.maxPage;
        return actions.openPage({ index })(state);
    },
    showOpenErrorMessage: ({ message }) => (state): NextState => {
        return sequence(state, [
            actions.openFumenModal(),
            () => ({
                fumen: {
                    ...state.fumen,
                    errorMessage: message,
                },
            }),
        ]);
    },
    openFumenModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                fumen: true,
            },
        };
    },
    openSettingsModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                settings: true,
            },
        };
    },
    closeFumenModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                fumen: false,
            },
        };
    },
    closeSettingsModal: () => (state): NextState => {
        return {
            modal: {
                ...state.modal,
                settings: false,
            },
        };
    },
    changeToReaderMode: () => (): NextState => {
        return { screen: Screens.Reader };
    },
    changeToDrawerMode: () => (): NextState => {
        return { screen: Screens.Drawer };
    },
    refresh: () => (): NextState => {
        return {};
    },
    ontapCanvas: (e: any) => (state): NextState => {
        const stage = e.currentTarget.getStage();
        const { x } = stage.getPointerPosition();
        const { width } = stage.getSize();
        const touchX = x / width;
        const action = touchX < 0.5 ? actions.backPage() : actions.nextPage();
        return action(state);
    },
    ontouchStartField: ({ index }) => (state): NextState => {
        const pages = state.fumen.pages;
        const currentPageIndex = state.fumen.currentIndex;

        // 塗りつぶすpieceを決める
        const block = state.field[index];
        const piece = block.piece === Piece.Empty ? Piece.Gray : Piece.Empty;

        // フィールドの上書き操作を記録する
        {
            const page = pages[currentPageIndex];
            if (page.field.operations === undefined) {
                page.field.operations = {};
            }
            page.field.operations[index] = (field: Field) => field.setToPlayField(index, piece);
            page.field.cache = undefined;
        }

        return sequence(state, [
            actions.openPage({ index: currentPageIndex }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
                events: {
                    ...state.events,
                    touch: { piece },
                },
            }),
        ]);
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        const pages = state.fumen.pages;
        const currentPageIndex = state.fumen.currentIndex;

        // 塗りつぶすpieceを決める
        const piece = state.events.touch.piece;
        if (piece === undefined) {
            return undefined;
        }

        // フィールドの上書き操作を記録する
        {
            const page = pages[currentPageIndex];
            if (page.field.operations === undefined) {
                page.field.operations = {};
            }
            page.field.operations[index] = (field: Field) => field.setToPlayField(index, piece);
            page.field.cache = undefined;
        }

        // pieceに変化がないときは、表示を更新しない
        if (state.field[index].piece === piece) {
            return undefined;
        }

        return sequence(state, [
            actions.openPage({ index: currentPageIndex }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
                events: {
                    ...state.events,
                    touch: { piece },
                },
            }),
        ]);
    },
    ontouchEndField: () => (state): NextState => {
        const currentPageIndex = state.fumen.currentIndex;

        // 影響のありそうなページのキャッシュを削除する
        const pages = state.fumen.pages;
        for (let i = currentPageIndex; i < pages.length; i += 1) {
            pages[i].field.cache = undefined;
        }

        return {
            fumen: {
                ...state.fumen,
                pages,
            },
            events: {
                ...state.events,
                touch: { piece: undefined },
            },
        };
    },
    ontouchStartSentLine: ({ index }) => ({ sentLine }): NextState => {
        return undefined;
    },
    ontouchMoveSentLine: ({ index }) => ({ sentLine }): NextState => {
        return undefined;
    },
    ontouchEndSentLine: () => (): NextState => {
        return undefined;
    },
};

function sequence(
    state: Readonly<State>,
    actions: (action | undefined)[],
): Partial<Readonly<State>> {
    let merged: Partial<Readonly<State>> = {};
    for (const action of actions) {
        if (action === undefined) {
            continue;
        }

        const partial = action(state);
        merged = {
            ...merged,
            ...partial,
        };
    }
    return merged;
}

// Mounting
const mount = (isDebug: boolean = false): Actions => {
    if (isDebug) {
        return withLogger(app)(initState, actions, view, document.body);
    }
    return app<State, Actions>(initState, actions, view, document.body);
};
const main = mount(JSON.parse('###DEBUG###'));

window.onresize = () => {
    main.resize({
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    });
};

function extractFumenFromURL() {
    const url = decodeURIComponent(location.search);
    const paramQuery = url.substr(1).split('&').find(value => value.startsWith('d='));
    return paramQuery !== undefined ? paramQuery.substr(2) : 'v115@vhAAgH';
}

main.loadFumen({ fumen: extractFumenFromURL() });
