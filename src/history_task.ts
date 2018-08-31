import { decode, Move, Page, PreCommand } from './lib/fumen/fumen';
import { Operation, Piece } from './lib/enums';
import { Field, PlayField } from './lib/fumen/field';

export type HistoryTask = OperationTask | FixedTask;

interface TaskResult {
    pages: Page[];
    index: number;
}

interface OperationTask {
    reply: (pages: Page[]) => Promise<TaskResult>;
    revert: (pages: Page[]) => Promise<TaskResult>;
    fixed: false;
}

interface FixedTask {
    reply: () => Promise<TaskResult>;
    revert: () => Promise<TaskResult>;
    fixed: true;
}

export const toFumenTask = (primitivePrev: PrimitivePage[], fumen: string, prevIndex: number): FixedTask => {
    return {
        reply: async () => {
            return { pages: await decode(fumen), index: 0 };
        },
        revert: async () => {
            return { pages: primitivePrev.map(toPage), index: prevIndex };
        },
        fixed: true,
    };
};

export const toSinglePageTask = (index: number, primitivePrev: PrimitivePage, next: Page): OperationTask => {
    const primitiveNext = toPrimitivePage(next);
    return {
        reply: async (pages: Page[]) => {
            pages[index] = toPage(primitiveNext);
            return { pages, index };
        },
        revert: async (pages: Page[]) => {
            pages[index] = toPage(primitivePrev);
            return { pages, index };
        },
        fixed: false,
    };
};

export const toRemovePageTask = (removeIndex: number, primitivePrev: PrimitivePage): OperationTask => {
    return {
        reply: async (pages: Page[]) => {
            const newPages = pages.slice(0, removeIndex).concat(pages.slice(removeIndex + 1));
            return { pages: newPages, index: removeIndex < newPages.length ? removeIndex : newPages.length - 1 };
        },
        revert: async (pages: Page[]) => {
            const newPages = pages.slice(0, removeIndex)
                .concat([toPage(primitivePrev)])
                .concat(pages.slice(removeIndex));
            return { pages: newPages, index: removeIndex };
        },
        fixed: false,
    };
};

export const toInsertPageTask = (insertIndex: number, primitiveNext: PrimitivePage): OperationTask => {
    return {
        reply: async (pages: Page[]) => {
            const newPages = pages.slice(0, insertIndex)
                .concat([toPage(primitiveNext)])
                .concat(pages.slice(insertIndex));
            return { pages: newPages, index: insertIndex };
        },
        revert: async (pages: Page[]) => {
            const newPages = pages.slice(0, insertIndex).concat(pages.slice(insertIndex + 1));
            return { pages: newPages, index: insertIndex - 1 };
        },
        fixed: false,
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
    quiz?: {
        operation?: Operation;
    };
    commands?: {
        pre: {
            [key in string]: PreCommand;
        };
    };
    flags: {
        lock: boolean;
        send: boolean;
        mirrored: boolean;
        colorize: boolean;
        blockUp: boolean;
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
            send: page.flags.send,
            mirrored: page.flags.mirrored,
            colorize: page.flags.colorize,
            blockUp: page.flags.blockUp,
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
            send: page.flags.send,
            mirrored: page.flags.mirrored,
            colorize: page.flags.colorize,
            blockUp: page.flags.blockUp,
        },
    };
};
