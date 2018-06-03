import { View } from 'hyperapp';
import { div } from '@hyperapp/html';
import { Actions } from './actions';
import { resources, State } from './states';
import { isMinoPiece, Piece, Screens, TouchTypes } from './lib/enums';
import { comment } from './components/comment';
import { KonvaCanvas } from './components/konva_canvas';
import { getHighlightColor } from './lib/colors';
import { ReaderTools } from './components/tools/reader_tools';
import { OpenFumenModal, SettingsModal } from './components/modals';
import { Field } from './components/field';
import { Box } from './components/box';
import { EventCanvas } from './components/event/event_canvas';
import { DrawingEventCanvas } from './components/event/drawing_event_canvas';
import { EditorTools } from './components/tools/editor_tools';
import { PieceEventCanvas } from './components/event/piece_event_canvas';
import { PieceColorBox } from './components/piece_color_box';
import { ViewError } from './lib/errors';

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface ReaderLayout {
    screen: Screens.Reader;
    canvas: {
        topLeft: Position;
        size: Size;
    };
    field: {
        blockSize: number;
        bottomBorderWidth: number;
        topLeft: Position;
        size: Size;
    };
    hold: {
        boxSize: number;
        size: Size;
        topLeft: Position;
    };
    nexts: {
        boxSize: number;
        size: Size;
        topLeft: (index: number) => Position;
    };
    comment: {
        topLeft: Position;
        size: Size;
    };
    tools: {
        topLeft: Position;
        size: Size;
    };
}

interface EditorLayout {
    screen: Screens.Editor;
    canvas: {
        topLeft: Position;
        size: Size;
    };
    field: {
        blockSize: number;
        bottomBorderWidth: number;
        topLeft: Position;
        size: Size;
    };
    pieceButtons: {
        size: Size;
        topLeft: (index: number) => Position;
    };
    tools: {
        topLeft: Position;
        size: Size;
    };
}

const getLayout = (display: { width: number, height: number }, screen: Screens): ReaderLayout | EditorLayout => {
    const commentHeight = 35;
    const toolsHeight = 50;
    const borderWidthBottomField = 2.4;

    switch (screen) {
    case Screens.Editor: {
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
            screen,
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
    }
    case Screens.Reader: {
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
            screen,
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
    }
    default: {
        throw new ViewError('Unsupported screen: ' + screen);
    }
    }
};

function isReaderLayout(layout: any): layout is ReaderLayout {
    return layout.screen === Screens.Reader;
}

export const view: View<State, Actions> = (state, actions) => {
    // 初期化
    const layout = getLayout(state.display, state.mode.screen);

    const batchDraw = () => resources.konva.stage.batchDraw();

    return div({ oncreate: batchDraw, onupdate: batchDraw }, [ // Hyperappでは最上位のノードが最後に実行される
        KonvaCanvas({  // canvas空間のみ
            actions,
            canvas: layout.canvas.size,
            hyperStage: resources.konva.stage,
        }),

        resources.konva.stage.isReady ? Events(state, actions, layout) : undefined,

        ScreenField(state, actions, layout),

        div({
            key: 'menu-top',
        }, [
            isReaderLayout(layout) ? comment({
                dataTest: `text-comment`,
                highlight: state.comment.isChanged,
                height: layout.comment.size.height,
                text: state.comment.text,
            }) : undefined,

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

const ScreenField = (state: State, actions: Actions, layout: any) => {
    const getChildren = () => {
        switch (state.mode.screen) {
        case Screens.Reader:
            return [   // canvas:Field とのマッピング用仮想DOM
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
        case Screens.Editor:
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
        }
    };

    return div({ key: 'field-top' }, getChildren());
};

const Events = (state: State, actions: Actions, layout: any) => {
    const mode = state.mode;
    switch (mode.screen) {
    case Screens.Reader:
        return EventCanvas({
            actions,
            canvas: layout.canvas.size,
            rect: resources.konva.event,
        });
    case Screens.Editor: {
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
    }
    }

    return undefined as any;
};

const Tools = (state: State, actions: Actions, height: number) => {
    const screen = state.mode.screen;
    switch (screen) {
    case Screens.Reader:
        return ReaderTools({
            actions,
            height,
            screen,
            animationState: state.play.status,
            pages: state.fumen.currentIndex + 1 + ' / ' + state.fumen.maxPage,
        });
    case Screens.Editor:
        return EditorTools({
            actions,
            height,
            screen,
            animationState: state.play.status,
            currentPage: state.fumen.currentIndex + 1,
            maxPage: state.fumen.maxPage,
        });
    }

    return undefined as any;
};
