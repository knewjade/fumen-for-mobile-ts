import { Piece, Screens, TouchTypes } from '../lib/enums';
import { Coordinate, Size } from './commons';
import { View } from 'hyperapp';
import { resources, State } from '../states';
import { EditorTools } from '../components/tools/editor_tools';
import { OpenFumenModal, SettingsModal } from '../components/modals';
import { getHighlightColor, Palette } from '../lib/colors';
import { Actions } from '../actions';
import { Field } from '../components/field';
import { PieceColorBox } from '../components/piece_color_box';
import { PieceEventCanvas } from '../components/event/piece_event_canvas';
import { KonvaCanvas } from '../components/konva_canvas';
import { DrawingEventCanvas } from '../components/event/drawing_event_canvas';
import { div } from '@hyperapp/html';

interface EditorLayout {
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
    pieceButtons: {
        size: Size;
        topLeft: (index: number) => Coordinate;
    };
    tools: {
        topLeft: Coordinate;
        size: Size;
    };
}

const getLayout = (display: { width: number, height: number }): EditorLayout => {
    const toolsHeight = 50;
    const borderWidthBottomField = 2.4;

    const canvasSize = {
        width: display.width,
        height: display.height - (toolsHeight),
    };

    const blockSize = Math.min(
        (canvasSize.height - borderWidthBottomField - 2) / 24,
        (canvasSize.width - 75) / 10.5,  // 横のスペースが最低でも75pxは残るようにする
    ) - 1;

    const fieldSize = {
        width: (blockSize + 1) * 10 + 1,
        height: (blockSize + 1) * 23.5 + 1 + borderWidthBottomField + 1,
    };

    const pieceButtonsSize = {
        width: Math.min((canvasSize.width - fieldSize.width) * 0.6, 100),
        height: Math.min(
            fieldSize.height / (1.25 * 9 + 0.25),
            40,
        ),
    };

    const boxMargin = Math.min((canvasSize.width - fieldSize.width) * 0.1, 10);
    const fieldTopLeft = {
        x: (canvasSize.width - fieldSize.width - pieceButtonsSize.width - boxMargin) / 2,
        y: (canvasSize.height - fieldSize.height) / 2,
    };
    const boxTopY = fieldTopLeft.y + fieldSize.height - pieceButtonsSize.height * (1.25 * 9 + 0.25);

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
        pieceButtons: {
            size: pieceButtonsSize,
            topLeft: (index: number) => ({
                x: fieldTopLeft.x + fieldSize.width + boxMargin,
                y: boxTopY + (index + 0.125) * pieceButtonsSize.height * 1.25,
            }),
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

const ScreenField = (state: State, actions: Actions, layout: any) => {
    const getChildren = () => {
        return [   // canvas:Field とのマッピング用仮想DOM
            Field({
                fieldMarginWidth: layout.field.bottomBorderWidth,
                topLeft: layout.field.topLeft,
                blockSize: layout.field.blockSize,
                field: state.field,
                sentLine: state.sentLine,
            }),

            // Piece buttons
            ...resources.konva.pieceButtons.map((rects, index) => {
                const piece = index as Piece;

                return PieceColorBox({
                    rects,
                    actions,
                    size: layout.pieceButtons.size,
                    key: 'box-piece-button-' + index,
                    topLeft: layout.pieceButtons.topLeft(index),
                    backgroundColor: getHighlightColor(piece),
                    selected: state.mode.piece === piece,
                    piece: {
                        type: piece,
                        color: getHighlightColor(piece),
                        size: layout.pieceButtons.size.height / 3.5 - 1,
                    },
                });
            }),
        ];
    };

    return div({ key: 'field-top' }, getChildren());
};

const Events = (state: State, actions: Actions) => {
    const mode = state.mode;
    switch (mode.touch) {
    case TouchTypes.Drawing:
        return DrawingEventCanvas({
            actions,
            fieldBlocks: resources.konva.fieldBlocks,
            sentBlocks: resources.konva.sentBlocks,
        });
    case TouchTypes.Piece:
        return PieceEventCanvas({
            actions,
            fieldBlocks: resources.konva.fieldBlocks,
            sentBlocks: resources.konva.sentBlocks,
        });
    }

    return undefined as any;
};

const Tools = (state: State, actions: Actions, height: number) => {
    return EditorTools({
        actions,
        height,
        palette: Palette(Screens.Editor),
        animationState: state.play.status,
        currentPage: state.fumen.currentIndex + 1,
        maxPage: state.fumen.maxPage,
    });
};

export const view: View<State, Actions> = (state, actions) => {
    // 初期化
    const layout = getLayout(state.display);

    const batchDraw = () => resources.konva.stage.batchDraw();

    return div({ oncreate: batchDraw, onupdate: batchDraw }, [ // Hyperappでは最上位のノードが最後に実行される
        KonvaCanvas({  // canvas空間のみ
            actions,
            canvas: layout.canvas.size,
            hyperStage: resources.konva.stage,
        }),

        resources.konva.stage.isReady ? Events(state, actions) : undefined,

        ScreenField(state, actions, layout),

        div({
            key: 'menu-top',
        }, [
            Tools(state, actions, layout.tools.size.height),
        ]),

        state.modal.fumen ? OpenFumenModal({
            actions,
            errorMessage: state.fumen.errorMessage,
            textAreaValue: state.fumen.value,
        }) : undefined as any,
        state.modal.settings ? SettingsModal({
            actions,
            version: state.version,
            pages: state.fumen.pages,
            screen: state.mode.screen,
        }) : undefined as any,
    ]);
};
