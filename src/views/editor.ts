import { CommentType, ModeTypes, Piece, Screens, TouchTypes } from '../lib/enums';
import { Coordinate, Size } from './commons';
import { View } from 'hyperapp';
import { resources, State } from '../states';
import { EditorTools } from '../components/tools/editor_tools';
import { Palette } from '../lib/colors';
import { Actions } from '../actions';
import { Field } from '../components/field';
import { KonvaCanvas } from '../components/konva_canvas';
import { DrawingEventCanvas } from '../components/event/drawing_event_canvas';
import { div } from '@hyperapp/html';
import { px, style } from '../lib/types';
import {
    colorButton,
    dualButton,
    iconContents,
    inferenceButton,
    keyButton,
    radioIconContents,
    switchButton,
    switchIconContents,
    toolButton,
    toolSpace,
} from './editor_buttons';
import { ViewError } from '../lib/errors';
import { comment } from '../components/comment';
import { pageSlider } from '../components/pageSlider';

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

const getLayout = (display: { width: number, height: number }): EditorLayout => {
    const commentHeight = 35;
    const toolsHeight = 50;
    const borderWidthBottomField = 2.4;

    const canvasSize = {
        width: display.width,
        height: display.height - (toolsHeight + commentHeight),
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
        comment: {
            topLeft: {
                x: 0,
                y: display.height - commentHeight - toolsHeight,
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

const toolStyle = (layout: EditorLayout) => {
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

const toolMode = ({ layout, currentIndex, keyPage, touchType, actions }: {
    layout: EditorLayout;
    currentIndex: number;
    keyPage: boolean;
    touchType: TouchTypes;
    actions: {
        removePage: (data: { index: number }) => void;
        duplicatePage: (data: { index: number }) => void;
        openPage: (data: { index: number }) => void;
        changeToDrawingMode: () => void;
        changeToFlagsMode: () => void;
        changeToShiftMode: () => void;
        changeToFillRowMode: () => void;
        changeToDrawPieceMode: () => void;
        changeToRef: (data: { index: number }) => void;
        changeToKey: (data: { index: number }) => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        keyButton({
            toolButtonMargin,
            keyPage,
            currentIndex,
            actions,
            width: layout.buttons.size.width,
            height: layout.buttons.size.height,
        }),
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-duplicate-page',
            key: 'btn-duplicate-page',
            onclick: () => {
                const nextPage = currentIndex + 1;
                actions.duplicatePage({ index: nextPage });
                actions.openPage({ index: nextPage });
            },
        }, iconContents({
            description: 'copy',
            iconSize: 22,
            iconName: 'content_copy',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-remove-page',
            key: 'btn-remove-page',
            onclick: () => actions.removePage({ index: currentIndex }),
        }, iconContents({
            description: 'remove',
            iconSize: 22,
            iconName: 'remove_circle_outline',
        })),
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: touchType === TouchTypes.FillRow ? '#fff' : '#f44336',
            borderType: touchType === TouchTypes.FillRow ? 'double' : undefined,
            datatest: 'btn-fill-row-mode',
            key: 'btn-fill-row-mode',
            onclick: () => actions.changeToFillRowMode(),
        }, iconContents({
            description: 'row',
            iconSize: 24,
            iconName: 'power_input',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#f44336',
            datatest: 'btn-shift-mode',
            key: 'btn-shift-mode',
            onclick: () => actions.changeToShiftMode(),
        }, iconContents({
            description: 'shift',
            iconSize: 24,
            iconName: 'swap_vert',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#f44336',
            datatest: 'btn-flags-mode',
            key: 'btn-flags-mode',
            onclick: () => actions.changeToFlagsMode(),
        }, iconContents({
            description: 'flags',
            iconSize: 24,
            iconName: 'flag',
        })),
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: touchType === TouchTypes.Piece ? '#fff' : '#f44336',
            borderType: touchType === TouchTypes.Piece ? 'double' : undefined,
            datatest: 'btn-piece-mode',
            key: 'btn-piece-mode',
            onclick: () => actions.changeToDrawPieceMode(),
        }, iconContents({
            description: 'piece',
            iconSize: 20,
            iconName: 'extension',
        })),
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: touchType === TouchTypes.Drawing ? '#fff' : '#f44336',
            borderType: touchType === TouchTypes.Drawing ? 'double' : undefined,
            datatest: 'btn-block-mode',
            key: 'btn-block-mode',
            onclick: () => actions.changeToDrawingMode(),
        }, iconContents({
            description: 'block',
            iconSize: 22,
            iconName: 'edit',
        })),
    ]);
};

