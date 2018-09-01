import { NextState } from './commons';
import { action, actions, main } from '../actions';
import { FieldConstants, Piece } from '../lib/enums';
import { Block } from '../state_types';
import { Page } from '../lib/fumen/fumen';
import { inferPiece } from '../lib/inference';

export interface SetterActions {
    setPages: (args: { pages: Page[], open?: boolean }) => action;
    inputFumenData: (args: { value?: string }) => action;
    clearFumenData: () => action;
    setComment: (data: { comment: string }) => action;
    setField: (data: { field: Block[], filledHighlight: boolean, inferences: number[] }) => action;
    setSentLine: (data: { sentLine: Block[] }) => action;
    setHold: (data: { hold?: Piece }) => action;
    setNext: (data: { next?: Piece[] }) => action;
}

export const setterActions: Readonly<SetterActions> = {
    setPages: ({ pages, open = true }) => (state): NextState => {
        if (pages.length < 1) {
            return undefined;
        }

        if (open) {
            setImmediate(() => {
                main.openPage({ index: 0 });
            });
        }

        return {
            fumen: {
                ...state.fumen,
                pages,
                maxPage: pages.length,
            },
        };
    },
    inputFumenData: ({ value }) => (state): NextState => {
        return {
            fumen: {
                ...state.fumen,
                value,
                errorMessage: undefined,
            },
        };
    },
    clearFumenData: () => (state): NextState => {
        return actions.inputFumenData({ value: undefined })(state);
    },
    setComment: ({ comment }) => (state): NextState => {
        return {
            comment: {
                isChanged: comment !== undefined && comment !== state.comment.text,
                text: comment !== undefined ? comment : state.comment.text,
            },
        };
    },
    setField: ({ field, filledHighlight, inferences }) => (): NextState => {
        // 列が揃っているか確認
        const drawnField: Block[] = field.concat();

        if (filledHighlight) {
            // 列が揃っているか確認
            for (let y = 0; y < FieldConstants.Height + FieldConstants.SentLine; y += 1) {
                const [start, end] = [y * FieldConstants.Width, (y + 1) * FieldConstants.Width];
                const line = drawnField.slice(start, end);
                const filled = line.every(block => block.piece !== Piece.Empty);
                if (filled) {
                    for (let index = start; index < end; index += 1) {
                        drawnField[index] = {
                            ...field[index],
                            highlight: true,
                        };
                    }
                }
            }
        }

        try {
            // InferencePieceが揃っているとき
            const piece = inferPiece(inferences).piece;
            for (const inference of inferences) {
                drawnField[inference] = {
                    ...field[inference],
                    piece,
                    highlight: true,
                };
            }
        } catch (e) {
            // InferencePieceが揃っていないとき
            for (const inference of inferences) {
                drawnField[inference] = {
                    ...field[inference],
                    piece: 'inference',
                };
            }
        }

        return { field: drawnField };
    },
    setSentLine: ({ sentLine }) => (): NextState => {
        return { sentLine };
    },
    setHold: ({ hold }) => (): NextState => {
        return { hold };
    },
    setNext: ({ next }) => (): NextState => {
        return { nexts: next };
    },
};
