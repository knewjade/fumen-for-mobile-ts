import { HistoryTask, isOperationTask, toDecoratorOperationTask } from './history_task';
import { generateKey } from './lib/random';
import { Page } from './lib/fumen/types';
import { encode } from './lib/fumen/fumen';
import lodash from 'lodash';

interface SaverProp {
    saveKey: string;
    pages: Page[];
}

type SaverObj = { save: (key: string) => Promise<void> };

const saverState = {
    isWorking: false,
    last: {
        key: generateKey(),
        saverObj: undefined as (SaverObj | undefined),
    },
};

const sequentialEncode = async (pages: Page[]): Promise<string> => {
    saverState.isWorking = true;
    const data = await encode(pages, true);
    saverState.isWorking = false;
    return `v115@${data}`;
};

const toSaver = ({ saveKey, pages }: SaverProp, saveCallback: (data: string) => void) => {
    let isSaved = false;
    return {
        save: async (key: string) => {
            if (isSaved || key !== saveKey) {
                return;
            }
            isSaved = true;

            const data = await sequentialEncode(pages);
            setTimeout(() => saveCallback(data), 0);

            const last = saverState.last;
            if (last.saverObj !== undefined) {
                await last.saverObj.save(last.key);
            }
        },
    };
};

const saver = (() => {
    return (pages: Page[]) => {
        const key = generateKey();
        const saverObj: SaverObj = toSaver({
            pages,
            saveKey: key,
        }, (data: string) => {
            localStorageWrapper.saveFumen(data);
        });
        saverState.last = { key, saverObj };

        setTimeout(() => {
            saverObj.save(saverState.last.key)
                .catch(error => console.error(error));
        }, saverState.isWorking ? 3000 : 0);
    };
})();

interface Result {
    pages: Page[];
    index: number;
    undoCount: number;
    redoCount: number;
}

export const memento = (() => {
    const undoQueue: HistoryTask[] = [];
    let redoQueue: HistoryTask[] = [];

    return {
        // 自動保存
        save: (pages: Page[]) => {
            saver(pages);
        },
        // タスクの追加
        register: (task: HistoryTask, mergeKey?: string): number => {
            const lastTask = undoQueue[undoQueue.length - 1];
            if (lastTask !== undefined && lastTask.key === mergeKey
                && isOperationTask(lastTask) && isOperationTask(task)
            ) {
                // keyが同じときはくっつける
                // 現時点では OperationTask 同士のみ対応
                undoQueue[undoQueue.length - 1] = toDecoratorOperationTask(lastTask, task);
            } else {
                // そのまま追加する
                if (undoQueue.length < 200) {
                    undoQueue.push(task);
                } else {
                    undoQueue.shift();
                    undoQueue.push(task);
                }
            }

            redoQueue = [];
            return undoQueue.length - 1;
        },
        undo: async (pages: Page[]): Promise<Result | undefined> => {
            const lastTask = undoQueue.pop();
            if (lastTask === undefined) {
                return undefined;
            }

            redoQueue.push(lastTask);

            const result = lastTask.fixed ? (await lastTask.revert()) : lastTask.revert(pages);
            return {
                pages: result.pages,
                index: result.index,
                undoCount: undoQueue.length - 1,
                redoCount: redoQueue.length,
            };
        },
        redo: async (pages: Page[]): Promise<Result | undefined> => {
            const lastTask = redoQueue.pop();
            if (lastTask === undefined) {
                return undefined;
            }

            undoQueue.push(lastTask);

            const result = lastTask.fixed ? (await lastTask.replay()) : lastTask.replay(pages);
            return {
                pages: result.pages,
                index: result.index,
                undoCount: undoQueue.length - 1,
                redoCount: redoQueue.length,
            };
        },
        lastKey: (): (string | undefined) => {
            const lastTask = undoQueue[undoQueue.length - 1];
            return lastTask !== undefined ? lastTask.key : undefined;
        },
    };
})();

interface UserSettings {
    ghostVisible: boolean;
    loop: boolean;
}

const safer = {
    fumenV115: (value: any): string | undefined => {
        const safeString = safer.string(value);
        const re = /^v115@[a-zA-Z0-9+/?]+$/;
        return safeString && re.test(safeString) ? safeString : undefined;
    },
    string: (value: any): string | undefined => {
        return lodash.isString(value) ? value : undefined;
    },
    boolean: (value: any): boolean | undefined => {
        return lodash.isBoolean(value) ? value : undefined;
    },
};

export const localStorageWrapper = {
    saveFumen: (data: string) => {
        localStorage.setItem('data@1', data);
    },
    loadFumen: (): string | undefined => {
        const data = localStorage.getItem('data@1');
        return safer.fumenV115(data);
    },
    saveUserSettings: (data: UserSettings) => {
        localStorage.setItem('user-settings@1', JSON.stringify(data));
    },
    loadUserSettings: (): Partial<UserSettings> => {
        const data = localStorage.getItem('user-settings@1');
        if (!data) {
            return {};
        }
        const obj = JSON.parse(data);

        return {
            ghostVisible: safer.boolean(obj.ghostVisible),
            loop: safer.boolean(obj.loop),
        };
    },
};
