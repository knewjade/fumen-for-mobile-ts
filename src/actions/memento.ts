import { NextState, sequence } from './commons';
import { action, actions, main } from '../actions';
import { memento } from '../memento';
import { HistoryTask } from '../history_task';
import { Page } from '../lib/fumen/fumen';

export interface MementoActions {
    saveToMemento: () => action;
    registerHistoryTask: (data: { task: HistoryTask, mergeKey?: string }) => action;
    undo: () => action;
    redo: () => action;
    loadPagesViaHistory: (data: { pages: Page[], index: number, undoCount: number, redoCount: number }) => action;
    setHistoryCount: (data: { redoCount: number, undoCount: number }) => action;
}

export const mementoActions: Readonly<MementoActions> = {
    saveToMemento: () => (state): NextState => {
        memento.save(state.fumen.pages);
        return undefined;
    },
    registerHistoryTask: ({ task, mergeKey }) => (state): NextState => {
        const undoCount = memento.register(task, mergeKey);
        return mementoActions.setHistoryCount({ undoCount, redoCount: 0 })(state);
    },
    undo: () => (state): NextState => {
        if (0 < state.events.inferences.length) {
            return sequence(state, [
                actions.clearInferencePiece(),
                actions.openPage({ index: state.fumen.currentIndex }),
            ]);
        }

        if (state.history.undoCount <= 0) {
            return;
        }

        return sequence(state, [
            (newState) => {
                (async () => {
                    const result = await memento.undo(newState.fumen.pages);
                    if (result !== undefined) {
                        main.loadPagesViaHistory(result);
                    }
                })();
                return undefined;
            },
        ]);
    },
    redo: () => (state): NextState => {
        if (state.history.redoCount <= 0) {
            return;
        }

        return sequence(state, [
            actions.fixInferencePiece(),
            actions.clearInferencePiece(),
            (newState) => {
                (async () => {
                    const result = await memento.redo(newState.fumen.pages);
                    if (result !== undefined) {
                        main.loadPagesViaHistory(result);
                    }
                })();
                return undefined;
            },
        ]);
    },
    loadPagesViaHistory: ({ pages, index, undoCount, redoCount }) => (state): NextState => {
        return sequence(state, [
            actions.setPages({ pages, open: false }),
            actions.openPage({ index }),
            actions.setHistoryCount({ undoCount, redoCount }),
            actions.saveToMemento(),
        ]);
    },
    setHistoryCount: ({ undoCount, redoCount }) => (): NextState => {
        return {
            history: { undoCount, redoCount },
        };
    },
};
