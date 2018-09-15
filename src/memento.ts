import { encode, Page } from './lib/fumen/fumen';
import { HistoryTask } from './history_task';

interface SaverProp {
    saveKey: string;
    pages: Page[];
}

type SaverObj = { save: (key: string) => Promise<void> };

const KEY_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const saver = (() => {
    const generateKey = (length: number = 8): string => {
        const max = KEY_CHARS.length;
        return Array.from({ length }).map(() => KEY_CHARS[Math.floor(Math.random() * max)]).join('');
    };

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
                setImmediate(() => saveCallback(data));

                const last = saverState.last;
                if (last.saverObj !== undefined) {
                    await last.saverObj.save(last.key);
                }
            },
        };
    };

    return (pages: Page[]) => {
        const key = generateKey();
        const saverObj: SaverObj = toSaver({
            pages,
            saveKey: key,
        }, (data: string) => {
            localStorage.setItem('data@1', data);
        });
        saverState.last = { key, saverObj };

        setTimeout(() => {
            saverObj.save(saverState.last.key)
                .catch(error => console.log(error));
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
        register: (task: HistoryTask): number => {
            if (undoQueue.length < 200) {
                undoQueue.push(task);
            } else {
                undoQueue.shift();
                undoQueue.push(task);
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
    };
})();
