import { parsePieceName, Piece, Screens, TouchTypes } from '../lib/enums';
import { Coordinate, Size } from './commons';
import { View } from 'hyperapp';
import { resources, State } from '../states';
import { EditorTools } from '../components/tools/editor_tools';
import { OpenFumenModal, SettingsModal } from '../components/modals';
import { Palette } from '../lib/colors';
import { Actions } from '../actions';
import { Field } from '../components/field';
import { PieceEventCanvas } from '../components/event/piece_event_canvas';
import { KonvaCanvas } from '../components/konva_canvas';
import { DrawingEventCanvas } from '../components/event/drawing_event_canvas';
import { a, div, img } from '@hyperapp/html';
import { px, style } from '../lib/types';

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

const ScreenField = (state: State, actions: Actions, layout: any) => {
    const colorButton = ({ piece, highlight, actions }: {
        piece: Piece,
        highlight: boolean,
        actions: {
            selectPieceColor: (data: { piece: Piece }) => void;
        },
    }) => {
        const boarderWidth = highlight ? 3 : 1;
        const pieceName = parsePieceName(piece);
        return a({
            href: '#',
            class: 'waves-effect z-depth-0 btn',
            datatest: `btn-piece-${pieceName.toLowerCase()}`,
            style: style({
                backgroundColor: '#fff',
                color: '#333',
                border: `solid ${boarderWidth}px ` + (highlight ? '#ff8a80' : '#333'),
                margin: px(5),
                width: px(layout.buttons.size.width),
                maxWidth: px(layout.buttons.size.width),
                padding: px(0),
                boxSizing: 'border-box',
                textAlign: 'center',
            }),
            onclick: () => actions.selectPieceColor({ piece }),
        }, [
            div({
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                },
            }, [
                img({
                    src: `img/${pieceName}.svg`,
                    height: (0.6 * layout.buttons.size.height) + '',
                    style: style({
                        margin: 'auto',
                    }),
                }),
            ]),
        ]);
    };

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

            div({
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
                colorButton({ actions, piece: Piece.Empty, highlight: state.mode.piece === Piece.Empty }),
                colorButton({ actions, piece: Piece.I, highlight: state.mode.piece === Piece.I }),
                colorButton({ actions, piece: Piece.L, highlight: state.mode.piece === Piece.L }),
                colorButton({ actions, piece: Piece.O, highlight: state.mode.piece === Piece.O }),
                colorButton({ actions, piece: Piece.Z, highlight: state.mode.piece === Piece.Z }),
                colorButton({ actions, piece: Piece.T, highlight: state.mode.piece === Piece.T }),
                colorButton({ actions, piece: Piece.J, highlight: state.mode.piece === Piece.J }),
                colorButton({ actions, piece: Piece.S, highlight: state.mode.piece === Piece.S }),
                colorButton({ actions, piece: Piece.Gray, highlight: state.mode.piece === Piece.Gray }),
            ]),
        ];
    };

    return div({
        key: 'field-top',
        style: style({
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
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
