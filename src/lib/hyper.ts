import konva = require('konva');

export class HyperStage {
    private stageObj: konva.Stage | undefined = undefined;
    private readonly layerBuffer: konva.Layer[] = [];

    addStage(stage: konva.Stage) {
        this.stageObj = stage;

        while (0 < this.layerBuffer.length) {
            const layer = this.layerBuffer.shift()!;
            this.stageObj.add(layer);
        }
    }

    addLayer(layer: konva.Layer) {
        if (this.stageObj !== undefined) {
            this.stageObj.add(layer);
        } else {
            this.layerBuffer.push(layer);
        }
    }

    resize(size: { width: number; height: number }) {
        if (this.stageObj !== undefined) {
            this.stageObj.setSize(size);
        }
    }

    batchDraw() {
        if (this.stageObj !== undefined) {
            this.stageObj.batchDraw();
        }
    }
}
