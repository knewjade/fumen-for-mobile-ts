import { app, View } from 'hyperapp';
import { a, div, h4, i, p, span } from '@hyperapp/html';
import { actions as originActions, Actions } from './actions';
import { Block, initState, State } from './states';
import { HyperHammer, HyperStage } from './lib/hyper';
import { parsePiece, parsePieceName, Piece } from './lib/enums';
import { FumenError } from './lib/error';
import { decode, getBlocks, isMino } from './lib/fumen';
import { ModalInstance, style } from './lib/types';
import { field } from './components/field';
import { block } from './components/block';
import { comment } from './components/comment';
import { modal } from './components/modal';
import { tools } from './components/tools';
import { game } from './components/game';
import { box } from './components/box';

// Konvaは最後に読み込むこと！
// エラー対策：Uncaught ReferenceError: __importDefault is not define
import * as Konva from 'konva';

declare const M: any;

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
            div([
                comment({
                    textColor: state.comment.textColor,
                    backgroundColor: state.comment.backgroundColor,
                    height: heights.comment,
                    text: state.comment.text,
                }),
                tools({
                    height: heights.tools,
                }, [
                    i({
                        className: 'right material-icons',
                        style: style({
                            lineHeight: heights.tools + 'px',
                            fontSize: heights.tools * 3 / 4 + 'px',
                            margin: 'auto 10px',
                        }),
                        onclick: () => instance!.open(),
                    }, 'menu'),
                    i({
                        className: 'material-icons',
                        style: style({
                            lineHeight: heights.tools + 'px',
                            fontSize: heights.tools * 3 / 4 + 'px',
                            marginLeft: '10px',
                            float: 'left',
                        }),
                        onclick: () => toggleAnimation(),
                    }, state.play.status !== 'pause' ? 'pause' : 'play_arrow'),
                    span({
                        style: style({
                            lineHeight: heights.tools + 'px',
                            fontSize: '20px',
                            marginLeft: '10px',
                            float: 'left',
                        }),
                    }, state.play.page + ' / X'),
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

function toggleAnimation() {
    if (interval !== undefined) {
        stop();
    } else {
        start();
    }
}

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

function start() {
    router.start();

    interval = setInterval(() => {
        nextPage();
    }, 600);
}

export function nextPage() {
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
    if (currentPage === 0) {
        const a = '<div style="position: fixed; top: 0; left: 0;">hello</div>';
        M.toast({ html: a, displayLength: 1000 });
    }
}

function stop() {
    if (interval !== undefined) {
        clearInterval(interval);
        interval = undefined;
        router.pause();
    }
}
