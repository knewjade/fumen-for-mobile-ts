import { View } from 'hyperapp';
import { a, div, h4, span, textarea } from '@hyperapp/html';
import { Actions } from './actions';
import { State } from './states';
import { HyperStage } from './lib/hyper';
import { AnimationState, isMinoPiece, Piece } from './lib/enums';
import { ModalInstance, style } from './lib/types';
import { field } from './components/field';
import { block } from './components/block';
import { comment } from './components/comment';
import { modal } from './components/modal';
import { tools } from './components/tools';
import { game } from './components/game';
import { box } from './components/box';
import { icon } from './components/icon';
import { settings } from './components/settings';
import { getHighlightColor, getNormalColor } from './lib/colors';
import { ToolButton } from './components/tool_button';
import { ToolText } from './components/tool_text';
import konva = require('konva');

declare const M: any;

const VERSION = '###VERSION###';  // Replace build number of CI when run `webpack:prod`

export const view: () => View<State, Actions> = () => {
    // 初期化
    const hyperStage = new HyperStage();

    // Canvasの要素
    // 背景
    const background: konva.Rect = new konva.Rect({
        fill: '#333',
        strokeWidth: 0,
        opacity: 1,
    });

    const line = new konva.Line({
        points: [],
        stroke: '#d8d8d8',
    });

    {
        const backgroundLayer = new konva.Layer({
            name: 'background',
        });

        backgroundLayer.add(background);
        backgroundLayer.add(line);

        hyperStage.addLayer(backgroundLayer);
    }

    // 描画
    // フィールドブロック
    const blocks = Array.from({ length: 23 * 10 }).map((ignore, index) => {
        const [ix, iy] = [index % 10, Math.floor(index / 10)];
        const py = 22 - iy;
        const box: konva.Rect = new konva.Rect({
            strokeWidth: 0,
            opacity: 1,
        });
        return {
            ix,
            iy,
            py,
            box,
        };
    });

    // せり上がりブロック
    const bottomBlocks = Array.from({ length: 10 }).map((ignore, index) => {
        const [ix, iy] = [index % 10, Math.floor(index / 10)];
        const box: konva.Rect = new konva.Rect({
            strokeWidth: 0,
            opacity: 0.75,
        });
        return {
            ix,
            iy,
            box,
            py: 0,
        };
    });

    const boxFunc: () => konva.Rect = () => {
        return new konva.Rect({
            fill: '#333',
            strokeWidth: 1,
            stroke: '#666',
            opacity: 1,
        });
    };

    const partsFunc: () => konva.Rect[] = () => {
        return Array.from({ length: 4 }).map(() => {
            return new konva.Rect({
                strokeWidth: 0,
                opacity: 1,
            });
        });
    };

    // Hold
    const hold = {
        box: boxFunc(),
        pieces: partsFunc(),
    };

    // Next
    const nexts = Array.from({ length: 5 }).map((ignore, index) => {
        return {
            index,
            box: boxFunc(),
            pieces: partsFunc(),
        };
    });
    {
        const canvasLayer = new konva.Layer({
            name: 'field',
        });

        // フィールドブロック
        for (const block of blocks) {
            canvasLayer.add(block.box);
        }

        // せり上がりブロック
        for (const block of bottomBlocks) {
            canvasLayer.add(block.box);
        }

        // Hold & Next
        for (const obj of [hold].concat(nexts as typeof hold[])) {
            canvasLayer.add(obj.box);

            for (const part of obj.pieces) {
                canvasLayer.add(part);
            }
        }

        hyperStage.addLayer(canvasLayer);
    }

    // Overlay
    // Event Layer
    const eventBox = new konva.Rect({
        fill: '#333',
        opacity: 0.0,  // 0 ほど透過
        strokeEnabled: false,
        listening: true,
    });
    {
        const overlayLayer = new konva.Layer();
        overlayLayer.add(eventBox);
        hyperStage.addLayer(overlayLayer);
    }

    const heights = {
        comment: 35,
        tools: 50,
    };

    const modalInstances: {
        fumen?: ModalInstance;
        settings?: ModalInstance;
    } = {};

    const decidePieceColor = (piece: Piece, highlight: boolean) => {
        return highlight ? getHighlightColor(piece) : getNormalColor(piece);
    };

    const decideBackgroundColor = (y: number) => {
        return y < 20 ? '#000' : '#333';
    };

    // 全体の構成を1関数にまとめる
    return (state, actions) => {
        const canvas = {
            width: state.display.width,
            height: state.display.height - (heights.tools + heights.comment),
        };
        const size = Math.min(
            Math.floor(Math.min(canvas.height / 23.5, canvas.width / 10)) - 2,
            (canvas.width / 16),
        );

        const bottomBorderWidth = 2.4;
        const fieldSize = {
            width: (size + 1) * 10 + 1,
            height: (size + 1) * 23.5 + 1 + bottomBorderWidth + 1,
        };
        const top = {
            x: (canvas.width - fieldSize.width) / 2,
            y: (canvas.height - fieldSize.height) / 2,
        };
        const top2 = {
            x: top.x,
            y: top.y + (size + 1) * 22.5 + 1 + bottomBorderWidth,
        };
        const boxSize = Math.min(fieldSize.width / 5 * 1.1, (canvas.width - fieldSize.width) / 2) + 1;
        const boxMargin = boxSize / 4;

        const getPieceColorInBox = (piece?: Piece) => {
            return piece !== undefined && isMinoPiece(piece) ? decidePieceColor(piece, true) : undefined;
        };

        return div({
            oncreate: () => {
                // Hyperappでは最上位のノードが最後に実行される
                hyperStage.batchDraw();
            },
            onupdate: () => {
                // Hyperappでは最上位のノードが最後に実行される
                hyperStage.batchDraw();
            },
        }, [
            game({  // canvas空間のみ
                canvas,
                eventBox,
                key: 'game-top',
                stage: hyperStage,
                backPage: actions.backPage,
                nextPage: actions.nextPage,
            }),
            div({
                key: 'field-top',
            }, [   // canvas:Field とのマッピング用仮想DOM
                field({
                    background,
                    line,
                    position: top,
                    size: fieldSize,
                    borderPosition: {
                        startX: top2.x,
                        endX: top2.x + fieldSize.width,
                        y: top2.y - bottomBorderWidth / 2,
                    },
                    borderWidth: bottomBorderWidth,
                }, blocks.map((value) => {
                    const blockValue = state.field[value.ix + value.iy * 10];

                    const color = blockValue.piece === Piece.Empty ?
                        decideBackgroundColor(value.iy) :
                        decidePieceColor(blockValue.piece, blockValue.highlight || false);

                    return block({
                        color,
                        key: `block-${value.ix}-${value.iy}`,
                        dataTest: `block-${value.ix}-${value.iy}`,
                        size: {
                            width: size,
                            height: value.py !== 0 ? size : size / 2,
                        },
                        position: {
                            x: top.x + value.ix * size + value.ix + 1,
                            y: top.y + Math.max(0, value.py - 0.5) * size + value.py + 1,
                        },
                        rect: value.box,
                    });
                }).concat(
                    bottomBlocks.map((value) => {
                        const blockValue = state.sentLine[value.ix + value.iy * 10];

                        const color = blockValue.piece === Piece.Empty ?
                            '#000' :
                            decidePieceColor(blockValue.piece, blockValue.highlight || false);

                        return block({
                            color,
                            key: `sent-block-${value.ix}-${value.iy}`,
                            dataTest: `sent-block-${value.ix}-${value.iy}`,
                            size: {
                                width: size,
                                height: size,
                            },
                            position: {
                                x: top2.x + value.ix * size + value.ix + 1,
                                y: top2.y + value.py * size + value.py + 1,
                            },
                            rect: value.box,
                        });
                    }),
                )),
                state.hold !== undefined ? box({
                    key: 'hold',
                    dataTest: 'box-hold',
                    position: {
                        x: top.x - (boxSize + boxMargin / 2),
                        y: top.y,
                    },
                    box: {
                        size: boxSize,
                        color: '#333',
                    },
                    rect: hold,
                    piece: {
                        type: state.hold,
                        color: getPieceColorInBox(state.hold),
                        size: boxSize / 4 - 1,
                    },
                }) : undefined,
                ...nexts.map(value => state.next !== undefined && state.next[value.index] !== undefined ? box({
                    key: `next-${value.index}`,
                    dataTest: `box-next-${value.index}`,
                    position: {
                        x: top.x + fieldSize.width + boxMargin / 2,
                        y: top.y + value.index * (boxSize + boxMargin),
                    },
                    box: {
                        size: boxSize,
                        color: '#333',
                    },
                    rect: value,
                    piece: {
                        type: state.next[value.index],
                        color: getPieceColorInBox(state.next[value.index]),
                        size: boxSize / 4 - 1,
                    },
                }) : undefined),
            ] as any),
            div({
                key: 'menu-top',
            }, [
                comment({
                    dataTest: `text-comment`,
                    isChanged: state.comment.isChanged,
                    height: heights.comment,
                    text: state.comment.text,
                }),
                tools({
                    dataTest: 'tools',
                    height: heights.tools,
                }, [
                    ToolButton({
                        dataTest: 'btn-open-fumen',
                        width: 55,
                        height: heights.tools - 10,
                        fontSize: 33.75,
                        iconName: 'open_in_new',
                        marginRight: 10,
                        actions: {
                            onclick: () => actions.openFumenModal(),
                        },
                    }),
                    ToolText({
                        height: heights.tools - 10,
                        minWidth: 85,
                        fontSize: 18,
                        marginRight: 10,
                    }, state.fumen.currentIndex + 1 + ' / ' + state.fumen.maxPage),
                    ToolButton({
                        width: 50,
                        height: heights.tools - 10,
                        fontSize: 45.375,
                        iconName: state.play.status !== 'pause' ? 'pause' : 'play_arrow',
                        marginRight: 10,
                        actions: {
                            onclick: () => {
                                switch (state.play.status) {
                                case AnimationState.Play:
                                    actions.pauseAnimation();
                                    break;
                                default:
                                    actions.startAnimation();
                                    break;
                                }
                            },
                        },
                    }),
                    ToolButton({
                        sticky: true,
                        width: 45,
                        height: heights.tools - 10,
                        fontSize: 31.25,
                        iconName: 'settings',
                        actions: {
                            onclick: () => actions.openSettingsModal(),
                        },
                    }),
                ]),
            ]),
            modal({
                dataTest: 'mdl-open-fumen',
                key: 'fumen-modal-top',
                isOpened: state.modal.fumen,
                bottomSheet: false,
                oncreate: (element: HTMLDivElement) => {
                    const instance = M.Modal.init(element, {
                        onOpenEnd: () => {
                            const element = document.getElementById('textarea-fumen');
                            if (element !== null) {
                                element.focus();
                            }
                        },
                        onCloseStart: () => {
                            actions.closeFumenModal();
                        },
                    });

                    if (state.modal.fumen) {
                        instance.open();
                    } else {
                        instance.close();
                    }

                    modalInstances.fumen = instance;
                },
                onupdate: (ignore, attr) => {
                    if (state.modal.fumen !== attr.isOpened && modalInstances.fumen !== undefined) {
                        if (state.modal.fumen) {
                            modalInstances.fumen.open();
                        } else {
                            modalInstances.fumen.close();
                        }
                    }
                },
            }, [
                h4('テト譜を開く'),
                textarea({
                    dataTest: 'input-fumen',
                    rows: 3,
                    style: style({
                        width: '100%',
                        border: state.fumen.errorMessage !== undefined ? 'solid 1px #ff5252' : undefined,
                    }),
                    oninput: (e: any) => {
                        const value = e.target.value !== '' ? e.target.value : undefined;
                        actions.inputFumenData({ value });
                    },
                    value: state.fumen.value,
                    placeholder: 'URL or v115@~ / Support v115 only',
                }),
                span({
                    dataTest: 'text-message',
                    id: 'text-fumen-modal-error',
                    className: 'red-text text-accent-2',
                    style: style({
                        display: state.fumen.errorMessage !== undefined ? undefined : 'none',
                    }),
                }, state.fumen.errorMessage),
            ], [
                a({
                    dataTest: 'btn-cancel',
                    class: 'waves-effect waves-teal btn-flat',
                    onclick: () => {
                        actions.closeFumenModal();
                        actions.clearFumenData();
                    },
                }, 'Cancel'),
                a({
                    dataTest: 'btn-open',
                    id: 'btn-fumen-modal-open',
                    class: 'waves-effect waves-teal btn-flat' + (
                        state.fumen.value === undefined || state.fumen.errorMessage !== undefined ? ' disabled' : ''
                    ),
                    onclick: () => {
                        actions.loadFumen({ fumen: state.fumen.value });
                    },
                }, 'Open'),
            ]),
            modal({
                key: 'settings-modal-top',
                isOpened: state.modal.settings,
                bottomSheet: true,
                oncreate: (element: HTMLDivElement) => {
                    const instance = M.Modal.init(element, {
                        onCloseStart: () => {
                            actions.closeSettingsModal();
                        },
                    });

                    if (state.modal.fumen) {
                        instance.open();
                    } else {
                        instance.close();
                    }

                    modalInstances.settings = instance;
                },
                onupdate: (ignore, attr) => {
                    if (state.modal.settings !== attr.isOpened && modalInstances.settings !== undefined) {
                        if (state.modal.settings) {
                            modalInstances.settings.open();
                        } else {
                            modalInstances.settings.close();
                        }
                    }
                },
            }, [
                h4([
                    'Settings ',
                    span({
                        style: style({
                            color: '#999',
                            fontSize: '50%',
                        }),
                    }, [` [build ${VERSION}]`]),
                ]),
                settings({}, [
                    a({
                        href: './help.html',
                    }, [
                        icon({
                            width: 50,
                            height: 50,
                            scale: 0.625,
                            display: 'block',
                            color: '#333',
                            depth: true,
                        }, 'help_outline'),
                        div({
                            style: style({
                                textAlign: 'center',
                                color: '#333',
                            }),
                        }, 'help'),
                    ]),
                ]),
            ]),
        ]);
    };
};
