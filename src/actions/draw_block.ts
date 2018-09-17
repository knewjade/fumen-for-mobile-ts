import { State } from '../states';
import { Piece } from '../lib/enums';
import { action, actions } from '../actions';
import { NextState, sequence } from './commons';
import { toPrimitivePage, toSinglePageTask } from '../history_task';
import { fieldEditorActions } from './field_editor';
import { inferPiece } from '../lib/inference';

interface DrawBlockActions {
    fixInferencePiece(): action;

    clearInferencePiece(): action;

    resetInferencePiece(): action;

    ontouchStartField(data: { index: number }): action;

    ontouchMoveField(data: { index: number }): action;

    ontouchEnd(): action;

    ontouchStartSentLine(data: { index: number }): action;

    ontouchMoveSentLine(data: { index: number }): action;
}

export const drawBlockActions: Readonly<DrawBlockActions> = {
    fixInferencePiece: () => (state): NextState => {
        const inferences = state.events.inferences;
        if (inferences.length < 4) {
            return undefined;
        }

        // InferencePieceが揃っているとき
        let piece;
        try {
            piece = inferPiece(inferences).piece;
        } catch (e) {
            return undefined;
        }

        const currentPageIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const page = pages[currentPageIndex];
        const prevPage = toPrimitivePage(page);

        if (!page.commands) {
            page.commands = {
                pre: {},
            };
        }

        // Blockを追加
        for (const index of inferences) {
            const x = index % 10;
            const y = Math.floor(index / 10);
            const type = 'block';
            const key = `${type}-${index}`;

            // フィールドのみ
            if (state.cache.currentInitField.getAtIndex(index) !== piece) {
                // 操作の結果、最初のフィールドの状態から変化するとき
                page.commands.pre[key] = { x, y, piece, type };
            } else {
                // 操作の結果、最初のフィールドの状態に戻るとき
                delete page.commands.pre[key];
            }
        }

        // 4つ以上あるとき
        return sequence(state, [
            fieldEditorActions.resetInferencePiece(),
            actions.saveToMemento(),
            actions.registerHistoryTask({ task: toSinglePageTask(currentPageIndex, prevPage, page) }),
        ]);
    },
    clearInferencePiece: () => (state): NextState => {
        return sequence(state, [
            () => ({
                events: {
                    ...state.events,
                    inferences: [],
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
        if (state.mode.piece !== undefined) {
            return sequence(state, [
                actions.fixInferencePiece(),
                newState => startDrawingField(newState, index, true),
                actions.ontouchMoveField({ index }),
            ]);
        }

        const inferences = state.events.inferences;

        return sequence(state, [
            inferences.find(e => e === index) === undefined ? actions.fixInferencePiece() : undefined,
            newState => ({
                events: {
                    ...newState.events,
                    touch: {
                        piece: newState.events.inferences.find(e => e === index) === undefined
                            ? Piece.Gray
                            : Piece.Empty,
                    },
                    updated: false,
                },
            }),
            actions.ontouchMoveField({ index }),
        ]);
    },
    ontouchMoveField: ({ index }) => (state): NextState => {
        if (state.mode.piece !== undefined) {
            return moveDrawingField(state, index, true);
        }

        const piece = state.events.touch.piece;
        if (piece === undefined) {
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
            if (state.field[index].piece !== Piece.Empty) {
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
        const currentIndex = state.fumen.currentIndex;
        const page = state.fumen.pages[currentIndex];
        const updated = state.events.updated;
        return sequence(state, [
            updated && state.events.prevPage !== undefined ? actions.saveToMemento() : undefined,
            updated && state.events.prevPage !== undefined
                ? actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, state.events.prevPage, page) })
                : undefined,
            endDrawingField,
        ]);
    },
    ontouchStartSentLine: ({ index }) => (state): NextState => {
        if (state.mode.piece !== undefined) {
            return sequence(state, [
                () => startDrawingField(state, index, false),
                actions.ontouchMoveSentLine({ index }),
            ]);
        }

        return undefined;
    },
    ontouchMoveSentLine: ({ index }) => (state): NextState => {
        if (state.mode.piece !== undefined) {
            return moveDrawingField(state, index, false);
        }

        return undefined;
    },
};

const startDrawingField = (state: State, index: number, isField: boolean): NextState => {
    const currentPageIndex = state.fumen.currentIndex;

    // 塗りつぶすpieceを決める
    const block = isField ? state.field[index] : state.sentLine[index];
    const piece = block.piece !== state.mode.piece ? state.mode.piece : Piece.Empty;
    if (piece === undefined) {
        return undefined;
    }

    return sequence(state, [
        () => ({
            events: {
                ...state.events,
                touch: { piece },
                prevPage: toPrimitivePage(state.fumen.pages[state.fumen.currentIndex]),
                updated: false,
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

    // pieceに変化がないときは、表示を更新しない
    const block = isField ? state.field[index] : state.sentLine[index];
    if (block.piece === piece) {
        return undefined;
    }

    const page = pages[currentPageIndex];
    if (!page.commands) {
        page.commands = {
            pre: {},
        };
    }

    // Blockを追加
    {
        const x = index % 10;
        const y = Math.floor(index / 10);
        const type = isField ? 'block' : 'sentBlock';
        const key = `${type}-${index}`;

        const initPiece = state.cache.currentInitField.getAtIndex(isField ? index : -index);
        if (initPiece !== piece) {
            // 操作の結果、最初のフィールドの状態から変化するとき
            page.commands.pre[key] = { x, y, piece, type };
        } else {
            // 操作の結果、最初のフィールドの状態に戻るとき
            delete page.commands.pre[key];
        }
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
                updated: true,
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
            prevPage: undefined,
            updated: false,
        },
    };
};
