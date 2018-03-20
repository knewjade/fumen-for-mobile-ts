import { View, VNode, VNodeChild } from 'hyperapp';
import { button, div, footer, main, span } from '@hyperapp/html';
import { action, Actions } from './actions';
import { State } from './states';
import * as Konva from 'konva';

interface Component<Props> {
    (props: Props, children?: VNodeChild<object | null>[]): VNode<object>;
}

export enum Piece {
    Empty = 0,
    I = 1,
    L = 2,
    O = 3,
    Z = 4,
    T = 5,
    J = 6,
    S = 7,
    Gray = 8,
}

export enum Rotate {
    Spawn = 0,
    Right = 1,
    Reverse = 2,
    Left = 3,
}

class HyperStage {
    private stageObj: Konva.Stage | undefined = undefined;
    private layerBuffer: Konva.Layer[] = [];

    addStage(stage: Konva.Stage) {
        this.stageObj = stage;
        while (0 < this.layerBuffer.length) {
            this.stageObj.add(this.layerBuffer.pop()!);
        }
    }

    addLayer(layer: Konva.Layer) {
        if (this.stageObj !== undefined) {
            this.stageObj.add(layer);
        } else {
            this.layerBuffer.push(layer);
        }
    }

    destroy() {
        if (this.stageObj !== undefined) {
            this.stageObj.destroy();
        }
    }

    resize({ width, height }: { width: number; height: number }) {
        if (this.stageObj !== undefined) {
            this.stageObj.setWidth(width);
            this.stageObj.setHeight(height);
        }
    }

    get stage(): Konva.Stage {
        if (this.stageObj === undefined) {
            throw new MyError();
        }
        return this.stageObj;
    }
}

// === メイン ===
export const view: () => View<State, Actions> = () => {
    const hyperStage = new HyperStage();
    const gameImpl = game(hyperStage);
    const fieldImpl = field(hyperStage);
    return (state, actions) => {
        return div({
            style: {
                display: 'flex',
                minHeight: '100%',
                flexDirection: 'column',
            },
        }, [
            gameImpl(state, actions),
            fieldImpl(state, actions),
            footer({
                style: {
                    flexBasis: '50px',
                    marginTop: 'auto',
                },
            }, [
                span(state.comment + state.count),
                div({
                    className: 'page-footer',
                }, [
                    button({ onclick: () => actions.up(1) }, 'up'),
                ]),
            ]),
        ]);
    };
};

export const game: (hyperStage: HyperStage) => View<State, Actions> = (hyperStage) => {
    const BOX_SIZE = 25;

    const width = window.innerWidth;
    const height = BOX_SIZE * 24;

    return (state, actions) => {
        return main({
            id: 'container',
            style: {
                flex: '1 0 auto',
            },
            oncreate: (container: HTMLMainElement) => {
                // この時点でcontainer内に新しい要素が作られるため、
                // この要素内には hyperapp 管理下の要素を作らないこと
                const stage = new Konva.Stage({
                    width,
                    height,
                    container,
                });

                hyperStage.addStage(stage);

                const hammer = new Hammer(container);
                hammer.get('pinch').set({ enable: true });
                hammer.on('tap pinch', (ev) => {
                    console.log(ev);
                    actions.up(1);
                    // container.textContent = ev.type + ' gesture detected.';
                });
            },
        });
    };
};

export const field: (hyperStage: HyperStage) => View<State, Actions> = (hyperStage) => {
    const layer = new Konva.Layer();

    const BOX_SIZE = 25;

    const rects: Component<RectProps>[] = [];
    for (let ix = 0; ix < 10; ix += 1) {
        for (let iy = 0; iy < 24; iy += 1) {
            const rectObj = rect(layer, { ix, iy, size: BOX_SIZE });
            rects.push(rectObj);
        }
    }

    hyperStage.addLayer(layer);

    return (state, actions) => {
        return div({
            key: 'field',
            style: {
                display: 'none',
            },
        }, rects.map(value => value({ state, off: actions.off })));
    };
};

interface RectArgs {
    ix: number;
    iy: number;
    size: number;
}

interface RectProps {
    state: State;
    off: (data: { x: number, y: number }) => action;
}

export const rect: (layer: Konva.Layer, args: RectArgs) => Component<RectProps> = (layer, args) => {
    const box: Konva.Rect = new Konva.Rect({
        x: args.ix * args.size,
        y: args.iy * args.size,
        width: args.size - 1,
        height: args.size - 1,
        stroke: 'white',
    });

    layer.add(box);

    return (props) => {
        return div({
            key: `rect-${args.ix}:${args.iy}`,
            style: {
                display: 'none',
            },
            value: props.state.field[args.iy * 10 + args.ix],
            oncreate: (container: HTMLDivElement) => {
                box.on('touchmove', () => {
                    props.off({ x: args.ix, y: args.iy });
                });
                if (props.state.field[args.iy * 10 + args.ix] === 1) {
                    box.fill('#333');
                } else {
                    box.fill('#599cff');
                }
                box.draw();
            },
            onupdate: (container: any, attr: any) => {
                if (props.state.field[args.iy * 10 + args.ix] === attr.value) {
                    return;
                }
                console.log('xx');
                if (props.state.field[args.iy * 10 + args.ix] === Piece.I) {
                    box.fill('#333');
                } else {
                    box.fill('#599cff');
                }
                box.draw();
            },
        });
    };
};
