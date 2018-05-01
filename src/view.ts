import { View } from 'hyperapp';
import { div } from '@hyperapp/html';
import { Actions } from './actions';
import { resources, State } from './states';
import { HyperStage } from './lib/hyper';
import { isMinoPiece, Piece } from './lib/enums';
import { comment } from './components/comment';
import { game } from './components/game';
import { getHighlightColor, getNormalColor } from './lib/colors';
import { Tools } from './components/tools';
import { OpenFumenModal, SettingsModal } from './components/modals';
import { Field } from './components/field/field';
import { Box } from './components/boxes/box';
import konva = require('konva');

// レイアウトを決める部分を外に出す
// konvaのshapeを外にプールする

export const view: () => View<State, Actions> = () => {
    // 初期化
    const hyperStage = new HyperStage();

    {
        hyperStage.addLayer(resources.konva.layers.background);
        hyperStage.addLayer(resources.konva.layers.field);
        hyperStage.addLayer(resources.konva.layers.boxes);
    }

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

        // Hold & Next
        for (const obj of nexts) {
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

    const decidePieceColor = (piece: Piece, highlight: boolean) => {
        return highlight ? getHighlightColor(piece) : getNormalColor(piece);
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

        const boxSize = Math.max(Math.min(fieldSize.width / 5 * 1.15, (canvas.width - fieldSize.width) / 2 - 15), 5);
        const boxMargin = boxSize / 4;

        const getPieceColorInBox = (piece?: Piece) => {
            return piece !== undefined && isMinoPiece(piece) ? decidePieceColor(piece, true) : '#000';
        };

        const batchDraw = () => hyperStage.batchDraw();

        return div({ oncreate: batchDraw, onupdate: batchDraw }, [ // Hyperappでは最上位のノードが最後に実行される
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
                Field({
                    fieldMarginWidth: bottomBorderWidth,
                    topLeft: top,
                    blockSize: size,
                    field: state.field,
                    sentLine: state.sentLine,
                }),

                // Hold
                state.hold !== undefined ? Box({
                    boxSize,
                    topLeft: {
                        x: top.x - (boxSize + boxMargin / 2),
                        y: top.y,
                    },
                    piece: isMinoPiece(state.hold) ? {
                        type: state.hold,
                        color: getPieceColorInBox(state.hold),
                        size: boxSize / 4 - 1,
                    } : undefined,
                }) : div(),

                // state.hold !== undefined && false ? box({
                //     key: 'hold',
                //     dataTest: 'box-hold',
                //     position: {
                //         x: top.x - (boxSize + boxMargin / 2),
                //         y: top.y,
                //     },
                //     box: {
                //         size: boxSize,
                //         color: '#333',
                //     },
                //     rect: hold,
                //     piece: {
                //         type: state.hold,
                //         color: getPieceColorInBox(state.hold),
                //         size: boxSize / 4 - 1,
                //     },
                // }) : undefined,
                // ...nexts.map(value => state.next !== undefined && state.next[value.index] !== undefined ? box({
                //     key: `next-${value.index}`,
                //     dataTest: `box-next-${value.index}`,
                //     position: {
                //         x: top.x + fieldSize.width + boxMargin / 2,
                //         y: top.y + value.index * (boxSize + boxMargin),
                //     },
                //     box: {
                //         size: boxSize,
                //         color: '#333',
                //     },
                //     rect: value,
                //     piece: {
                //         type: state.next[value.index],
                //         color: getPieceColorInBox(state.next[value.index]),
                //         size: boxSize / 4 - 1,
                //     },
                // }) : undefined),
            ] as any),
            div({
                key: 'menu-top',
            }, [
                comment({
                    dataTest: `text-comment`,
                    highlight: state.comment.isChanged,
                    height: heights.comment,
                    text: state.comment.text,
                }),
                Tools({
                    actions,
                    height: heights.tools,
                    animationState: state.play.status,
                    pages: state.fumen.currentIndex + 1 + ' / ' + state.fumen.maxPage,
                }),
            ]),
            state.modal.fumen ? OpenFumenModal({
                actions,
                errorMessage: state.fumen.errorMessage,
                textAreaValue: state.fumen.value,
            }) : div(),
            state.modal.settings ? SettingsModal({
                actions,
                version: state.version,
            }) : div(),
        ]);
    };
};
