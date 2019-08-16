import konva from 'konva';
import { VNode } from 'hyperapp';
import { div } from '@hyperapp/html';
import { px, style } from '../../lib/types';
import { forEach, isEqual } from 'lodash';

interface Size {
    width: number;
    height: number;
}

export enum Layers {
    Background = 'Background',
    Front = 'Front',
    Overlay = 'Overlay',
}

export class KonvaManager {
    stage: konva.Stage | undefined;
    private size: Size | undefined;

    private readonly layers: {
        background: konva.Layer;
        front: konva.Layer;
        overlay: konva.Layer;
    } = {
        background: new konva.Layer(),
        front: new konva.Layer(),
        overlay: new konva.Layer(),
    };

    addStage(stage: konva.Stage) {
        this.stage = stage;

        stage.add(this.layers.background);
        stage.add(this.layers.front);
        stage.add(this.layers.overlay);

        this.layers.background.setZIndex(0);
        this.layers.front.setZIndex(1);
        this.layers.overlay.setZIndex(2);
    }

    removeStage() {
        if (this.stage !== undefined) {
            this.stage.removeChildren();

            forEach(this.layers, (layer) => {
                layer.removeChildren();
            });

            this.stage = undefined;
        }
    }

    resize(size: { width: number; height: number }) {
        if (this.stage !== undefined) {
            this.stage.setSize(size);

            forEach(this.layers, (layer) => {
                layer.setSize(size);
            });

            this.size = { ...size };
        }
    }

    private batchDraw() {
        if (this.stage !== undefined) {
            this.stage.batchDraw();
        }
    }

    update(callback: () => void) {
        if (this.stage !== undefined) {
            callback();
            this.batchDraw();
        }
    }

    add(layers: Layers, shape: konva.Shape) {
        if (this.stage !== undefined) {
            switch (layers) {
            case Layers.Background:
                this.layers.background.add(shape);
                break;
            case Layers.Front:
                this.layers.front.add(shape);
                break;
            case Layers.Overlay:
                this.layers.overlay.add(shape);
                break;
            }
        }
    }

    render(size: { width: number, height: number }, refresh: () => void): VNode<object> {
        if (!isEqual(this.size, size)) {
            this.resize(size);
        }

        const oncreate = (element: HTMLDivElement) => {
            // この時点でcontainer内に新しい要素が作られるため、
            // この要素内には hyperapp 管理下の要素を作らないこと
            const stage = new konva.Stage({
                ...size,
                container: element,
            });

            this.addStage(stage);

            refresh();
        };

        return div({
            oncreate,
            ondestroy: this.removeStage,
            key: 'canvas',
            id: 'canvas-container',
            style: style({ width: px(size.width), height: px(size.height) }),
        }, []);
    }

    reload(completeCallback: (done: () => void) => void) {
        const stage = this.stage;
        if (stage !== undefined) {
            forEach(this.layers, (layer) => {
                layer.hide();
            });
            stage.batchDraw();

            completeCallback(() => {
                setTimeout(() => {
                    forEach(this.layers, (layer) => {
                        layer.show();
                    });
                    stage.batchDraw();
                }, 50);
            });
        }
    }
}
