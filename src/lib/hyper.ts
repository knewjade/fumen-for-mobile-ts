import konva = require('konva');

export class HyperStage {
    private stageObj: konva.Stage | undefined = undefined;
    private readonly layerBuffer: konva.Layer[] = [];

    addStage(stage: konva.Stage) {
        this.stageObj = stage;
        while (0 < this.layerBuffer.length) {
            this.stageObj.add(this.layerBuffer.pop()!);
        }
    }

    addLayer(layer: konva.Layer) {
        if (this.stageObj !== undefined) {
            this.stageObj.add(layer);
        } else {
            this.layerBuffer.push(layer);
        }
    }

    resize({ width, height }: { width: number; height: number }) {
        if (this.stageObj !== undefined) {
            this.stageObj.setWidth(width);
            this.stageObj.setHeight(height);
        }
    }

    batchDraw() {
        if (this.stageObj !== undefined) {
            this.stageObj.batchDraw();
        }
    }
}

interface HammerCallbacks {
    tap: (event: HammerInput) => void;
}

export class HyperHammer {
    private hammerObj: HammerManager | undefined = undefined;
    private readonly callbacks: HammerCallbacks = {
        tap: () => {
        },
    };

    register(obj: HammerManager) {
        this.hammerObj = obj;
    }

    get tap(): (event: HammerInput) => void {
        return (event) => {
            this.callbacks.tap(event);
        };
    }

    set tap(callback: (event: HammerInput) => void) {
        this.callbacks.tap = callback;
    }
}
