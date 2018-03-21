import { default as Konva } from 'konva';
import { KonvaError } from './error'; // 最後に読み込む Uncaught ReferenceError: __importDefault is not define


export class HyperStage {
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
            throw new KonvaError('Not found stage');
        }
        return this.stageObj;
    }

    get size(): {
        width: number;
        height: number;
    } {
        return this.stage.getSize();
    }

    batchDraw() {
        if (this.stageObj !== undefined) {
            this.stageObj.batchDraw();
        }
    }
}
