import { View } from 'hyperapp';
import { a, div, h4, span, textarea } from '@hyperapp/html';
import { Actions } from './actions';
import { State } from './states';
import { HyperHammer, HyperStage } from './lib/hyper';
import { AnimationState } from './lib/enums';
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
import konva = require('konva');

declare const M: any;

const VERSION = '###VERSION###';  // Replace build number of CI when run `webpack:prod`

export const view: () => View<State, Actions> = () => {
    // 初期化
    const hyperStage = new HyperStage();
    const hyperHammer = new HyperHammer();

    // ブロック
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

    {
        const layer = new konva.Layer();
        for (const block of blocks) {
            layer.add(block.box);
        }
        for (const block of bottomBlocks) {
            layer.add(block.box);
        }
        hyperStage.addLayer(layer);
    }

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
        const layer = new konva.Layer();
        layer.add(background);
        layer.add(line);
        hyperStage.addLayer(layer);
    }

    const box2: () => konva.Rect = () => {
        return new konva.Rect({
            fill: '#333',
            strokeWidth: 2,
            stroke: '#333',
            opacity: 1,
        });
    };

    const parts: () => konva.Rect[] = () => {
        return Array.from({ length: 4 }).map(() => {
            return new konva.Rect({
                strokeWidth: 0,
                opacity: 1,
            });
        });
    };

    // Hold
    const hold = {
        box: box2(),
        parts: parts(),
    };
    const nexts = Array.from({ length: 5 }).map((ignore, index) => {
        return {
            index,
            box: box2(),
            parts: parts(),
        };
    });
    {
        const layer = new konva.Layer();
        for (const obj of [hold].concat(nexts as typeof hold[])) {
            layer.add(obj.box);
            for (const part of obj.parts) {
                layer.add(part);
            }
        }
        hyperStage.addLayer(layer);
    }

    const heights = {
        comment: 35,
        tools: 50,
    };

    const modalInstances: {
        fumen?: ModalInstance;
        settings?: ModalInstance;
    } = {};

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
        const boxSize = Math.min(fieldSize.width / 5 * 1.1, (canvas.width - fieldSize.width) / 2);
        const boxMargin = boxSize / 4;

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
                key: 'game-top',
                stage: hyperStage,
                hammer: hyperHammer,
                backPage: () => {
                    actions.backPage();
                },
                nextPage: () => {
                    actions.nextPage();
                },
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
                    return block({
                        size: {
                            width: size,
                            height: value.py !== 0 ? size : size / 2,
                        },
                        position: {
                            x: top.x + value.ix * size + value.ix + 1,
                            y: top.y + Math.max(0, value.py - 0.5) * size + value.py + 1,
                        },
                        piece: blockValue.piece,
                        key: `block-${value.ix}-${value.iy}`,
                        rect: value.box,
                        highlight: blockValue.highlight || false,
                        background: value.iy < 20 ? '#000' : '#333',
                    });
                }).concat(
                    bottomBlocks.map((value) => {
                        const blockValue = state.sentLine[value.ix + value.iy * 10];
                        return block({
                            size: {
                                width: size,
                                height: size,
                            },
                            position: {
                                x: top2.x + value.ix * size + value.ix + 1,
                                y: top2.y + value.py * size + value.py + 1,
                            },
                            piece: blockValue.piece,
                            key: `block-up-${value.ix}-${value.iy}`,
                            rect: value.box,
                            highlight: blockValue.highlight || false,
                            background: '#000',
                        });
                    }),
                )),
                box({
                    key: 'hold',
                    position: {
                        x: top.x - (boxSize + boxMargin / 2),
                        y: top.y,
                    },
                    size: boxSize,
                    rect: hold,
                    visible: true,
                    piece: {
                        value: state.hold,
                        size: boxSize / 4 - 1,
                        margin: 1,
                    },
                }),
                ...nexts.map(value => box({
                    key: `next-${value.index}`,
                    position: {
                        x: top.x + fieldSize.width + boxMargin / 2,
                        y: top.y + value.index * (boxSize + boxMargin),
                    },
                    size: boxSize,
                    rect: value,
                    visible: true,
                    piece: {
                        value: state.next !== undefined ? state.next[value.index] : undefined,
                        size: boxSize / 4 - 1,
                        margin: 1,
                    },
                })),
            ]),
            div({
                key: 'menu-top',
            }, [
                comment({
                    isChanged: state.comment.isChanged,
                    height: heights.comment,
                    text: state.comment.text,
                }),
                tools({
                    height: heights.tools,
                }, [
                    a({
                        href: '#',
                        onclick: () => {
                            actions.openFumenModal();
                        },
                    }, [
                        icon({
                            width: 55,
                            height: heights.tools,
                            scale: 0.675,
                        }, 'open_in_new'),
                    ]),
                    span({
                        style: style({
                            lineHeight: heights.tools + 'px',
                            fontSize: '18px',
                            margin: '0px 10px',
                            minWidth: '85px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                        }),
                    }, state.fumen.currentIndex + 1 + ' / ' + state.fumen.maxPage),
                    a({
                        href: '#',
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
                    }, [
                        icon({
                            width: 55,
                            height: heights.tools,
                            scale: 0.825,
                        }, state.play.status !== 'pause' ? 'pause' : 'play_arrow'),
                    ]),
                    a({
                        href: '#',
                        style: style({
                            marginLeft: 'auto',
                            position: 'absolute',
                            right: '10px',
                        }),
                        onclick: () => {
                            actions.openSettingsModal();
                        },
                    }, [
                        icon({
                            width: 45,
                            height: heights.tools,
                            scale: 0.625,
                        }, 'settings'),
                    ]),
                ]),
            ]),
            modal({
                id: 'fumen-modal',
                key: 'fumen-modal-top',
                isOpened: state.modal.fumen,
                bottomSheet: false,
                oncreate: (element: HTMLDivElement) => {
                    const instance = M.Modal.init(element, {
                        onOpenEnd: () => {
                            const element = document.getElementById('fumen-textarea');
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
                    id: 'fumen-textarea',
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
                    className: 'red-text text-accent-2',
                    style: style({
                        display: state.fumen.errorMessage !== undefined ? undefined : 'none',
                    }),
                }, state.fumen.errorMessage),
            ], [
                a({
                    class: 'waves-effect waves-teal btn-flat',
                    onclick: () => {
                        actions.closeFumenModal();
                        actions.clearFumenData();
                    },
                }, 'Cancel'),
                a({
                    class: 'waves-effect waves-teal btn-flat' + (
                        state.fumen.value === undefined || state.fumen.errorMessage !== undefined ? ' disabled' : ''
                    ),
                    onclick: () => {
                        actions.loadFumen({ fumen: state.fumen.value });
                    },
                }, 'Open'),
            ]),
            modal({
                id: 'settings-modal',
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
