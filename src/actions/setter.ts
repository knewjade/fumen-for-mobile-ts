import { NextState } from './commons';
import { action, main } from '../actions';
import { FieldConstants, getBlockPositions, isInPlayField, Piece } from '../lib/enums';
import { Block, HighlightType } from '../state_types';
import { Move, Page } from '../lib/fumen/fumen';
import { inferPiece } from '../lib/inference';
import { generateKey } from '../lib/random';

export interface SetterActions {
    setPages: (args: { pages: Page[], open?: boolean }) => action;
    inputFumenData: (args: { value?: string }) => action;
    clearFumenData: () => action;
    setComment: (data: { comment: string }) => action;
    setField: (data: {
        field: Block[],
        move?: Move,
        filledHighlight: boolean,
        inferences: number[],
        ghost: boolean,
    }) => action;
    setFieldColor: (data: { guideLineColor: boolean }) => action;
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
            setTimeout(() => {
                main.openPage({ index: 0 });
            }, 0);
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
        return setterActions.inputFumenData({ value: undefined })(state);
    },
    setComment: ({ comment }) => (state): NextState => {
        return {
            comment: {
                isChanged: comment !== undefined && comment !== state.comment.text,
                text: comment !== undefined ? comment : state.comment.text,
                changeKey: generateKey(),
            },
        };
    },
    setField: ({ field, move, filledHighlight, inferences, ghost }) => (): NextState => {
        const drawnField: Block[] = field.concat();

        // ゴーストの計算
        // 操作しているミノに重ならないように先に計算する
        let ghostY: number | undefined = undefined;
        if (move !== undefined && ghost) {
            const piece = move.type;
            for (let pieceY = move.coordinate.y - 1; 0 <= pieceY; pieceY -= 1) {
                const positions = getBlockPositions(piece, move.rotation, move.coordinate.x, pieceY);
                const canPut = positions.every(
                    ([x, y]) => isInPlayField(x, y) && drawnField[x + y * 10].piece === Piece.Empty,
                );

                if (!canPut) {
                    break;
                }

                ghostY = pieceY;
            }
        }

        // 操作しているミノ
        if (move !== undefined) {
            const piece = move.type;
            const positions = getBlockPositions(piece, move.rotation, move.coordinate.x, move.coordinate.y);
            for (const [x, y] of positions) {
                if (isInPlayField(x, y)) {
                    drawnField[x + y * 10] = { piece, highlight: HighlightType.Highlight2 };
                }
            }
        }

        if (filledHighlight) {
            // 列が揃っているか確認
            for (let y = 0; y < FieldConstants.Height + FieldConstants.SentLine; y += 1) {
                const [start, end] = [y * FieldConstants.Width, (y + 1) * FieldConstants.Width];
                const line = drawnField.slice(start, end);
                const filled = line.every(block => block.piece !== Piece.Empty);
                if (filled) {
                    for (let index = start; index < end; index += 1) {
                        let nextHighlight;
                        const currentBlock = drawnField[index];
                        if (currentBlock !== undefined) {
                            const highlight = currentBlock.highlight;
                            nextHighlight = highlight !== undefined && HighlightType.Highlight1 < highlight
                                ? highlight
                                : HighlightType.Highlight1;
                        }

                        drawnField[index] = {
                            ...field[index],
                            highlight: nextHighlight,
                        };
                    }
                }
            }
        }

        // ゴーストの表示
        if (move !== undefined && ghostY !== undefined) {
            const piece = move.type;
            const positions = getBlockPositions(piece, move.rotation, move.coordinate.x, ghostY);

            for (const [x, y] of positions) {
                drawnField[x + y * 10] = { piece, highlight: HighlightType.Lighter };
            }
        }

        try {
            // InferencePieceが揃っているとき
            const piece = inferPiece(inferences).piece;
            for (const inference of inferences) {
                drawnField[inference] = {
                    ...field[inference],
                    piece,
                    highlight: HighlightType.Highlight2,
                };
            }
        } catch (e) {
            // InferencePieceが揃っていないとき
            for (const inference of inferences) {
                drawnField[inference] = {
                    ...field[inference],
                    piece: 'inference',
                    highlight: HighlightType.Highlight2,
                };
            }
        }

        return { field: drawnField };
    },
    setFieldColor: ({ guideLineColor }) => (state): NextState => {
        return {
            fumen: {
                ...state.fumen,
                guideLineColor,
            },
        };
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
