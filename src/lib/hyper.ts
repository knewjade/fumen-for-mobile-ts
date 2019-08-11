import { resources } from '../states';
import konva from 'konva';

export class HyperStage {
    stage: konva.Stage | undefined;

    constructor() {
    }

    addStage(stage: konva.Stage) {
        this.stage = stage;
        this.stage.add(resources.konva.layers.background);
        this.stage.add(resources.konva.layers.field);
        this.stage.add(resources.konva.layers.boxes);
        this.stage.add(resources.konva.layers.overlay);
    }

    removeStage() {
        if (this.stage !== undefined) {
            this.stage.removeChildren();
            this.stage = undefined;
        }
    }

    get isReady() {
        return this.stage !== undefined;
    }

    resize(size: { width: number; height: number }) {
        if (this.stage !== undefined) {
            this.stage.setSize(size);
        }
    }

    batchDraw() {
        if (this.stage !== undefined) {
            this.stage.batchDraw();
        }
    }

    reload(completeCallback: (done: (waitMillSeconds?: number) => void) => void) {
        if (this.stage !== undefined) {
            console.log('reload');
            const stage = this.stage;

            // Layerを隠す
            setTimeout(async () => {
                const sleep = async (wait: number) => new Promise(resolved => setTimeout(resolved, wait));
                const hide = async (layer: konva.Layer) => {
                    layer.hide();
                    stage.batchDraw();
                    await sleep(4);
                };

                const layers = resources.konva.layers;

                await hide(layers.boxes);
                await hide(layers.field);
                await hide(layers.background);

                // callback処理完了を待つ
                completeCallback((waitMillSeconds) => {
                    const show = async (layer: konva.Layer) => {
                        layer.show();
                        stage.batchDraw();
                        await sleep(6);
                    };
                    const time = waitMillSeconds !== undefined ? waitMillSeconds : 30;

                    // waitしたあと、Layerを表示する
                    setTimeout(async () => {
                        await sleep(time);

                        await show(layers.background);
                        await show(layers.field);
                        await show(layers.boxes);
                    }, 0);
                });
            }, 0);
        }
    }
}