const blockMode = ({ layout, keyPage, currentIndex, modePiece, colorize, actions }: {
    layout: EditorLayout;
    keyPage: boolean;
    currentIndex: number;
    modePiece: Piece | undefined;
    colorize: boolean;
    actions: {
        selectPieceColor: (data: { piece: Piece }) => void;
        selectInferencePieceColor: () => void;
        changeToRef: (data: { index: number }) => void;
        changeToKey: (data: { index: number }) => void;
    };
}) => {
    const pieces = [Piece.I, Piece.L, Piece.O, Piece.Z, Piece.T, Piece.J, Piece.S, Piece.Empty, Piece.Gray];

    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        keyButton({
            toolButtonMargin,
            keyPage,
            currentIndex,
            actions,
            width: layout.buttons.size.width,
            height: layout.buttons.size.height,
        }),
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
    ].concat(pieces.map(piece => (
        colorButton({ layout, piece, colorize, onclick: actions.selectPieceColor, highlight: modePiece === piece })
    ))).concat([
        inferenceButton({
            layout,
            actions,
            highlight: modePiece === undefined,
        }),
    ]));
};

const pieceMode = ({ layout, keyPage, currentIndex, touchType, operatePiece, actions }: {
    layout: EditorLayout;
    keyPage: boolean;
    currentIndex: number;
    touchType: TouchTypes;
    operatePiece: boolean;
    actions: {
        selectPieceColor: (data: { piece: Piece }) => void;
        selectInferencePieceColor: () => void;
        changeToRef: (data: { index: number }) => void;
        changeToKey: (data: { index: number }) => void;
        changeToDrawPieceMode: () => void;
        changeToMovePieceMode: () => void;
        clearPiece: () => void;
        rotateToLeft: () => void;
        rotateToRight: () => void;
        moveToLeft: () => void;
        moveToLeftEnd: () => void;
        moveToRight: () => void;
        moveToRightEnd: () => void;
        harddrop: () => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        keyButton({
            toolButtonMargin,
            keyPage,
            currentIndex,
            actions,
            width: layout.buttons.size.width,
            height: layout.buttons.size.height,
        }),
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
        dualButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
        }, {
            datatest: 'btn-move-to-left-end',
            key: 'btn-move-to-left-end',
            enable: operatePiece,
            onclick: () => actions.moveToLeftEnd(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'skip_previous',
            }),
        }, {
            datatest: 'btn-move-to-right-end',
            key: 'btn-move-to-right-end',
            enable: operatePiece,
            onclick: () => actions.moveToRightEnd(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'skip_next',
            }),
        }),
        dualButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
        }, {
            datatest: 'btn-move-to-left',
            key: 'btn-move-to-left',
            enable: operatePiece,
            onclick: () => actions.moveToLeft(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'keyboard_arrow_left',
            }),
        }, {
            datatest: 'btn-move-to-right',
            key: 'btn-move-to-right',
            enable: operatePiece,
            onclick: () => actions.moveToRight(),
            contents: iconContents({
                description: '',
                iconSize: 24,
                iconName: 'keyboard_arrow_right',
            }),
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-harddrop',
            key: 'btn-harddrop',
            enable: operatePiece,
            onclick: () => actions.harddrop(),
        }, iconContents({
            description: 'drop',
            iconSize: 22,
            iconName: 'vertical_align_bottom',
        })),
        dualButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
        }, {
            datatest: 'btn-rotate-to-left',
            key: 'btn-rotate-to-left',
            enable: operatePiece,
            onclick: () => actions.rotateToLeft(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'rotate_left',
            }),
        }, {
            datatest: 'btn-rotate-to-right',
            key: 'btn-rotate-to-right',
            enable: operatePiece,
            onclick: () => actions.rotateToRight(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'rotate_right',
            }),
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-reset-piece',
            key: 'btn-reset-piece',
            onclick: () => actions.clearPiece(),
        }, iconContents({
            description: 'reset',
            iconSize: 22,
            iconName: 'clear',
        })),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-move-piece',
            key: 'btn-move-piece',
            onclick: () => actions.changeToMovePieceMode(),
            enable: touchType === TouchTypes.MovePiece,
        }, radioIconContents({
            description: 'move',
            iconSize: 22,
            enable: touchType === TouchTypes.MovePiece,
        })),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-draw-piece',
            key: 'btn-draw-piece',
            onclick: () => actions.changeToDrawPieceMode(),
            enable: touchType === TouchTypes.Piece,
        }, radioIconContents({
            description: 'draw',
            iconSize: 22,
            enable: touchType === TouchTypes.Piece,
        })),
    ]);
};

