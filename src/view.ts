import { View } from 'hyperapp';
import { div } from '@hyperapp/html';
import { Actions } from './actions';
import { resources, State } from './states';
import { isMinoPiece, Piece, Screens, TouchTypes } from './lib/enums';
import { comment } from './components/comment';
import { KonvaCanvas } from './components/konva_canvas';
import { getHighlightColor, getNormalColor } from './lib/colors';
import { ReaderTools } from './components/tools/reader_tools';
import { OpenFumenModal, SettingsModal } from './components/modals';
import { Field } from './components/field';
import { Box } from './components/box';
import { EventCanvas } from './components/event/event_canvas';
import { DrawingEventCanvas } from './components/event/drawing_event_canvas';
import { EditorTools } from './components/tools/editor_tools';
import { PieceEventCanvas } from './components/event/piece_event_canvas';
import { PieceColorBox } from './components/piece_color_box';

const getLayout = (display: { width: number, height: number }, screen: Screens) => {
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

    // Hold・Nextのボックスサイズ
    const boxSize = Math.max(Math.min(fieldSize.width / 5 * 1.15, (canvasSize.width - fieldSize.width) / 2 - 15), 5);
    const boxMargin = boxSize / 4;

    // フィールドの左上
    const fieldTopLeft = {
        x: (canvasSize.width - fieldSize.width) / 2 - (screen === Screens.Editor ? boxSize / 2 : 0),
        y: (canvasSize.height - fieldSize.height) / 2,
    };

    if (screen === Screens.Editor) {
        const canvasSize = {
            width: display.width,
            height: display.height - (toolsHeight),
        };
        const s = Math.min(canvasSize.width / 10, canvasSize.height / 24) - 1;
        return {
            canvas: {
                topLeft: {
                    x: 0,
                    y: 0,
                },
                size: canvasSize,
            },
            field: {
                bottomBorderWidth,
                blockSize: s,
                topLeft: {
                    x: 0,
                    y: 0,
                },
                size: {
                    width: (s + 1) * 10 + 1,
                    height: (s + 1) * 24 + 1,
                },
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
            pieceButtons: {
                size: {
                    width: boxSize * 1.2,
                    height: boxSize * 0.75,
                },
                topLeft: (index: number) => ({
                    x: fieldTopLeft.x + fieldSize.width + boxMargin,
                    y: fieldTopLeft.y + index * (boxSize * 0.75 + boxMargin),
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
        pieceButtons: {
            size: {
                width: boxSize * 1.2,
                height: boxSize * 0.75,
            },
            topLeft: (index: number) => ({
                x: fieldTopLeft.x + fieldSize.width + boxMargin,
                y: fieldTopLeft.y + index * (boxSize * 0.75 + boxMargin),
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
    const layout = getLayout(state.display, state.mode.screen);
    console.log(layout);

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
            state.mode.screen === Screens.Reader ? comment({
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
                            size: layout.pieceButtons.size.height / 4 - 1,
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
            pages: state.fumen.currentIndex + 1 + ' / ' + state.fumen.maxPage,
        });
    }

    return undefined as any;
};
