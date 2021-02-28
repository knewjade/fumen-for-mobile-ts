import { NextState, sequence } from './commons';
import { action, actions } from '../actions';
import {
    OperationTask,
    toFreezeCommentTask,
    toKeyPageTask,
    toPageTaskStack,
    toPrimitivePage,
    toSinglePageTask,
} from '../history_task';
import { isQuizCommentResult, PageFieldOperation, Pages, parseToCommands } from '../lib/pages';
import { FieldConstants, Piece, Rotation } from '../lib/enums';
import { getBlockPositions, getBlocks, getPieces } from '../lib/piece';
import { State } from '../states';
import { Field } from '../lib/fumen/field';
import { Move } from '../lib/fumen/types';

export interface ConvertActions {
    shiftToLeft: () => action;
    shiftToRight: () => action;
    shiftToUp: () => action;
    shiftToBottom: () => action;
    convertToGray: () => action;
    clearField: () => action;
    convertToMirror: () => action;
}

export const convertActions: Readonly<ConvertActions> = {
    shiftToLeft: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalFieldCopy = goalField.copy();
        goalField.shiftToLeft();

        const piece = page.piece;
        if (piece === undefined && goalFieldCopy.equals(goalField)) {
            return undefined;
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

        if (piece !== undefined) {
            const positions = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
            const minX = Math.min(...positions.map(position => position[0]));
            if (minX < 1) {
                page.piece = undefined;
            } else {
                piece.coordinate.x -= 1;
            }
        }

        return sequence(state, [
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.reopenCurrentPage(),
        ]);
    },
    shiftToRight: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalFieldCopy = goalField.copy();
        goalField.shiftToRight();

        const piece = page.piece;
        if (piece === undefined && goalFieldCopy.equals(goalField)) {
            return undefined;
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

        if (piece !== undefined) {
            const positions = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
            const maxX = Math.max(...positions.map(position => position[0]));
            if (8 < maxX) {
                page.piece = undefined;
            } else {
                piece.coordinate.x += 1;
            }
        }

        return sequence(state, [
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.reopenCurrentPage(),
        ]);
    },
    shiftToUp: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalFieldCopy = goalField.copy();
        goalField.shiftToUp();

        const piece = page.piece;
        if (piece === undefined && goalFieldCopy.equals(goalField)) {
            return undefined;
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

        if (piece !== undefined) {
            const positions = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
            const maxY = Math.max(...positions.map(position => position[1]));
            if (FieldConstants.Height - 2 < maxY) {
                page.piece = undefined;
            } else {
                piece.coordinate.y += 1;
            }
        }

        return sequence(state, [
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.reopenCurrentPage(),
        ]);
    },
    shiftToBottom: () => (state): NextState => {
        const currentIndex = state.fumen.currentIndex;
        const pages = state.fumen.pages;
        const pagesObj = new Pages(pages);

        const page = pages[currentIndex];
        const primitivePage = toPrimitivePage(page);

        const goalField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalFieldCopy = goalField.copy();
        goalField.shiftToBottom();

        const piece = page.piece;
        if (piece === undefined && goalFieldCopy.equals(goalField)) {
            return undefined;
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

        if (piece !== undefined) {
            const positions = getBlockPositions(piece.type, piece.rotation, piece.coordinate.x, piece.coordinate.y);
            const minY = Math.min(...positions.map(position => position[1]));
            if (minY < 1) {
                page.piece = undefined;
            } else {
                piece.coordinate.y -= 1;
            }
        }

        return sequence(state, [
            actions.registerHistoryTask({ task: toSinglePageTask(currentIndex, primitivePage, page) }),
            () => ({
                fumen: {
                    ...state.fumen,
                    pages,
                },
            }),
            actions.reopenCurrentPage(),
        ]);
    },
    convertToGray: () => (state): NextState => {
        return sequence(state, [
            actions.removeUnsettledItems(),
            convertToGoalField((field) => {
                const copy = field.copy();
                copy.convertToGray();
                return copy;
            }),
        ]);
    },
    clearField: () => (state): NextState => {
        return sequence(state, [
            actions.removeUnsettledItems(),
            convertToGoalField(_ => new Field({})),
        ]);
    },
    convertToMirror: () => (state): NextState => {
        return sequence(state, [
            actions.removeUnsettledItems(),
            convertToMirror(),
        ]);
    },
};

const convertToGoalField = (callback: (field: Field) => Field) => (state: State): NextState => {
    const currentIndex = state.fumen.currentIndex;
    const pages = state.fumen.pages;
    const pagesObj = new Pages(pages);
    const tasks: OperationTask[] = [];

    const page = pages[currentIndex];

    // 現在のページをKeyにする
    if (page.field.obj === undefined) {
        pagesObj.toKeyPage(currentIndex);
        tasks.push(toKeyPageTask(currentIndex));
    }

    if (page.comment.ref !== undefined) {
        pagesObj.freezeComment(currentIndex);
        tasks.push(toFreezeCommentTask(currentIndex));
    }

    const primitivePage = toPrimitivePage(page);

    const initField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
    const goalField = callback(initField);

    if (tasks.length === 0 && initField.equals(goalField)) {
        return undefined;
    }

    const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
    page.commands = parseToCommands(prevField, goalField);

    tasks.push(toSinglePageTask(currentIndex, primitivePage, page));

    return sequence(state, [
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, currentIndex) }),
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
        }),
        actions.reopenCurrentPage(),
    ]);
};

