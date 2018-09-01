import { ModeTypes, Piece, Screens, TouchTypes } from '../lib/enums';
import { Coordinate, Size } from './commons';
import { View } from 'hyperapp';
import { resources, State } from '../states';
import { EditorTools } from '../components/tools/editor_tools';
import { OpenFumenModal, SettingsModal } from '../components/modals';
import { Palette } from '../lib/colors';
import { Actions } from '../actions';
import { Field } from '../components/field';
import { KonvaCanvas } from '../components/konva_canvas';
import { DrawingEventCanvas } from '../components/event/drawing_event_canvas';
import { div } from '@hyperapp/html';
import { px, style } from '../lib/types';
import { colorButton, iconContents, inferenceButton, toolButton } from './editor_buttons';

export interface EditorLayout {
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
    buttons: {
        size: Size;
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

    return {
        canvas: {
            topLeft: {
                x: 0,
                y: 0,
            },
            size: {
                width: fieldSize.width,
                height: canvasSize.height,
            },
        },
        field: {
            blockSize,
            bottomBorderWidth: borderWidthBottomField,
            topLeft: {
                x: 0,
                y: (canvasSize.height - fieldSize.height) / 2.0,
            },
            size: {
                width: fieldSize.width,
                height: fieldSize.height,
            },
        },
        buttons: {
            size: pieceButtonsSize,
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

const toolMode = ({ layout, currentIndex, actions }: {
    layout: EditorLayout;
    currentIndex: number;
    actions: {
        removePage: (data: { index: number }) => void;
        changeToDrawingMode: () => void;
    };
}) => {
    return div({
        style: style({
            marginLeft: px(10),
            paddingBottom: px(10),
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'column',
            alignItems: 'center',
            height: px(layout.canvas.size.height),
            width: px(layout.buttons.size.width),
        }),
    }, [
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-remove-page',
            key: 'btn-remove-page',
            onclick: () => actions.removePage({ index: currentIndex }),
            contents: iconContents({
                height: layout.buttons.size.height,
                description: 'remove',
                iconSize: 22,
                iconName: 'remove_circle_outline',
            }),
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#fff',
            datatest: 'btn-block-mode',
            key: 'btn-block-mode',
            onclick: () => actions.changeToDrawingMode(),
            contents: iconContents({
                height: layout.buttons.size.height,
                description: 'block',
                iconSize: 22,
                iconName: 'edit',
            }),
        }),
    ]);
};

const blockMode = ({ layout, modePiece, actions }: {
    layout: any;
    modePiece: Piece | undefined;
    actions: {
        selectPieceColor: (data: { piece: Piece }) => void;
        selectInferencePieceColor: () => void;
    };
}) => {
    const pieces = [Piece.I, Piece.L, Piece.O, Piece.Z, Piece.T, Piece.J, Piece.S, Piece.Empty, Piece.Gray];

    return div({
        style: style({
            marginLeft: px(10),
            paddingBottom: px(10),
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'column',
            alignItems: 'center',
            height: px(layout.canvas.size.height),
            width: px(layout.buttons.size.width),
        }),
    }, pieces.map(piece => (
        colorButton({ layout, piece, actions, highlight: modePiece === piece })
    )).concat([
        inferenceButton({
            layout,
            actions,
            highlight: modePiece === undefined,
        }),
    ]));
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

            state.mode.type === ModeTypes.Drawing
                ? blockMode({
                    layout,
                    actions,
                    modePiece: state.mode.piece,
                })
                : toolMode({
                    layout,
                    actions,
                    currentIndex: state.fumen.currentIndex,
                }),
        ];
    };

    return div({
        key: 'field-top',
        id: 'field-top',
        style: style({
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            userSelect: 'none',
        }),
    }, getChildren());
};

const Events = (state: State, actions: Actions) => {
    const mode = state.mode;
    switch (mode.touch) {
    case TouchTypes.Drawing:
        return DrawingEventCanvas({
            actions,
            fieldBlocks: resources.konva.fieldBlocks,
            sentBlocks: resources.konva.sentBlocks,
            fieldLayer: resources.konva.layers.field,
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
        modeType: state.mode.type,
        undoCount: state.history.undoCount,
        redoCount: state.history.redoCount,
        inferenceCount: state.events.inferences.length,
    });
};

export const view: View<State, Actions> = (state, actions) => {
    // 初期化
    const layout = getLayout(state.display);

    const batchDraw = () => resources.konva.stage.batchDraw();

    return div({ oncreate: batchDraw, onupdate: batchDraw }, [ // Hyperappでは最上位のノードが最後に実行される
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
            currentIndex: state.fumen.currentIndex,
        }) : undefined as any,
    ]);
};
