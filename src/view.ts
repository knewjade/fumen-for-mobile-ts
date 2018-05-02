import { View } from 'hyperapp';
import { div } from '@hyperapp/html';
import { Actions } from './actions';
import { resources, State } from './states';
import { isMinoPiece, Piece } from './lib/enums';
import { comment } from './components/comment';
import { KonvaCanvas } from './components/konva_canvas';
import { getHighlightColor, getNormalColor } from './lib/colors';
import { Tools } from './components/tools/tools';
import { OpenFumenModal, SettingsModal } from './components/modals';
import { Field } from './components/field';
import { Box } from './components/box';
import { EventCanvas } from './components/event_canvas';

const getLayout = (display: { width: number, height: number }) => {
    const commentHeight = 35;
    const toolsHeight = 50;

    // キャンバスの大きさ
    const canvasSize = {
        width: display.width,
        height: display.height - (toolsHeight + commentHeight),
    };

    // フィールドのブロックサイズ
    const blockSize = Math.min(
        Math.floor(Math.min(canvasSize.height / 23.5, canvasSize.width / 10)) - 2,
        (canvasSize.width / 16),
    );

    // フィールドの大きさ
    const bottomBorderWidth = 2.4;
    const fieldSize = {
        width: (blockSize + 1) * 10 + 1,
        height: (blockSize + 1) * 23.5 + 1 + bottomBorderWidth + 1,
    };

    // フィールドの左上
    const fieldTopLeft = {
        x: (canvasSize.width - fieldSize.width) / 2,
        y: (canvasSize.height - fieldSize.height) / 2,
    };

    // Hold・Nextのボックスサイズ
    const boxSize = Math.max(Math.min(fieldSize.width / 5 * 1.15, (canvasSize.width - fieldSize.width) / 2 - 15), 5);
    const boxMargin = boxSize / 4;

    return {
        canvas: {
            topLeft: {
                x: 0,
                y: 0,
            },
            size: canvasSize,
        },
        field: {
            blockSize,
            bottomBorderWidth,
            topLeft: fieldTopLeft,
            size: fieldSize,
        },
        hold: {
            boxSize,
            topLeft: {
                x: fieldTopLeft.x - (boxSize + boxMargin / 2),
                y: fieldTopLeft.y,
            },
        },
        nexts: {
            boxSize,
            topLeft: (index: number) => ({
                x: fieldTopLeft.x + fieldSize.width + boxMargin / 2,
                y: fieldTopLeft.y + index * (boxSize + boxMargin),
            }),
        },
        comment: {
            topLeft: {
                x: 0,
                y: display.height - (toolsHeight + commentHeight),
            },
            size: {
                width: display.width,
                height: commentHeight,
            },
        },
        tools: {
            topLeft: {
                x: 0,
                y: display.height - toolsHeight,
            },
            size: {
                width: display.width,
                height: toolsHeight,
            },
        },
    };
};

export const view: View<State, Actions> = (state, actions) => {
    // 初期化
    const layout = getLayout(state.display);

    const decidePieceColor = (piece: Piece, highlight: boolean) => {
        return highlight ? getHighlightColor(piece) : getNormalColor(piece);
    };

    const getPieceColorInBox = (piece?: Piece) => {
        return piece !== undefined && isMinoPiece(piece) ? decidePieceColor(piece, true) : '#000';
    };

    const batchDraw = () => resources.konva.stage.batchDraw();

    return div({ oncreate: batchDraw, onupdate: batchDraw }, [ // Hyperappでは最上位のノードが最後に実行される
        KonvaCanvas({  // canvas空間のみ
            actions,
            canvas: layout.canvas.size,
            hyperStage: resources.konva.stage,
        }),

        resources.konva.stage.isReady ? EventCanvas({
            actions,
            canvas: layout.canvas.size,
            rect: resources.konva.event,
        }) : undefined as any,

        div({
            key: 'field-top',
        }, [   // canvas:Field とのマッピング用仮想DOM
            Field({
                fieldMarginWidth: layout.field.bottomBorderWidth,
                topLeft: layout.field.topLeft,
                blockSize: layout.field.blockSize,
                field: state.field,
                sentLine: state.sentLine,
            }),

            // Hold
            state.hold !== undefined ? Box({
                boxSize: layout.hold.boxSize,
                key: 'box-hold',
                rects: resources.konva.hold,
                topLeft: layout.hold.topLeft,
                piece: isMinoPiece(state.hold) ? {
                    type: state.hold,
                    color: getPieceColorInBox(state.hold),
                    size: layout.hold.boxSize / 4 - 1,
                } : undefined,
            }) : undefined as any,

            // Nexts
            ...(state.nexts !== undefined ? state.nexts : []).map((value, index) => {
                return Box({
                    boxSize: layout.nexts.boxSize,
                    key: 'box-next-' + index,
                    rects: resources.konva.nexts[index],
                    topLeft: layout.nexts.topLeft(index),
                    piece: isMinoPiece(value) ? {
                        type: value,
                        color: getPieceColorInBox(value),
                        size: layout.nexts.boxSize / 4 - 1,
                    } : undefined,
                });
            }),
        ]),
        div({
            key: 'menu-top',
        }, [
            comment({
                dataTest: `text-comment`,
                highlight: state.comment.isChanged,
                height: layout.comment.size.height,
                text: state.comment.text,
            }),
            Tools({
                actions,
                height: layout.tools.size.height,
                animationState: state.play.status,
                pages: state.fumen.currentIndex + 1 + ' / ' + state.fumen.maxPage,
            }),
        ]),
        state.modal.fumen ? OpenFumenModal({
            actions,
            errorMessage: state.fumen.errorMessage,
            textAreaValue: state.fumen.value,
        }) : undefined as any,
        state.modal.settings ? SettingsModal({
            actions,
            version: state.version,
        }) : undefined as any,
    ]);
};
