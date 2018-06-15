import { Block, initState, resources, State } from './states';
import { AnimationState, FieldConstants, Piece, Screens, TouchTypes } from './lib/enums';
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
    insertPage: (data: { index: number }) => action;
    backLoopPage: () => action;
    nextLoopPage: () => action;
    backPage: () => action;
    nextPageOrNewPage: () => action;
    showOpenErrorMessage: (data: { message: string }) => action;
    openFumenModal: () => action;
    openSettingsModal: () => action;
    closeFumenModal: () => action;
    closeSettingsModal: () => action;
    changeMode: (mode: Partial<State['mode']>) => action;
    refresh: () => action;
    changeToReaderMode: () => action;
    changeToDrawerMode: () => action;

    changeToDrawingMode: () => action;
    changeToPieceMode: () => action;

    selectPieceColor: (data: { piece: Piece }) => action;

    ontapCanvas: (e: any) => action;

    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEndField(): action;

    ontouchStartSentLine(data: { index: number }): action;

    ontouchMoveSentLine(data: { index: number }): action;

    ontouchEndSentLine(): action;

    ontouchStartPiece(data: { index: number }): action;
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
                        main.nextLoopPage();
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
        console.log(comment)

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
    insertPage: ({ index }) => (state): NextState => {
        const pages = new Pages(state.fumen.pages);
        pages.insertPage(index);
        const newPages = pages.pages;
        return {
            fumen: {
                ...state.fumen,
                pages: newPages,
                maxPage: newPages.length,
            },
        };
    },
    backLoopPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex - 1 + state.fumen.maxPage) % state.fumen.maxPage;
        return actions.openPage({ index })(state);
    },
    nextLoopPage: () => (state): NextState => {
        const index = (state.fumen.currentIndex + 1) % state.fumen.maxPage;
        return actions.openPage({ index })(state);
    },
    backPage: () => (state): NextState => {
        const backPage = state.fumen.currentIndex - 1;
        if (backPage < 0) return;

        return actions.openPage({ index: backPage })(state);
    },
    nextPageOrNewPage: () => (state): NextState => {
        const nextPage = state.fumen.currentIndex + 1;
        if (state.fumen.maxPage <= nextPage) {
            return sequence(state, [
                actions.insertPage({ index: nextPage }),
                actions.openPage({ index: nextPage }),
            ]);
        }
        return actions.openPage({ index: nextPage })(state);
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
        resources.konva.stage.reload((done) => {
            main.changeMode({ screen: Screens.Reader });
            done();
        });
        return undefined;
    },
    changeToDrawerMode: () => (): NextState => {
        resources.konva.stage.reload((done) => {
            main.changeMode({ screen: Screens.Editor });
            done();
        });
        return undefined;
    },
    changeToDrawingMode: () => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                touch: TouchTypes.Drawing,
            },
        };
    },
    changeToPieceMode: () => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                touch: TouchTypes.Piece,
            },
        };
    },
    changeMode: mode => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                ...mode,
            },
        };
    },
    selectPieceColor: ({ piece }) => (state): NextState => {
        return {
            mode: {
                ...state.mode,
                piece,
            },
        };
    },
    refresh: () => (): NextState => {
        return {};
    },
    ontapCanvas: (e: any) => (state): NextState => {
        const stage = e.currentTarget.getStage();
        const { x } = stage.getPointerPosition();
        const { width } = stage.getSize();
        const touchX = x / width;
        const action = touchX < 0.5 ? actions.backLoopPage() : actions.nextLoopPage();
        return action(state);
    },
    ontouchStartField: ({ index }) => (state): NextState => {
        return startDrawingField(state, index, true);
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        return moveDrawingField(state, index, true);
    },
    ontouchEndField: () => (state): NextState => {
        return endDrawingField(state);
    },
    ontouchStartSentLine: ({ index }) => (state): NextState => {
        return startDrawingField(state, index, false);
    },
    ontouchMoveSentLine: ({ index }) => (state): NextState => {
        return moveDrawingField(state, index, false);
    },
    ontouchEndSentLine: () => (state): NextState => {
        return endDrawingField(state);
    },
    ontouchStartPiece: ({ index }) => (state): NextState => {
        const pages = state.fumen.pages;
        const currentPageIndex = state.fumen.currentIndex;

        // ミノを移動させる
        const page = pages[currentPageIndex];
        if (page.piece !== undefined) {
            page.piece.coordinate = {
                x: index % 10,
                y: Math.floor(index / 10),
            };
        }

        // 影響のありそうなページのキャッシュを削除する
        for (let i = currentPageIndex; i < pages.length; i += 1) {
            pages[i].field.cache = undefined;
        }

        return sequence(state, [
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.openPage({ index: currentPageIndex }),
        ]);
    },
};

function sequence(
    state: Readonly<State>,
    actions: (action | undefined)[],
): Partial<Readonly<State>> {
    let currentState = state;
    let merged: Partial<Readonly<State>> = {};
    for (const action of actions) {
        if (action === undefined) {
            continue;
        }

        const partial = action(currentState);
        merged = {
            ...merged,
            ...partial,
        };
        currentState = {
            ...state,
            ...merged,
        };
    }
    return merged;
}

const startDrawingField = (state: State, index: number, isField: boolean): NextState => {
    const pages = state.fumen.pages;
    const currentPageIndex = state.fumen.currentIndex;

    // 塗りつぶすpieceを決める
    const block = state.field[index];
    const piece = block.piece !== state.mode.piece ? state.mode.piece : Piece.Empty;

    // フィールドの上書き操作を記録する
    {
        const page = pages[currentPageIndex];
        if (page.field.operations === undefined) {
            page.field.operations = {};
        }

        const key = isField ? 'field-' + index : 'sent-' + index;
        page.field.operations[key] = isField
            ? (field: Field) => field.setToPlayField(index, piece)
            : (field: Field) => field.setToSentLine(index, piece);
    }

    // 影響のありそうなページのキャッシュを削除する
    for (let i = currentPageIndex; i < pages.length; i += 1) {
        pages[i].field.cache = undefined;
    }

    return sequence(state, [
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
        actions.openPage({ index: currentPageIndex }),
    ]);
};

const moveDrawingField = (state: State, index: number, isField: boolean): NextState => {
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

        const key = isField ? 'field-' + index : 'sent-' + index;
        page.field.operations[key] = isField
            ? (field: Field) => field.setToPlayField(index, piece)
            : (field: Field) => field.setToSentLine(index, piece);

        page.field.cache = undefined;
    }

    // pieceに変化がないときは、表示を更新しない
    if (state.field[index].piece === piece) {
        return undefined;
    }

    return sequence(state, [
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
        actions.openPage({ index: currentPageIndex }),
    ]);
};

const endDrawingField = (state: State): NextState => {
    return {
        events: {
            ...state.events,
            touch: { piece: undefined },
        },
    };
};

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
