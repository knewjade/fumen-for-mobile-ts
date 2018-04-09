import { Block, initState, State } from './states';
import { AnimationState, FieldConstants, getBlocks, isMinoPiece, Piece } from './lib/enums';
import { decode, Page } from './lib/fumen/fumen';
import { view } from './view';
import { app } from 'hyperapp';
import { openDescription, openQuiz } from './lib/helper';
import { ViewError } from './lib/errors';

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
    setField: (data: { field: Block[] }) => action;
    setSentLine: (data: { sentLine: Block[] }) => action;
    setHold: (data: { hold: Piece }) => action;
    setNext: (data: { next: Piece[] }) => action;
    openPage: (data: { index: number }) => action;
    backPage: () => action;
    nextPage: () => action;
    showOpenErrorMessage: (data: { message: string }) => action;
    openFumenModal: () => action;
    openSettingsModal: () => action;
    closeFumenModal: () => action;
    closeSettingsModal: () => action;
}

export const actions: Readonly<Actions> = {
    resize: ({ width, height }) => (): NextState => {
        log('action: resize');

        return {
            display: { width, height },
        };
    },
    loadFumen: ({ fumen }) => (): NextState => {
        log('action: loadFumen = ' + fumen);

        router.pauseAnimation();

        if (fumen === undefined) {
            router.showOpenErrorMessage({ message: 'データを入力してください' });
            return undefined;
        }

        (async () => {
            try {
                const pages: Page[] = [];
                await decode(fumen, (page) => {
                    pages[page.index] = page;
                });
                router.setPages({ pages });
                router.closeFumenModal();
                router.clearFumenData();
            } catch (e) {
                if (e instanceof ViewError) {
                    router.showOpenErrorMessage({ message: e.message });
                } else {
                    router.showOpenErrorMessage({ message: 'テト譜を読み込めませんでした' });
                }
            }
        })();

        return undefined;
    },
    setPages: ({ pages }) => (state): NextState => {
        log('action: setPages = ' + pages.length);

        if (pages.length < 1) {
            return undefined;
        }

        setImmediate(() => {
            router.openPage({ index: 0 });
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
        log('action: inputFumenData');

        return {
            fumen: {
                ...state.fumen,
                value,
                errorMessage: undefined,
            },
        };
    },
    clearFumenData: () => (state): NextState => {
        log('action: clearFumenData');

        return actions.inputFumenData({ value: undefined })(state);
    },
    startAnimation: () => (state): NextState => {
        log('action: startAnimation');

        return sequence(state, [
            state.handlers.animation !== undefined ? actions.pauseAnimation() : undefined,
            () => ({
                play: {
                    ...state.play,
                    status: AnimationState.Play,
                },
                handlers: {
                    animation: setInterval(() => {
                        router.nextPage();
                    }, state.play.intervalTime),
                },
            }),
        ]);
    },
    pauseAnimation: () => (state): NextState => {
        log('action: pauseAnimation');

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
        log('action: setComment');

        return {
            comment: {
                isChanged: comment !== undefined && comment !== state.comment.text,
                text: comment !== undefined ? comment : state.comment.text,
            },
        };
    },
    setField: ({ field }) => (): NextState => {
        log('action: setField');

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
        log('action: setSentLine');

        return { sentLine };
    },
    setHold: ({ hold }) => (): NextState => {
        log('action: setHold');

        return { hold };
    },
    setNext: ({ next }) => (): NextState => {
        log('action: setNext');

        return { next };
    },
    openPage: ({ index }) => (state): NextState => {
        log('action: openPage = ' + index);

        const pages = state.fumen.pages;
        const page = pages[index];

        // Comment
        let comment: string;
        let hold = undefined;
        let next = undefined;
        if (page.quiz !== undefined) {
            const quiz = openQuiz(pages, index);

            if (page.comment.text !== undefined) {
                comment = page.comment.text;
            } else {
                comment = quiz.format().toString();
            }

            const operatedQuiz = page.quiz.operation !== undefined ? quiz.operate(page.quiz.operation) : quiz;
            hold = operatedQuiz.getHoldPiece();
            next = operatedQuiz.getNextPieces(5).filter(piece => piece !== Piece.Empty);
        } else {
            comment = openDescription(pages, index);
            next = pages.slice(index + 1)
                .filter(page => page.piece !== undefined && page.piece.lock)
                .map(page => page.piece!.type)
                .slice(0, 5);
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
            actions.setField({ field }),
            actions.setSentLine({ sentLine }),
            hold !== undefined ? actions.setHold({ hold }) : undefined,
            next !== undefined ? actions.setNext({ next }) : undefined,
            () => ({
                fumen: {
                    ...state.fumen,
                    currentIndex: index,
                },
            }),
        ]);
    },
    backPage: () => (state): NextState => {
        log('action: backPage');

        const index = (state.fumen.currentIndex - 1 + state.fumen.maxPage) % state.fumen.maxPage;
        return actions.openPage({ index })(state);
    },
    nextPage: () => (state): NextState => {
        log('action: nextPage');

        const index = (state.fumen.currentIndex + 1) % state.fumen.maxPage;
        return actions.openPage({ index })(state);
    },
    showOpenErrorMessage: ({ message }) => (state): NextState => {
        log('action: showOpenErrorMessage: ' + message);

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
        log('action: openFumenModal');

        return {
            modal: {
                ...state.modal,
                fumen: true,
            },
        };
    },
    openSettingsModal: () => (state): NextState => {
        log('action: openSettingsModal');

        return {
            modal: {
                ...state.modal,
                settings: true,
            },
        };
    },
    closeFumenModal: () => (state): NextState => {
        log('action: closeFumenModal');

        return {
            modal: {
                ...state.modal,
                fumen: false,
            },
        };
    },
    closeSettingsModal: () => (state): NextState => {
        log('action: closeSettingsModal');

        return {
            modal: {
                ...state.modal,
                settings: false,
            },
        };
    },
};

function log(msg: string) {
    // console.log(msg);
}

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

export const router = app(initState, actions, view(), document.body);

window.onresize = () => {
    router.resize({
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    });
};

function extractFumenFromURL() {
    const url = decodeURIComponent(location.search);
    const paramQuery = url.substr(1).split('&').find(value => value.startsWith('d='));
    return paramQuery !== undefined ? paramQuery.substr(2) : 'v115@vhAAgH';
}

router.loadFumen({ fumen: extractFumenFromURL() });
