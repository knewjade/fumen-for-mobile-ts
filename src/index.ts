import { app, View } from 'hyperapp';
import { a, div, h4, span, textarea } from '@hyperapp/html';
import { actions as originActions, Actions } from './actions';
import { initState, State } from './states';
import { HyperHammer, HyperStage } from './lib/hyper';
import { AnimationState, Piece, Rotation } from './lib/enums';
import { decode, Operation, Page as FumenPage } from './lib/fumen/fumen';
import { ModalInstance, style } from './lib/types';
import { field } from './components/field';
import { block } from './components/block';
import { comment } from './components/comment';
import { modal } from './components/modal';
import { tools } from './components/tools';
import { game } from './components/game';
import { box } from './components/box';
import { ViewError } from './lib/errors';
import { icon } from './components/icon';
// Konvaは最後に読み込むこと！
// エラー対策：Uncaught ReferenceError: __importDefault is not define
import * as Konva from 'konva';

declare const M: any;

export const view: () => View<State, Actions> = () => {
    // 初期化
    const hyperStage = new HyperStage();
    const hyperHammer = new HyperHammer();

    // ブロック
    const blocks = Array.from({ length: 23 * 10 }).map((ignore, index) => {
        const [ix, iy] = [index % 10, Math.floor(index / 10)];
        const py = 22 - iy;
        const box: Konva.Rect = new Konva.Rect({
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
        const box: Konva.Rect = new Konva.Rect({
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
        const layer = new Konva.Layer();
        for (const block of blocks) {
            layer.add(block.box);
        }
        for (const block of bottomBlocks) {
            layer.add(block.box);
        }
        hyperStage.addLayer(layer);
    }

    // 背景
    const background: Konva.Rect = new Konva.Rect({
        fill: '#333',
        strokeWidth: 0,
        opacity: 1,
    });
    const line = new Konva.Line({
        points: [],
        stroke: '#d8d8d8',
    });
    {
        const layer = new Konva.Layer();
        layer.add(background);
        layer.add(line);
        hyperStage.addLayer(layer);
    }

    const box2: () => Konva.Rect = () => {
        return new Konva.Rect({
            fill: '#333',
            strokeWidth: 2,
            stroke: '#333',
            opacity: 1,
        });
    };

    const parts: () => Konva.Rect[] = () => {
        return Array.from({ length: 4 }).map((ignore, index) => {
            return new Konva.Rect({
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
        const layer = new Konva.Layer();
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

    let openModalInstance: ModalInstance | undefined = undefined;

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

        const isHighlights = Array.from({ length: 24 }).map((ignore, lineIndex) => {
            return blocks.filter(value => value.iy === lineIndex)
                .every(value => state.field[value.ix + value.iy * 10].piece !== Piece.Empty);
        });

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

        const stopAnimation = () => {
            if (resources.handlers.animation !== undefined) {
                clearInterval(resources.handlers.animation);
                resources.handlers.animation = undefined;
            }
        };

        const startAnimation = () => {
            stopAnimation();
            resources.handlers.animation = setInterval(() => {
                actions.nextPage();
            }, state.play.intervalTime);
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
                stage: hyperStage,
                hammer: hyperHammer,
                backPage: () => {
                    actions.backPage();
                    if (state.play.status === AnimationState.Play) {
                        startAnimation();
                    }
                },
                nextPage: () => {
                    actions.nextPage();
                    if (state.play.status === AnimationState.Play) {
                        startAnimation();
                    }
                },
            }),
            div([   // canvas:Field とのマッピング用仮想DOM
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
                        highlight: blockValue.highlight || isHighlights[value.iy],
                        background: value.iy < 20 ? '#000' : '#333',
                    });
                }).concat(
                    bottomBlocks.map((value) => {
                        const blockValue = state.blockUp[value.ix + value.iy * 10];
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
                            highlight: blockValue.highlight || isHighlights[value.iy],
                            background: '#000',
                        });
                    }),
                )),
                box({
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
                nexts.map(value => box({
                    // key: `next-${value.index}`,
                    position: {
                        x: top.x + fieldSize.width + boxMargin / 2,
                        y: top.y + value.index * (boxSize + boxMargin),
                    },
                    size: boxSize,
                    rect: value,
                    visible: true,
                    piece: {
                        value: state.nexts !== undefined ? state.nexts[value.index] : undefined,
                        size: boxSize / 4 - 1,
                        margin: 1,
                    },
                })),
            ]),
            div([
                comment({
                    isChanged: state.comment.isChanged,
                    height: heights.comment,
                    text: state.comment.text,
                }),
                tools({
                    height: heights.tools,
                }, [
                    a({
                        className: 'modal-trigger',
                        href: '#open-modal',
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
                    }, state.play.pageIndex + 1 + ' / ' + state.maxPage),
                    a({
                        href: '#',
                        onclick: () => {
                            switch (state.play.status) {
                            case AnimationState.Play:
                                actions.pause();
                                stopAnimation();
                                break;
                            default:
                                actions.start();
                                startAnimation();
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
                        href: './help.html',
                        style: style({
                            marginLeft: 'auto',
                            position: 'absolute',
                            right: '10px',
                        }),
                    }, [
                        icon({
                            width: 45,
                            height: heights.tools,
                            scale: 0.625,
                        }, 'help_outline'),
                    ]),
                ]),
            ]),
            modal({
                id: 'open-modal',
                oncreate: (element: HTMLDivElement) => {
                    openModalInstance = M.Modal.init(element, {
                        onOpenEnd: () => {
                            const element = document.getElementById('open-textarea');
                            if (element !== null) {
                                element.focus();
                            }
                        },
                    });
                },
            }, [
                h4('テト譜を開く'),
                textarea({
                    id: 'open-textarea',
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
                    class: 'modal-action modal-close waves-effect waves-teal btn-flat',
                    onclick: () => {
                        actions.inputFumenData({ value: undefined });
                    },
                }, 'Cancel'),
                a({
                    class: 'waves-effect waves-teal btn-flat' + (
                        state.fumen.value === undefined || state.fumen.errorMessage !== undefined ? ' disabled' : ''
                    ),
                    onclick: () => {
                        if (state.fumen.value === undefined) {
                            actions.showOpenErrorMessage({ message: 'データを入力してください' });
                            return;
                        }

                        const backup = resources.pages.concat();
                        actions.pause();

                        try {
                            decode(extract(state.fumen.value), setPage);

                            if (openModalInstance !== undefined) {
                                openModalInstance.close();
                            }

                            actions.inputFumenData({ value: undefined });
                        } catch (e) {
                            resources.pages = backup;
                            actions.openPage({ pageIndex: state.play.pageIndex });
                            if (e instanceof ViewError) {
                                actions.showOpenErrorMessage({ message: e.message });
                            } else {
                                actions.showOpenErrorMessage({ message: 'テト譜を読み込めませんでした' });
                            }
                            return;
                        }
                    },
                }, 'Open'),
            ]),
        ]);
    };
};

export const router = app(initState, originActions, view(), document.body);

window.onresize = () => {
    router.resize({
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    });
};

const url = decodeURIComponent(location.search);
const paramQuery = url.substr(1).split('&').find(value => value.startsWith('d='));
const data = paramQuery !== undefined ? paramQuery.substr(2) : 'vhAAgH';

interface Resources {
    pages: Page[];
    handlers: {
        animation?: number;
    };
    fumen: {
        data?: string;
    };
}

interface Page {
    comment?: string;
    commentRef: number;
    field: Piece[];
    blockUp: Piece[];
    move: Move;
    quizOperation?: Operation;
    isLock: boolean;
}

interface Move {
    piece: Piece;
    rotation: Rotation;
    coordinate: {
        x: number,
        y: number,
    };
}

export const resources: Resources = {
    pages: [],
    handlers: {},
    fumen: {},
};

const extract = (data: string) => {
    const decoded = decodeURIComponent(data);
    const replaced = decoded.replace(/\?/g, '');

    for (const prefix of ['v115@', 'm115@', 'd115@']) {
        const index = replaced.indexOf(prefix);
        if (0 <= index) {
            return replaced.substr(index + prefix.length);
        }
    }

    if (data.includes('@')) {
        throw new ViewError('v115のデータのみ対応しています');
    }

    return replaced;
};

const setPage = (page: FumenPage) => {
    if (resources.pages.length <= page.index) {
        router.setMaxPage({ maxPage: page.index + 1 });
    }

    resources.pages[page.index] = {
        comment: page.comment,
        commentRef: page.commentRef,
        field: page.field,
        blockUp: page.blockUp,
        move: {
            piece: page.action.piece,
            rotation: page.action.rotation,
            coordinate: {
                x: page.action.coordinate.x,
                y: page.action.coordinate.y,
            },
        },
        quizOperation: page.quizOperation,
        isLock: page.action.isLock,
    };

    if (page.index === 0) {
        router.openPage({ pageIndex: page.index });
    } else if (page.isLastPage) {
        router.reload();
    }
};

try {
    decode(extract(data), setPage);
} catch (e) {
    router.setComment({ comment: 'テト譜を読み込めませんでした: ' + e.message });
}