const mirrorPiece = (piece: Piece): Piece => {
    switch (piece) {
    case Piece.J:
        return Piece.L;
    case Piece.L:
        return Piece.J;
    case Piece.S:
        return Piece.Z;
    case Piece.Z:
        return Piece.S;
    }
    return piece;
};

const mirrorRotation = (rotation: Rotation): Rotation => {
    switch (rotation) {
    case Rotation.Left:
        return Rotation.Right;
    case Rotation.Right:
        return Rotation.Left;
    }
    return rotation;
};

const to = (type: Piece, rotation: Rotation, x: number, y: number): Move => {
    return { type, rotation, coordinate: { x, y } };
};

const mirrorMove = (move: Move): Move => {
    const { type, rotation, coordinate: { x, y } } = move;
    const positions = getBlocks(type, rotation);
    const maxX = Math.max(...positions.map(e => e[0]));
    const minY = Math.min(...positions.map(e => e[1]));

    const rx = x + maxX;
    const by = y + minY;

    const mType = mirrorPiece(type);
    const mRotation = mirrorRotation(rotation);
    const mPositions = getBlocks(mType, mRotation);
    const mMinX = Math.min(...mPositions.map(e => e[0]));
    const mMinY = Math.min(...mPositions.map(e => e[1]));

    const lx = 9 - rx;

    return to(mType, mRotation, lx - mMinX, by - mMinY);
};

const mirrorQuiz = (start: String): string => {
    let mirror = '';
    for (let index = 0; index < start.length; index += 1) {
        switch (start[index]) {
        case 'L': {
            mirror += 'J';
            break;
        }
        case 'J': {
            mirror += 'L';
            break;
        }
        case 'S': {
            mirror += 'Z';
            break;
        }
        case 'Z': {
            mirror += 'S';
            break;
        }
        default: {
            mirror += start[index];
            break;
        }
        }
    }
    return mirror;
};

const convertToMirror = () => (state: State): NextState => {
    const currentIndex = state.fumen.currentIndex;
    const pages = state.fumen.pages;
    const pagesObj = new Pages(pages);
    const tasks: OperationTask[] = [];

    // 次のKeyページのインデックスを取得
    let nextKeyIndex = pages.length;
    for (let index = currentIndex + 1; index < pages.length; index += 1) {
        if (pages[index].field.obj !== undefined) {
            nextKeyIndex = index;
            break;
        }
    }

    // 現在のページを反転させる
    {
        const page = pages[currentIndex];

        // 現在のページをKeyにする
        if (page.field.obj === undefined) {
            pagesObj.toKeyPage(currentIndex);
            tasks.push(toKeyPageTask(currentIndex));
        }

        if (page.comment.ref !== undefined) {
            pagesObj.freezeComment(currentIndex);
            tasks.push(toFreezeCommentTask(currentIndex));
        }

        const primitivePage = toPrimitivePage(page);

        const initField = pagesObj.getField(currentIndex, PageFieldOperation.Command);
        const goalField = new Field({});

        for (let y = -1; y < 23; y += 1) {
            for (let x = 0; x < 10; x += 1) {
                const piece = initField.get(9 - x, y);
                goalField.add(x, y, mirrorPiece(piece));
            }
        }

        if (page.piece !== undefined) {
            page.piece = mirrorMove(page.piece);
        }

        const comment = pagesObj.getComment(currentIndex);
        if (isQuizCommentResult(comment)) {
            const mirror = mirrorQuiz(comment.quiz);
            pagesObj.setComment(currentIndex, mirror);
        }

        const prevField = pagesObj.getField(currentIndex, PageFieldOperation.None);
        page.commands = parseToCommands(prevField, goalField);

        tasks.push(toSinglePageTask(currentIndex, primitivePage, page));
    }

    // 次のページ以降を反転させる
    for (let index = currentIndex + 1; index < nextKeyIndex; index += 1) {
        const page = pages[index];
        const primitivePage = toPrimitivePage(page);

        if (page.piece !== undefined) {
            page.piece = mirrorMove(page.piece);
        }

        const comment = pagesObj.getComment(currentIndex);
        if (page.comment.text !== undefined && isQuizCommentResult(comment)) {
            const mirror = mirrorQuiz(comment.quiz);
            pagesObj.setComment(currentIndex, mirror);
        }

        tasks.push(toSinglePageTask(index, primitivePage, page));
    }

    return sequence(state, [
        actions.registerHistoryTask({ task: toPageTaskStack(tasks, currentIndex) }),
        () => ({
            fumen: {
                ...state.fumen,
                pages,
            },
        }),
        actions.reopenCurrentPage(),
    ]);
};
