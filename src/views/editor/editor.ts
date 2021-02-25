import { CommentType, ModeTypes, Platforms, Screens } from '../../lib/enums';
import { Coordinate, Size } from '../commons';
import { View } from 'hyperapp';
import { resources, State } from '../../states';
import { EditorTools } from '../../components/tools/editor_tools';
import { ColorPalette, Palette } from '../../lib/colors';
import { Actions } from '../../actions';
import { Field } from '../../components/field';
import { KonvaCanvas } from '../../components/konva_canvas';
import { DrawingEventCanvas } from '../../components/event/drawing_event_canvas';
import { div } from '@hyperapp/html';
import { px, style } from '../../lib/types';
import { comment } from '../../components/comment';
import { page_slider } from '../../components/page_slider';
import { toolMode } from './tool_mode';
import { blockMode } from './block_mode';
import { pieceMode } from './piece_mode';
import { fillMode } from './fill_mode';
import { flagsMode } from './flags_mode';
import { utilsMode } from './utils_mode';
import { slideMode } from './slide_mode';
import { fillRowMode } from './fill_row_mode';
import { pieceSelectMode } from './piece_select_mode';
import { navigatorElement } from '../navigator';

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
    comment: {
        topLeft: Coordinate;
        size: Size;
    };
    tools: {
        topLeft: Coordinate;
        size: Size;
    };
}