const flagsMode = ({ layout, currentIndex, keyPage, flags, actions }: {
    layout: EditorLayout;
    currentIndex: number;
    keyPage: boolean;
    flags: {
        lock: boolean;
        mirror: boolean;
        rise: boolean;
    },
    actions: {
        removePage: (data: { index: number }) => void;
        changeToDrawingMode: () => void;
        changeToRef: (data: { index: number }) => void;
        changeToKey: (data: { index: number }) => void;
        changeLockFlag: (data: { index: number, enable: boolean }) => void;
        changeRiseFlag: (data: { index: number, enable: boolean }) => void;
        changeMirrorFlag: (data: { index: number, enable: boolean }) => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        keyButton({
            toolButtonMargin,
            keyPage,
            currentIndex,
            actions,
            width: layout.buttons.size.width,
            height: layout.buttons.size.height,
        }),
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-lock-flag',
            key: 'btn-lock-flag',
            onclick: () => actions.changeLockFlag({ index: currentIndex, enable: !flags.lock }),
            enable: flags.lock,
        }, switchIconContents({
            description: 'lock',
            iconSize: 22,
            enable: flags.lock,
        })),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-rise-flag',
            key: 'btn-rise-flag',
            onclick: () => actions.changeRiseFlag({ index: currentIndex, enable: !flags.rise }),
            enable: flags.rise,
        }, switchIconContents({
            description: 'rise',
            iconSize: 22,
            enable: flags.rise,
        })),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-mirror-flag',
            key: 'btn-mirror-flag',
            onclick: () => actions.changeMirrorFlag({ index: currentIndex, enable: !flags.mirror }),
            enable: flags.mirror,
        }, switchIconContents({
            description: 'mirror',
            iconSize: 22,
            enable: flags.mirror,
        })),
    ]);
};

const shiftMode = ({ layout, currentIndex, keyPage, flags, actions }: {
    layout: EditorLayout;
    currentIndex: number;
    keyPage: boolean;
    flags: {
        lock: boolean;
        mirror: boolean;
        rise: boolean;
    },
    actions: {
        changeToRef: (data: { index: number }) => void;
        changeToKey: (data: { index: number }) => void;
        shiftToLeft: () => void;
        shiftToRight: () => void;
        shiftToUp: () => void;
        shiftToBottom: () => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        keyButton({
            toolButtonMargin,
            keyPage,
            currentIndex,
            actions,
            width: layout.buttons.size.width,
            height: layout.buttons.size.height,
        }),
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-shift-to-up',
            key: 'btn-shift-to-up',
            onclick: () => actions.shiftToUp(),
        }, iconContents({
            description: '',
            iconSize: 22,
            iconName: 'keyboard_arrow_up',
        })),
        dualButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
        }, {
            datatest: 'btn-shift-to-left',
            key: 'btn-shift-to-left',
            onclick: () => actions.shiftToLeft(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'keyboard_arrow_left',
            }),
        }, {
            datatest: 'btn-shift-to-right',
            key: 'btn-shift-to-right',
            onclick: () => actions.shiftToRight(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'keyboard_arrow_right',
            }),
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-shift-to-down',
            key: 'btn-shift-to-down',
            onclick: () => actions.shiftToBottom(),
        }, iconContents({
            description: '',
            iconSize: 22,
            iconName: 'keyboard_arrow_down',
        })),
    ]);
};

