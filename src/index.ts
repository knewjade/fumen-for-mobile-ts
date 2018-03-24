import { app, View, VNode } from 'hyperapp';
import { a, button, div, h4, input, main, nav, p, param } from '@hyperapp/html';
import { action, actions as originActions, Actions } from './actions';
import { Block, initState, State } from './states';
import { HyperHammer, HyperStage } from './lib/hyper';
import { Piece } from './lib/enums';
import { FumenError, ViewError } from './lib/error';
import { decode, getBlocks, getPieces, isMino } from './lib/fumen';
import { CSSProperties } from 'typestyle/lib/types';
// Konvaは最後に読み込むこと！
// エラー対策：Uncaught ReferenceError: __importDefault is not define
import * as Konva from 'konva';

const style: (properties: CSSProperties) => CSSProperties = properties => properties;
declare const M: any;

interface ModalInstance {
    open: () => void;
    close: () => void;
    destroy: () => void;
}

export const view: () => View<State, Actions> = () => {
    // 初期化
    const hyperStage = new HyperStage();
    const hyperHammer = new HyperHammer();

    // ブロック
    const blocks = Array.from({ length: 24 * 10 }).map((ignore, index) => {
        const [ix, iy] = [index % 10, Math.floor(index / 10)];
        const py = 23 - iy;
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

    {
        const layer = new Konva.Layer();
        for (const block of blocks) {
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
    {
        const layer = new Konva.Layer();
        layer.add(background);
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
        comment: 30,
        tools: 50,
    };

    let instance: ModalInstance | undefined = undefined;
    // 全体の構成を1関数にまとめる
    return (state, actions) => {
        const canvas = {
            width: state.display.width,
            height: state.display.height - (heights.tools + heights.comment),
        };
        const size = Math.min(
            Math.floor(Math.min(canvas.height / 24, canvas.width / 10)) - 2,
            (canvas.width / 16),
        );

        const isHighlights = Array.from({ length: 24 }).map((ignore, lineIndex) => {
            return blocks.filter(value => value.iy === lineIndex)
                .every(value => state.field[value.ix + value.iy * 10].piece !== Piece.Empty);
        });

        const fieldSize = {
            width: (size + 1) * 10 + 1,
            height: (size + 1) * 24 + 1,
        };
        const top = {
            x: (canvas.width - fieldSize.width) / 2,
            y: (canvas.height - fieldSize.height) / 2,
        };
        const boxSize = Math.min(fieldSize.width / 5 * 1.2, (canvas.width - fieldSize.width) / 2);
        const boxMargin = boxSize / 4;

        const tap = (x: number) => {
            console.log(`${x} / ${canvas.width}`);
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
                countUp: actions.up,
            }),
            div([   // canvas:Field とのマッピング用仮想DOM
                field({
                    background,
                    position: top,
                    size: fieldSize,
                }, blocks.map((value) => {
                    const blockValue = state.field[value.ix + value.iy * 10];
                    return block({
                        size,
                        position: {
                            x: top.x + value.ix * size + value.ix + 1,
                            y: top.y + value.py * size + value.py + 1,
                        },
                        piece: blockValue.piece,
                        key: `block-${value.ix}-${value.iy}`,
                        rect: value.box,
                        highlight: blockValue.highlight || isHighlights[value.iy],
                    });
                })),
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
            menu([
                comment({
                    textColor: state.comment.textColor,
                    backgroundColor: state.comment.backgroundColor,
                    height: heights.comment,
                    text: state.count + state.comment.text,
                }),
                tools({
                    height: heights.tools,
                }, [
                    button({
                        className: 'right',
                        style: style({
                            height: heights.tools + 'px',
                        }),
                        onclick: () => instance!.open(),
                    }, 'Logo'),
                    button({ onclick: () => actions.up(1) }, 'countUp'),
                ]),
            ]),
            modal({
                oncreate: (element) => {
                    instance = M.Modal.init(element);
                },
            }, [
                h4('Modal Header'),
                p('A bunch of text'),
            ], [
                a({
                    href: '#!',
                    class: 'modal-action modal-close waves-effect waves-green btn-flat',
                }, 'Agree'),
            ]),
        ]);
    };
};
/*
<div class="nav-wrapper">
      <a href="#" class="brand-logo right">Logo</a>
      <ul id="nav-mobile" class="left hide-on-med-and-down">
        <li><a href="sass.html">Sass</a></li>
        <li><a href="badges.html">Components</a></li>
        <li><a href="collapsible.html">JavaScript</a></li>
      </ul>
    </div>
 */

type Children = string | number | (string | number | VNode<{}>)[];
type VNodeWithProps = (children?: Children) => VNode<any>;

export interface Component<Props = {}> {
    (props: Props, children?: Children): VNode<object>;
}

interface GameProps {
    canvas: {
        width: number;
        height: number;
    };
    stage: HyperStage;
    hammer: HyperHammer;
    countUp: (value: number) => action;
}

const game: Component<GameProps> = (props, children) => {
    return main({
        id: 'container',
        style: style({
            width: props.canvas.width,
            height: props.canvas.height + 'px',
        }),
        canvas: props.canvas,
        oncreate: (element: HTMLMainElement) => {
            // この時点でcontainer内に新しい要素が作られるため、
            // この要素内には hyperapp 管理下の要素を作らないこと
            const stage = new Konva.Stage({
                container: element,
                width: props.canvas.width,
                height: props.canvas.height,
            });

            props.stage.addStage(stage);

            const hammer = new Hammer(element);
            // hammer.get('pinch').set({ enable: true });

            const hyperHammer = props.hammer;
            hyperHammer.register(hammer);
            hyperHammer.tap = (event) => {
                console.log(`${event.center.x} / ${props.canvas.width}`);
            };
            hammer.on('tap', hyperHammer.tap);
        },
        onupdate: (element: any, attr: any) => {
            if (attr.canvas.width !== props.canvas.width || attr.canvas.height !== props.canvas.height) {
                props.stage.resize(props.canvas);
            }
            const hyperHammer = props.hammer;
            hyperHammer.tap = (event) => {
                if (event.center.x < props.canvas.width / 2) {
                    console.log('tap left');
                } else {
                    console.log('tap right');
                }
            };
        },
    }, children);
};

interface BlockProps {
    position: {
        x: number;
        y: number;
    };
    key: string;
    size: number;
    piece: Piece;
    rect: Konva.Rect;
    highlight: boolean;
}

const block: Component<BlockProps> = (props) => {
    function fill(block: Konva.Rect) {
        if (props.highlight) {
            block.fill(getHighlightColor(props.piece));
        } else {
            block.fill(getNormalColor(props.piece));
        }
    }

    function resize(block: Konva.Rect) {
        block.setSize({ width: props.size, height: props.size });
    }

    function move(block: Konva.Rect) {
        block.setAbsolutePosition(props.position);
    }

    return param({
        key: props.key,
        size: props.size,
        value: props.piece,
        highlight: props.highlight,
        position: props.position,
        oncreate: () => {
            move(props.rect);
            resize(props.rect);
            fill(props.rect);
        },
        onupdate: (container: any, attr: any) => {
            // console.log(container.attributes.x.value);
            if (props.piece !== attr.value || props.highlight !== attr.highlight) {
                fill(props.rect);
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                move(props.rect);
            }
            if (props.size !== attr.size) {
                resize(props.rect);
            }
        },
    });
};

interface FieldProps {
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    background: Konva.Rect;
}

const field: Component<FieldProps> = (props, children) => {
    return param({
        position: props.position,
        size: props.size,
        oncreate: () => {
            props.background.setSize(props.size);
            props.background.setAbsolutePosition(props.position);
        },
        onupdate: (ignore: any, attr: any) => {
            if (props.size.width !== attr.size.width || props.size.height !== attr.size.height) {
                props.background.setSize(props.size);
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                props.background.setAbsolutePosition(props.position);
            }
        },
    }, children);
};

interface BoxProps {
    position: {
        x: number;
        y: number;
    };
    size: number;
    rect: {
        box: Konva.Rect;
        parts: Konva.Rect[];
    };
    piece: {
        value?: Piece,
        size: number;
        margin: number;
    };
    visible: boolean;
}

const box: Component<BoxProps> = (props, children) => {
    function draw(parts: Konva.Rect[], piece: Piece) {
        const blocks = getPieces(piece).map(([x, y]) => [x, -y]);
        const max = {
            x: 0,
            y: 0,
        };
        const min = {
            x: 0,
            y: 0,
        };

        for (const [x, y] of blocks) {
            if (max.x < x) {
                max.x = x;
            } else if (x < min.x) {
                min.x = x;
            }

            if (max.y < y) {
                max.y = y;
            } else if (y < min.y) {
                min.y = y;
            }
        }

        const x2 = (max.x - min.x + 1) / 2 + min.x;
        const y2 = (max.y - min.y + 1) / 2 + min.y;

        const pieceSize = props.piece.size;
        const pieceMargin = props.piece.margin;
        const step: (n: number) => number = n => n * pieceSize + Math.floor(n) * pieceMargin;

        // console.log(x2, y2);
        const center = {
            x: props.position.x + props.size / 2,
            y: props.position.y + props.size / 2,
        };
        // console.log(center);

        for (let index = 0; index < blocks.length; index += 1) {
            const [x, y] = blocks[index];

            const part = parts[index];

            part.setAbsolutePosition({
                x: center.x + step(x - x2) + pieceMargin / 2,
                y: center.y + step(y - y2) + pieceMargin / 2,
            });
            part.setSize({ width: pieceSize, height: pieceSize });
            part.fill(getHighlightColor(piece));
        }
    }

    return param({
        position: props.position,
        size: props.size,
        piece: props.piece,
        oncreate: () => {
            props.rect.box.setSize({ width: props.size, height: props.size });
            props.rect.box.setAbsolutePosition(props.position);

            const piece = props.piece;
            if (piece.value === undefined) {
                props.rect.box.hide();

                for (const part of props.rect.parts) {
                    part.hide();
                }
            } else {
                props.rect.box.show();

                if (isMino(piece.value)) {
                    for (const part of props.rect.parts) {
                        part.show();
                    }
                    draw(props.rect.parts, piece.value);
                } else {
                    for (const part of props.rect.parts) {
                        part.hide();
                    }
                }
            }
        },
        onupdate: (ignore: any, attr: any) => {
            if (props.size !== attr.size) {
                props.rect.box.setSize({ width: props.size, height: props.size });
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                props.rect.box.setAbsolutePosition(props.position);
            }

            const piece = props.piece;
            if (piece.value === undefined) {
                props.rect.box.hide();

                for (const part of props.rect.parts) {
                    part.hide();
                }
            } else if (piece.value !== attr.piece.value
                || piece.size !== attr.piece.size
                || piece.margin !== attr.margin) {
                props.rect.box.show();

                if (isMino(piece.value)) {
                    for (const part of props.rect.parts) {
                        part.show();
                    }
                    draw(props.rect.parts, piece.value);
                } else {
                    for (const part of props.rect.parts) {
                        part.hide();
                    }
                }
            }
        },
    }, children);
};

const menu: VNodeWithProps = (children) => {
    return div(children);
};

interface CommentProps {
    height: number;
    textColor: string;
    backgroundColor: string;
    text: string;
}

const comment: Component<CommentProps> = (props) => {
    return div({
        style: style({
            backgroundColor: props.backgroundColor,
            width: '100%',
            height: props.height + 'px',
            whiteSpace: 'nowrap',
        }),
    }, [
        input({
            type: 'text',
            style: style({
                color: props.textColor,
                width: '100%',
                height: props.height + 'px',
                lineHeight: props.height + 'px',
                boxSizing: 'border-box',
                textAlign: 'center',
                border: 'none',
            }),
            value: props.text,
            readonly: 'readonly',
        }),
    ]);
};

interface ToolsProps {
    height: number;
}

const tools: Component<ToolsProps> = (props, children) => {
    return nav({
        className: 'page-footer',
        style: style({
            width: '100%',
            height: props.height + 'px',
            margin: 0,
            padding: 0,
        }),
    }, children);
};

interface ModalProps {
    oncreate: (element: any) => void;
}

const modal: (props: ModalProps, content: Children, footer: Children) => VNode<any> = (props, content, footer) => {
    return div({
        ...props,
        id: 'modal',
        className: 'modal bottom-sheet',
    }, [
        div({
            className: 'modal-content',
        }, content),
        div({
            className: 'modal-footer',
        }, footer),
    ]);
};

const router = app(initState, originActions, view(), document.body);

window.onresize = () => {
    router.refresh({
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    });
};

const paramQuery = location.search.substr(1).split('&').find(value => value.startsWith('d='));
// console.log(param.substr(2));

const data = paramQuery !== undefined ? paramQuery.substr(2) : 'vhAAgH';
//

const replaced = data.replace(/\?/g, '');
const pages = decode(replaced);
let interval: number | undefined;
let currentPage = 0;
let comment2 = '';

setTimeout(() => {
    start();
}, 0);

function toggleAnimation() {
    if (interval !== undefined) {
        stop();
    } else {
        start();
    }
}

function start() {
    const get = (value?: string) => {
        if (value === undefined || value === ']' || value === ')') {
            return '';
        }
        return value;
    };

    const nextQuiz = (quiz: string, use: Piece): string => {
        const name = parsePieceName(use);
        const indexHold = quiz.indexOf('[') + 1;
        const indexCurrent = quiz.indexOf('(') + 1;

        const holdName = get(quiz[indexHold]);
        const currentName = get(quiz[indexCurrent]);
        const nextName = get(quiz[indexCurrent + 2]);
        const least = get(quiz.substring(indexCurrent + 3));

        // console.log(quiz);
        // console.log(name, holdName, currentName, nextName);

        if (holdName === name) {
            return `#Q=[${currentName}](${nextName})` + least;
        }
        if (currentName === name) {
            return `#Q=[${holdName}](${nextName})` + least;
        }
        if (holdName === '') {
            return nextQuiz(`#Q=[${currentName}](${nextName})` + least, use);
        }

        throw new FumenError('Unexpected quiz');
    };

    interval = setInterval(() => {
        const page = pages[currentPage];
        const action = page.action;
        comment2 = action.isComment ? page.comment : comment2;

        const nextField: Block[] = page.field.map((value) => {
            return {
                piece: value,
            };
        });
        if (isMino(action.piece)) {
            const coordinate = action.coordinate;
            const blocks = getBlocks(action.piece, action.rotation);
            for (const block of blocks) {
                const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
                nextField[x + y * 10] = {
                    piece: action.piece,
                    highlight: true,
                };
            }
        }

        let hold;
        let nexts;
        let quiz2: string;
        if (comment2.startsWith('#Q=')) {
            quiz2 = nextQuiz(comment2, action.piece);

            const g: (s: string) => Piece = (s) => {
                const s2 = get(s);
                return s2 !== '' ? parsePiece(s2) : Piece.Empty;
            };

            const indexHold = quiz2.indexOf('[') + 1;
            const indexCurrent = quiz2.indexOf('(') + 1;
            hold = g(quiz2[indexHold]);
            // console.log(get(quiz2[indexCurrent]));
            nexts = (get(quiz2[indexCurrent]) + quiz2.substr(indexCurrent + 2, 4)).split('').map(g);
            // console.log(hold, nexts);
        }

        router.setFieldAndComment({
            hold,
            nexts,
            field: nextField,
            comment: comment2,
        });

        if (action.isLock && isMino(action.piece) && comment2.startsWith('#Q=')) {
            comment2 = quiz2!;
        }

        currentPage = (currentPage + 1) % pages.length;
    }, 600);
}

function stop() {
    if (interval !== undefined) {
        clearInterval(interval);
        interval = undefined;
    }
}

function getHighlightColor(piece: Piece): string {
    switch (piece) {
    case Piece.Gray:
        return '#CCCCCC';
    case Piece.I:
        return '#24CCCD';
    case Piece.T:
        return '#CE27CE';
    case Piece.S:
        return '#26CE22';
    case Piece.Z:
        return '#CE312D';
    case Piece.L:
        return '#CD9A24';
    case Piece.J:
        return '#3229CF';
    case Piece.O:
        return '#CCCE19';
    case Piece.Empty:
        return '#000000';
    }
    throw new ViewError('Not found highlight color: ' + piece);
}

function getNormalColor(piece: Piece): string {
    switch (piece) {
    case Piece.Gray:
        return '#999999';
    case Piece.I:
        return '#009999';
    case Piece.T:
        return '#9B009B';
    case Piece.S:
        return '#009B00';
    case Piece.Z:
        return '#9B0000';
    case Piece.L:
        return '#9A6700';
    case Piece.J:
        return '#0000BE';
    case Piece.O:
        return '#999900';
    case Piece.Empty:
        return '#000000';
    }
    throw new ViewError('Not found normal color: ' + piece);
}

function parsePieceName(piece: Piece) {
    // console.log(`piece: ${n}`);

    switch (piece) {
    case Piece.I:
        return 'I';
    case Piece.L:
        return 'L';
    case Piece.O:
        return 'O';
    case Piece.Z:
        return 'Z';
    case Piece.T:
        return 'T';
    case Piece.J:
        return 'J';
    case Piece.S:
        return 'S';
    }
    throw new FumenError('Unexpected piece');
}

function parsePiece(piece: string) {
    // console.log(`piece: ${n}`);

    switch (piece) {
    case 'I':
        return Piece.I;
    case 'L':
        return Piece.L;
    case 'O':
        return Piece.O;
    case 'Z':
        return Piece.Z;
    case 'T':
        return Piece.T;
    case 'J':
        return Piece.J;
    case 'S':
        return Piece.S;
    }
    throw new FumenError('Unexpected piece');
}
