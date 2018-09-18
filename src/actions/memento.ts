import { NextState, sequence } from './commons';
import { action, actions, main } from '../actions';
import { memento } from '../memento';
import { HistoryTask } from '../history_task';

export interface MementoActions {
    saveToMemento: () => action;
    registerHistoryTask: (data: { task: HistoryTask }) => action;
    undo: () => action;
    redo: () => action;
    setHistoryCount: (data: { redoCount: number, undoCount: number }) => action;
}

export const mementoActions: Readonly<MementoActions> = {
    saveToMemento: () => (state): NextState => {
        memento.save(state.fumen.pages);
        return undefined;
    },
    registerHistoryTask: ({ task }) => (state): NextState => {
        const undoCount = memento.register(task);
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
                        main.setPages({ pages: result.pages, open: false });
                        main.openPage({ index: result.index });
                        main.setHistoryCount({ undoCount: result.undoCount, redoCount: result.redoCount });
                        memento.save(result.pages);
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
                        main.setPages({ pages: result.pages, open: false });
                        main.openPage({ index: result.index });
                        main.setHistoryCount({ undoCount: result.undoCount, redoCount: result.redoCount });
                        memento.save(result.pages);
                    }
                })();
                return undefined;
            },
        ]);
    },
    setHistoryCount: ({ undoCount, redoCount }) => (): NextState => {
        return {
            history: { undoCount, redoCount },
        };
    },
};