const fillMode = ({ layout, keyPage, currentIndex, modePiece, colorize, actions }: {
    layout: EditorLayout;
    keyPage: boolean;
    currentIndex: number;
    modePiece: Piece | undefined;
    colorize: boolean;
    actions: {
        selectPieceColor: (data: { piece: Piece }) => void;
        selectInferencePieceColor: () => void;
        changeToRef: (data: { index: number }) => void;
        changeToKey: (data: { index: number }) => void;
    };
}) => {
    const pieces = [Piece.I, Piece.L, Piece.O, Piece.Z, Piece.T, Piece.J, Piece.S, Piece.Empty, Piece.Gray];

    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        keyButton({
            toolButtonMargin,
            keyPage,
            currentIndex,
            actions,
            width: layout.buttons.size.width,
            height: layout.buttons.size.height,
        }),
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
    ].concat(pieces.map(piece => (
        colorButton({ layout, piece, colorize, onclick: actions.selectPieceColor, highlight: modePiece === piece })
    ))));
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
                    keyPage,
                    currentIndex: state.fumen.currentIndex,
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
                    keyPage,
                    operatePiece: page !== undefined && page.piece !== undefined,
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
            case ModeTypes.Shift: {
                return shiftMode({
                    layout,
                    actions,
                    keyPage,
                    flags: page.flags,
                    currentIndex: state.fumen.currentIndex,
                });
            }
            case ModeTypes.Fill: {
                return fillMode({
                    layout,
                    actions,
                    keyPage,
                    currentIndex: state.fumen.currentIndex,
                    colorize: guideLineColor,
                    modePiece: state.mode.piece,
                });
            }
            }

            throw new ViewError('Illegal mode');
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

export const getComment = (state: State, actions: Actions, layout: EditorLayout) => {
    const currentIndex = state.fumen.currentIndex;
    const currentPage = state.fumen.pages[currentIndex];

    switch (state.mode.comment) {
    case CommentType.Writable: {
        const isCommentKey = resources.comment !== undefined
            || (currentPage !== undefined && currentPage.comment.text !== undefined);

        const element = document.querySelector('#text-comment') as HTMLInputElement;
        const updateText = () => {
            if (element) {
                actions.updateCommentText({ text: element.value, pageIndex: state.fumen.currentIndex });
            }
        };
        return comment({
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
            actions: {
                onupdate: updateText,
                onenter: () => {
                    if (element) {
                        element.blur();
                    }
                },
                onblur: () => {
                    updateText();
                    actions.commitCommentText();
                },
            },
        });
    }
    case CommentType.Readonly: {
        const currentIndex = state.fumen.currentIndex;
        const currentPage = state.fumen.pages[currentIndex];
        const isCommentKey = resources.comment !== undefined
            || (currentPage !== undefined && currentPage.comment.text !== undefined);

        return comment({
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
        return pageSlider({
            actions,
            datatest: 'range-page-slider',
            size: {
                width: layout.comment.size.width * 0.8,
                height: layout.comment.size.height,
            },
            currentIndex: state.fumen.currentIndex,
            maxPage: state.fumen.maxPage,
        });
    }
    }

    return div({
        style: style({
            width: px(layout.comment.size.width),
            height: px(layout.comment.size.height),
        }),
    });
};

export const view: View<State, Actions> = (state, actions) => {
    // 初期化
    const layout = getLayout(state.display);

    const batchDraw = () => resources.konva.stage.batchDraw();

    return div({
        oncreate: batchDraw,
        onupdate: batchDraw,
        key: 'view',
    }, [ // Hyperappでは最上位のノードが最後に実行される
        resources.konva.stage.isReady ? Events(state, actions) : undefined as any,

        ScreenField(state, actions, layout),

        div({
            key: 'menu-top',
        }, [
            getComment(state, actions, layout),

            Tools(state, actions, layout.tools.size.height),
        ]),
    ]);
};
