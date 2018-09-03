import { Coordinate, Size } from './commons';
import { View } from 'hyperapp';
import { resources, State } from '../states';
import { MenuModal, OpenFumenModal } from '../components/modals';
import { Actions } from '../actions';
import { div } from '@hyperapp/html';
import { KonvaCanvas } from '../components/konva_canvas';
import { comment } from '../components/comment';
import { isMinoPiece, Screens } from '../lib/enums';
import { EventCanvas } from '../components/event/event_canvas';
import { Box } from '../components/box';
import { getHighlightColor, Palette } from '../lib/colors';
import { Field } from '../components/field';
import { ReaderTools } from '../components/tools/reader_tools';

interface ReaderLayout {
    canvas: {
        topLeft: Coordinate;
        size: Size;
    };
    field: {
        blockSize: number;
        bottomBorderWidth: number;
        topLeft: Coordinate;
        size: Size;
    };
    hold: {
        boxSize: number;
        size: Size;
        topLeft: Coordinate;
    };
    nexts: {
        boxSize: number;
        size: Size;
        topLeft: (index: number) => Coordinate;
    };
    comment: {
        topLeft: Coordinate;
        size: Size;
    };
    tools: {
        topLeft: Coordinate;
        size: Size;
    };
}

const getLayout = (display: { width: number, height: number }): ReaderLayout => {
    const commentHeight = 35;
    const toolsHeight = 50;
    const borderWidthBottomField = 2.4;

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
    const fieldSize = {
        width: (blockSize + 1) * 10 + 1,
        height: (blockSize + 1) * 23.5 + 1 + borderWidthBottomField + 1,
    };

    // Hold・Nextのボックスサイズ
    const boxSize = Math.max(
        Math.min(fieldSize.width / 5 * 1.15, (canvasSize.width - fieldSize.width) / 2 - 15),
        5,
    );
    const boxMargin = boxSize / 4;

    // フィールドの左上
    const fieldTopLeft = {
        x: (canvasSize.width - fieldSize.width) / 2,
        y: (canvasSize.height - fieldSize.height) / 2,
    };

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
            bottomBorderWidth: borderWidthBottomField,
            topLeft: fieldTopLeft,
            size: fieldSize,
        },
        hold: {
            boxSize,
            size: {
                width: boxSize,
                height: boxSize,
            },
            topLeft: {
                x: fieldTopLeft.x - (boxSize + boxMargin / 2),
                y: fieldTopLeft.y,
            },
        },
        nexts: {
            boxSize,
            size: {
                width: boxSize,
                height: boxSize,
            },
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

const Events = (state: State, actions: Actions, layout: any) => {
    return EventCanvas({
        actions,
        canvas: layout.canvas.size,
        rect: resources.konva.event,
    });
};

const ScreenField = (state: State, actions: Actions, layout: any) => {
    const getChildren = () => {
        return [   // canvas:Field とのマッピング用仮想DOM
            KonvaCanvas({  // canvas空間のみ
                actions,
                canvas: layout.canvas.size,
                hyperStage: resources.konva.stage,
            }),

            Field({
                fieldMarginWidth: layout.field.bottomBorderWidth,
                topLeft: layout.field.topLeft,
                blockSize: layout.field.blockSize,
                field: state.field,
                sentLine: state.sentLine,
            }),

            // Hold
            state.hold !== undefined ? Box({
                size: layout.hold.size,
                key: 'box-hold',
                rects: resources.konva.hold,
                topLeft: layout.hold.topLeft,
                piece: isMinoPiece(state.hold) ? {
                    type: state.hold,
                    color: getHighlightColor(state.hold),
                    size: layout.hold.boxSize / 4 - 1,
                } : undefined,
            }) : undefined as any,

            // Nexts
            ...(state.nexts !== undefined ? state.nexts : []).map((value, index) => {
                return Box({
                    size: layout.hold.size,
                    key: 'box-next-' + index,
                    rects: resources.konva.nexts[index],
                    topLeft: layout.nexts.topLeft(index),
                    piece: isMinoPiece(value) ? {
                        type: value,
                        color: getHighlightColor(value),
                        size: layout.nexts.boxSize / 4 - 1,
                    } : undefined,
                });
            }),
        ];
    };

    return div({
        key: 'field-top',
        id: 'field-top',
    }, getChildren());
};

const Tools = (state: State, actions: Actions, height: number) => {
    return ReaderTools({
        actions,
        height,
        palette: Palette(Screens.Reader),
        animationState: state.play.status,
        pages: state.fumen.currentIndex + 1 + ' / ' + state.fumen.maxPage,
    });
};

export const view: View<State, Actions> = (state, actions) => {
    // 初期化
    const layout = getLayout(state.display);

    const batchDraw = () => resources.konva.stage.batchDraw();

    return div({ oncreate: batchDraw, onupdate: batchDraw }, [ // Hyperappでは最上位のノードが最後に実行される
        resources.konva.stage.isReady ? Events(state, actions, layout) : undefined,

        ScreenField(state, actions, layout),

        div({
            key: 'menu-top',
        }, [
            comment({
                dataTest: `text-comment`,
                highlight: state.comment.isChanged,
                height: layout.comment.size.height,
                text: state.comment.text,
            }),

            Tools(state, actions, layout.tools.size.height),
        ]),

        state.modal.fumen ? OpenFumenModal({
            actions,
            errorMessage: state.fumen.errorMessage,
            textAreaValue: state.fumen.value,
        }) : undefined as any,
        state.modal.menu ? MenuModal({
            actions,
            version: state.version,
            pages: state.fumen.pages,
            screen: state.mode.screen,
            currentIndex: state.fumen.currentIndex,
        }) : undefined as any,
    ]);
};