const getLayout = (
    { topLeftY, width, height }: { topLeftY: number, width: number, height: number },
): EditorLayout => {
    const commentHeight = 35;
    const toolsHeight = 50;
    const borderWidthBottomField = 2.4;

    const canvasSize = {
        width,
        height: height - (toolsHeight + commentHeight + topLeftY),
    };

    const blockSize = Math.min(
        (canvasSize.height - borderWidthBottomField - 2) / 24,
        (canvasSize.width - 90) / 10.5,  // 横のスペースが最低でも90pxは残るようにする
    ) - 1;

    const fieldSize = {
        width: (blockSize + 1) * 10 + 1,
        height: (blockSize + 1) * 23.5 + 1 + borderWidthBottomField + 1,
    };

    const pieceButtonsSize = {
        width: Math.min((canvasSize.width - fieldSize.width) * 0.6, 80),
        height: Math.min(
            fieldSize.height / (1.25 * 9 + 0.25),
            40,
        ),
    };

    return {
        canvas: {
            topLeft: {
                x: 0,
                y: topLeftY,
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
        comment: {
            topLeft: {
                x: 0,
                y: height - commentHeight - toolsHeight,
            },
            size: {
                width,
                height: commentHeight,
            },
        },
        tools: {
            topLeft: {
                x: 0,
                y: height - toolsHeight,
            },
            size: {
                width,
                height: toolsHeight,
            },
        },
    };
};

export const toolStyle = (layout: EditorLayout) => {
    const margin = (layout.canvas.size.height - layout.field.size.height) / 2;
    return style({
        marginTop: '0px',
        marginBottom: '0px',
        marginLeft: '10px',
        marginRight: '0px',
        padding: `${px(margin)} 0px`,
        display: 'flex',
        justifyContent: 'flex-end',
        flexDirection: 'column',
        alignItems: 'center',
        height: px(layout.canvas.size.height),
        width: px(layout.buttons.size.width),
    });
};

const ScreenField = (state: State, actions: Actions, layout: EditorLayout) => {
    const pages = state.fumen.pages;
    const page = pages[state.fumen.currentIndex];
    const keyPage = page === undefined || page.field.obj !== undefined;

    // テト譜の仕様により、最初のページのフラグが全体に反映される
    const guideLineColor = state.fumen.pages[0] !== undefined ? state.fumen.pages[0].flags.colorize : true;

    const getChildren = () => {
        const getMode = () => {
            switch (state.mode.type) {
            case ModeTypes.Drawing: {
                return blockMode({
                    layout,
                    actions,
                    colorize: guideLineColor,
                    modePiece: state.mode.piece,
                });
            }
            case ModeTypes.DrawingTool: {
                return toolMode({
                    layout,
                    actions,
                    keyPage,
                    touchType: state.mode.touch,
                    currentIndex: state.fumen.currentIndex,
                });
            }
            case ModeTypes.Piece: {
                const page = state.fumen.pages[state.fumen.currentIndex];
                return pieceMode({
                    layout,
                    actions,
                    move: page !== undefined ? page.piece : undefined,
                    existInferences: 0 < state.events.inferences.length,
                    pages: state.fumen.pages,
                    flags: page.flags,
                    touchType: state.mode.touch,
                    currentIndex: state.fumen.currentIndex,
                });
            }
            case ModeTypes.Flags: {
                return flagsMode({
                    layout,
                    actions,
                    keyPage,
                    flags: page.flags,
                    currentIndex: state.fumen.currentIndex,
                });
            }
            case ModeTypes.Utils: {
                return utilsMode({
                    layout,
                    actions,
                    touchType: state.mode.touch,
                });
            }
            case ModeTypes.Slide: {
                return slideMode({
                    layout,
                    actions,
                });
            }
            case ModeTypes.Fill: {
                return fillMode({
                    layout,
                    actions,
                    colorize: guideLineColor,
                    modePiece: state.mode.piece,
                });
            }
            case ModeTypes.FillRow: {
                return fillRowMode({
                    layout,
                    actions,
                    colorize: guideLineColor,
                    modePiece: state.mode.piece,
                });
            }
            case ModeTypes.SelectPiece: {
                return pieceSelectMode({
                    layout,
                    actions,
                    currentIndex: state.fumen.currentIndex,
                    colorize: guideLineColor,
                });
            }
            }
        };

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
                guideLineColor: state.fumen.guideLineColor,
            }),

            getMode(),
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
    if (mode === undefined) {
        return undefined;
    }

    return DrawingEventCanvas({
        actions,
        fieldBlocks: resources.konva.fieldBlocks,
        sentBlocks: resources.konva.sentBlocks,
        fieldLayer: resources.konva.layers.field,
    });
};

const Tools = (state: State, actions: Actions, height: number, palette: ColorPalette) => {
    return EditorTools({
        actions,
        height,
        palette,
        currentPage: state.fumen.currentIndex + 1,
        maxPage: state.fumen.maxPage,
        modeType: state.mode.type,
        undoCount: state.history.undoCount,
        redoCount: state.history.redoCount,
        inferenceCount: state.events.inferences.length,
    });
};

export const getComment = (state: State, actions: Actions, layout: EditorLayout) => {
    const currentIndex = state.fumen.currentIndex;
    const currentPage = state.fumen.pages[currentIndex];

    switch (state.mode.comment) {
    case CommentType.Writable: {
        const isCommentKey = resources.comment !== undefined
            || (currentPage !== undefined && currentPage.comment.text !== undefined);

        return comment({
            currentIndex,
            actions,
            key: 'text-comment',
            dataTest: 'text-comment',
            id: 'text-comment',
            textColor: isCommentKey ? '#333' : '#757575',
            backgroundColorClass: 'white',
            height: layout.comment.size.height,
            text: resources.comment !== undefined ? resources.comment.text : state.comment.text,
            placeholder: 'comment',
            readonly: false,
            commentKey: state.comment.changeKey,
        });
    }
    case CommentType.Readonly: {
        const currentIndex = state.fumen.currentIndex;
        const currentPage = state.fumen.pages[currentIndex];
        const isCommentKey = resources.comment !== undefined
            || (currentPage !== undefined && currentPage.comment.text !== undefined);

        return comment({
            currentIndex,
            actions,
            key: 'text-comment',
            dataTest: 'text-comment',
            id: 'text-comment',
            textColor: isCommentKey ? '#333' : '#757575',
            backgroundColorClass: 'white',
            height: layout.comment.size.height,
            text: resources.comment !== undefined ? resources.comment.text : state.comment.text,
            readonly: true,
            commentKey: state.comment.changeKey,
        });
    }
    case CommentType.PageSlider: {
        return page_slider({
            currentIndex,
            actions,
            datatest: 'range-page-slider',
            size: {
                width: layout.comment.size.width * 0.8,
                height: layout.comment.size.height,
            },
            maxPage: state.fumen.maxPage,
        });
    }
    }
};

export const view: View<State, Actions> = (state, actions) => {
    const navigatorHeight = state.platform === Platforms.PC ? 30 : 0;

    // 初期化
    const layout = getLayout({
        ...state.display,
        topLeftY: navigatorHeight,
    });
    const palette = Palette(Screens.Editor);
    const batchDraw = () => resources.konva.stage.batchDraw();

    return div({
        oncreate: batchDraw,
        onupdate: batchDraw,
        key: 'view',
    }, [ // Hyperappでは最上位のノードが最後に実行される
        resources.konva.stage.isReady ? Events(state, actions) : undefined as any,

        navigatorElement({
            palette,
            actions,
            height: navigatorHeight,
        }),

        ScreenField(state, actions, layout),

        div({
            key: 'menu-top',
        }, [
            getComment(state, actions, layout),

            Tools(state, actions, layout.tools.size.height, palette),
        ]),
    ]);
};
