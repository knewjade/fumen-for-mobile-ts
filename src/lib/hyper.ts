import konva = require('konva');

export class HyperStage {
    private stage: konva.Stage | undefined;

    constructor() {
    }

    addStage(stage: konva.Stage) {
        this.stage = stage;
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
}
