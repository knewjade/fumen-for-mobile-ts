import { State } from '../states';
import { getBlockPositions, Piece, toPositionIndex } from '../lib/enums';
import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { OperationTask, toPrimitivePage, toSinglePageTask } from '../history_task';
import { fieldEditorActions } from './field_editor';
import { inferPiece } from '../lib/inference';
import { Page } from '../lib/fumen/fumen';
import { memento } from '../memento';
import { HighlightType } from '../state_types';

interface PutPieceActions {
    fixInferencePiece(): action;

    clearInferencePiece(): action;

    resetInferencePiece(): action;

    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEnd(): action;
}

export const putPieceActions: Readonly<PutPieceActions> = {
    fixInferencePiece: () => (state): NextState => {
        const inferencePiece = parseInferenceToPage(state);
        if (inferencePiece === undefined) {
            return undefined;
        }

        // 4つ以上あるとき
        const task = inferencePiece.task;
        return commitInferencePiece(inferencePiece.pages, task)(state);
    },
    clearInferencePiece: () => (state): NextState => {
        return sequence(state, [
            () => ({
                events: {
                    ...state.events,
                    inferences: [],
                },
                cache: {
                    ...state.cache,
                    taskKey: undefined,
                },
            }),
        ]);
    },
    resetInferencePiece: () => (state): NextState => {
        return sequence(state, [
            fieldEditorActions.clearInferencePiece(),
            actions.openPage({ index: state.fumen.currentIndex }),
        ]);
    },
    ontouchStartField: ({ index }) => (state): NextState => {
        if (state.events.piece !== undefined) {
            return undefined;
        }

        const nextState = ontouchStartField(state, index);

        if (nextState !== undefined) {
            return sequence(state, [
                () => nextState,
                actions.ontouchMoveField({ index }),
            ]);
        }

        // inferences以外をタップしたとき and pieceがすでにあるとき
        const nextPageIndex = state.fumen.currentIndex + 1;
        return sequence(state, [
            actions.insertPage({ index: nextPageIndex }),
            actions.openPage({ index: nextPageIndex }),
            newState => ({
                cache: {
                    ...newState.cache,
                    taskKey: memento.lastKey(),
                },
            }),
            newState => ontouchStartField(newState, index),  // 次のページでのタッチ開始処理
            actions.ontouchMoveField({ index }),
        ]);
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        const piece = state.events.piece;
        if (piece === undefined) {
            return undefined;
        }

        const page = state.fumen.pages[state.fumen.currentIndex];
        if (page === undefined) {
            return undefined;
        }

        if (page.piece !== undefined) {
            return undefined;
        }

        // 追加
        const inferences = state.events.inferences;
        if (piece !== Piece.Empty) {
            // 4つ以上あるとき
            if (4 <= inferences.length) {
                return undefined;
            }

            // すでに表示上にブロックがある
            if (state.field[index].piece !== Piece.Empty && state.field[index].highlight !== HighlightType.Lighter) {
                return undefined;
            }

            // まだ存在しないとき
            if (inferences.find(e => e === index) === undefined) {
                const nextInterences = state.events.inferences.concat([index]);
                return sequence(state, [
                    () => ({
                        events: {
                            ...state.events,
                            inferences: nextInterences,
                            updated: true,
                        },
                    }),
                    actions.openPage({ index: state.fumen.currentIndex }),
                ]);
            }
        }

        // 削除
        if (piece === Piece.Empty) {
            return sequence(state, [
                () => ({
                    events: {
                        ...state.events,
                        inferences: state.events.inferences.filter(e => e !== index),
                        updated: true,
                    },
                }),
                actions.openPage({ index: state.fumen.currentIndex }),
            ]);
        }

        return undefined;
    },
    ontouchEnd: () => (state): NextState => {
        if (state.events.piece === undefined) {
            return undefined;
        }

        const inferencePiece = parseInferenceToPage(state);
        return sequence(state, [
            inferencePiece !== undefined
                ? commitInferencePiece(inferencePiece.pages, inferencePiece.task, state.cache.taskKey)
                : undefined,
            endDrawingField,
        ]);
    },
};

const commitInferencePiece = (pages: Page[], task: OperationTask, mergeKey?: string) => (state: State): NextState => {
    return sequence(state, [
        newState => ({
            fumen: {
                ...newState.fumen,
                pages,
            },
            cache: {
                ...newState.cache,
                taskKey: undefined,
            },
        }),
        fieldEditorActions.resetInferencePiece(),
        actions.saveToMemento(),
        actions.registerHistoryTask({ task, mergeKey }),
    ]);
};

const parseInferenceToPage = (state: State): { pages: Page[], task: OperationTask } | undefined => {
    const inferences = state.events.inferences;
    if (inferences.length < 4) {
        return undefined;
    }

    // InferencePieceが揃っているとき
    let piece;
    try {
        piece = inferPiece(inferences);
    } catch (e) {
        return undefined;
    }

    const currentPageIndex = state.fumen.currentIndex;
    const pages = state.fumen.pages;
    const page = pages[currentPageIndex];
    const prevPage = toPrimitivePage(page);

    page.piece = {
        type: piece.piece,
        rotation: piece.rotate,
        coordinate: piece.coordinate,
    };

    return {
        pages,
        task: toSinglePageTask(currentPageIndex, prevPage, page),
    };
};

const ontouchStartField = (state: State, index: number): NextState => {
    const pages = state.fumen.pages;
    const page = pages[state.fumen.currentIndex];
    const piece = page.piece;

    let inferences;
    if (piece === undefined) {
        inferences = state.events.inferences;
    } else {
        const blocks = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
        inferences = blocks.map(toPositionIndex);
    }

    const isTappedOnInferences = inferences.find(e => e === index) !== undefined;
    if (piece !== undefined && !isTappedOnInferences) {
        return undefined;
    }

    // pieceがまだない or inferencesの上をタップしたとき
    page.piece = undefined;

    return {
        fumen: {
            ...state.fumen,
            pages,
        },
        events: {
            ...state.events,
            inferences,
            piece: isTappedOnInferences ? Piece.Empty : Piece.Gray,
            updated: false,
        },
    };
};

const endDrawingField = (state: State): NextState => {
    return {
        events: {
            ...state.events,
            piece: undefined,
            prevPage: undefined,
            updated: false,
        },
        cache: {
            ...state.cache,
        },
    };
};
