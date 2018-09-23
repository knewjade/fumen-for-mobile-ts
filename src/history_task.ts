import { decode, Move, Page, PreCommand } from './lib/fumen/fumen';
import { Piece } from './lib/enums';
import { Field, PlayField } from './lib/fumen/field';
import { Pages } from './lib/pages';
import { generateKey } from './memento';

export type HistoryTask = OperationTask | FixedTask;

interface TaskResult {
    pages: Page[];
    index: number;
}

export interface OperationTask {
    replay: (pages: Page[]) => TaskResult;
    revert: (pages: Page[]) => TaskResult;
    fixed: false;
    key: string;
}

export function isOperationTask(task: HistoryTask): task is OperationTask {
    return !task.fixed;
}

interface FixedTask {
    replay: () => Promise<TaskResult>;
    revert: () => Promise<TaskResult>;
    fixed: true;
    key: string;
}

export const toFumenTask = (primitivePrev: PrimitivePage[], fumen: string, prevIndex: number): FixedTask => {
    return {
        replay: async () => {
            return { pages: await decode(fumen), index: 0 };
        },
        revert: async () => {
            return { pages: primitivePrev.map(toPage), index: prevIndex };
        },
        fixed: true,
        key: generateKey(),
    };
};

export const toSinglePageTask = (index: number, primitivePrev: PrimitivePage, next: Page): OperationTask => {
    const primitiveNext = toPrimitivePage(next);
    return {
        replay: (pages: Page[]) => {
            pages[index] = toPage(primitiveNext);
            return { pages, index };
        },
        revert: (pages: Page[]) => {
            pages[index] = toPage(primitivePrev);
            return { pages, index };
        },
        fixed: false,
        key: generateKey(),
    };
};

export const toRemovePageTask = (
    removeFromIndex: number,
    removeToIndex: number,
    primitivePrevs: PrimitivePage[],
    indexAfterReverting: number,
): OperationTask => {
    return {
        replay: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.deletePage(removeFromIndex, removeToIndex);
            const newPages = pagesObj.pages;
            return {
                pages: newPages,
                index: removeFromIndex < newPages.length ? removeFromIndex : newPages.length - 1,
            };
        },
        revert: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.insertPage(removeFromIndex, primitivePrevs.map(toPage));
            return { pages: pagesObj.pages, index: indexAfterReverting };
        },
        fixed: false,
        key: generateKey(),
    };
};

export const toInsertPageTask = (
    insertIndex: number,
    primitiveNexts: PrimitivePage[],
    indexAfterReverting: number,
): OperationTask => {
    return {
        replay: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.insertPage(insertIndex, primitiveNexts.map(toPage));
            return { pages: pagesObj.pages, index: insertIndex };
        },
        revert: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.deletePage(insertIndex, insertIndex + primitiveNexts.length);
            return { pages: pagesObj.pages, index: indexAfterReverting };
        },
        fixed: false,
        key: generateKey(),
    };
};

export const toKeyPageTask = (index: number): OperationTask => {
    return {
        replay: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.toKeyPage(index);
            return { index, pages: pagesObj.pages };
        },
        revert: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.toRefPage(index);
            return { index, pages: pagesObj.pages };
        },
        fixed: false,
        key: generateKey(),
    };
};

export const toRefPageTask = (index: number): OperationTask => {
    return {
        replay: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.toRefPage(index);
            return { index, pages: pagesObj.pages };
        },
        revert: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.toKeyPage(index);
            return { index, pages: pagesObj.pages };
        },
        fixed: false,
        key: generateKey(),
    };
};

export const toFreezeCommentTask = (index: number): OperationTask => {
    return {
        replay: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.freezeComment(index);
            return { index, pages: pagesObj.pages };
        },
        revert: (pages: Page[]) => {
            const pagesObj = new Pages(pages);
            pagesObj.unfreezeComment(index);
            return { index, pages: pagesObj.pages };
        },
        fixed: false,
        key: generateKey(),
    };
};

export const toPageTaskStack = (tasks: OperationTask[], pageIndexAfterReverting?: number): OperationTask => {
    return {
        replay: (pages: Page[]) => {
            let result: TaskResult = { pages, index: 0 };
            for (const task of tasks) {
                result = task.replay(result.pages);
            }
            return result;
        },
        revert: (pages: Page[]) => {
            let result: TaskResult = { pages, index: 0 };
            for (const task of tasks.concat().reverse()) {
                result = task.revert(result.pages);
            }
            return {
                pages: result.pages,
                index: pageIndexAfterReverting !== undefined ? pageIndexAfterReverting : result.index,
            };
        },
        fixed: false,
        key: generateKey(),
    };
};

export const toDecoratorOperationTask = (first: OperationTask, second: OperationTask): OperationTask => {
    return {
        replay: (pages: Page[]) => {
            const result1: TaskResult = first.replay(pages);
            return second.replay(result1.pages);
        },
        revert: (pages: Page[]) => {
            const result1 = second.revert(pages);
            return first.revert(result1.pages);
        },
        fixed: false,
        key: first.key,
    };
};

export interface PrimitivePage {
    index: number;
    field: {
        obj?: {
            play: Piece[];
            sentLine: Piece[];
        };
        ref?: number;
    };
    piece?: Move;
    comment: {
        text?: string;
        ref?: number;
    };
    commands?: {
        pre: {
            [key in string]: PreCommand;
        };
    };
    flags: {
        lock: boolean;
        mirror: boolean;
        colorize: boolean;
        rise: boolean;
        quiz: boolean;
    };
}

export const toPrimitivePage = (page: Page): PrimitivePage => {
    const field = page.field.obj;
    const commands = page.commands;
    return {
        index: page.index,
        field: {
            obj: field !== undefined ? {
                play: field.toPlayFieldPieces(),
                sentLine: field.toSentLintPieces(),
            } : undefined,
            ref: page.field.ref,
        },
        piece: page.piece !== undefined ? {
            type: page.piece.type,
            coordinate: {
                ...page.piece.coordinate,
            },
            rotation: page.piece.rotation,
        } : undefined,
        comment: {
            text: page.comment.text,
            ref: page.comment.ref,
        },
        commands: commands !== undefined ? {
            pre: {
                ...commands.pre,
            },
        } : undefined,
        flags: {
            lock: page.flags.lock,
            mirror: page.flags.mirror,
            colorize: page.flags.colorize,
            rise: page.flags.rise,
            quiz: page.flags.quiz,
        },
    };
};

export const toPage = (page: PrimitivePage): Page => {
    const field = page.field.obj;
    const commands = page.commands;
    return {
        index: page.index,
        field: {
            obj: field !== undefined ? new Field({
                field: new PlayField({ pieces: field.play }),
                sentLine: new PlayField({ pieces: field.sentLine }),
            }) : undefined,
            ref: page.field.ref,
        },
        piece: page.piece,
        comment: {
            text: page.comment.text,
            ref: page.comment.ref,
        },
        commands: commands !== undefined ? {
            pre: {
                ...commands.pre,
            },
        } : undefined,
        flags: {
            lock: page.flags.lock,
            mirror: page.flags.mirror,
            colorize: page.flags.colorize,
            rise: page.flags.rise,
            quiz: page.flags.quiz,
        },
    };
};
