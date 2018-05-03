import { Block, initState, State } from './states';
import { AnimationState, FieldConstants, getBlocks, isMinoPiece, Piece } from './lib/enums';
import { decode, Page } from './lib/fumen/fumen';
import { view } from './view';
import { app } from 'hyperapp';
import { openDescription, openQuiz } from './lib/helper';
import { ViewError } from './lib/errors';
import { withLogger } from '@hyperapp/logger';

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
        const pages = state.fumen.pages;
        const page = pages[index];

        // Comment
        let comment: string;
        let hold = undefined;
        let next = undefined;

        let quiz = undefined;
        if (page.quiz !== undefined) {
            const currentQuiz = openQuiz(pages, index);

            if (page.comment.text !== undefined) {
                comment = page.comment.text;
            } else {
                comment = currentQuiz.format().toString();
            }

            if (currentQuiz.canOperate()) {
                quiz = currentQuiz;
            }
        } else {
            comment = openDescription(pages, index);
        }

        if (quiz !== undefined) {
            const operatedQuiz = page.quiz !== undefined && page.quiz.operation !== undefined ?
                quiz.operate(page.quiz.operation) : quiz;

            hold = operatedQuiz.getHoldPiece();
            next = operatedQuiz.getNextPieces(5).filter(piece => piece !== Piece.Empty);
        } else {
            const pieces: Piece[] = [];
            let currentPiece = page.piece !== undefined ? page.piece.type : Piece.Empty;
            for (const nextPage of pages.slice(index)) {
                // ミノが変わったときは記録する
                if (nextPage.piece !== undefined && currentPiece !== nextPage.piece.type) {
                    const pieceType = nextPage.piece.type;
                    if (isMinoPiece(pieceType)) {
                        pieces.push(pieceType);
                    }

                    currentPiece = pieceType;
                }

                // 必要な数が溜まったら終了する
                if (5 <= pieces.length) {
                    break;
                }

                // ミノを接着したときは現在の使用ミノをEmptyに置き換える
                if (nextPage.piece === undefined || nextPage.flags.lock) {
                    currentPiece = Piece.Empty;
                }
            }

            next = pieces;
        }

        // Field
        const field: Block[] = page.field.toArray().map((value) => {
            return {
                piece: value,
            };
        });
        const move = page.piece;
        if (move !== undefined && isMinoPiece(move.type)) {
            const coordinate = move.coordinate;
            const blocks = getBlocks(move.type, move.rotation);
            for (const block of blocks) {
                const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
                field[x + y * 10] = {
                    piece: move.type,
                    highlight: true,
                };
            }
        }

        // SentLine
        const sentLine: Block[] = page.sentLine.toArray().map((value) => {
            return {
                piece: value,
            };
        });

        return sequence(state, [
            state.play.status === AnimationState.Play ? actions.startAnimation() : undefined,
            actions.setComment({ comment }),
            actions.setField({ field, filledHighlight: page.flags.lock }),
            actions.setSentLine({ sentLine }),
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
    refresh: () => (): NextState => {
        return {};
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
