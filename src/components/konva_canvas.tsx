import { HyperStage } from '../lib/hyper';
import { Component, px, style } from '../lib/types';
import { resources } from '../states';
import { h } from 'hyperapp';
import konva from 'konva';

interface Props {
    hyperStage: HyperStage;
    canvas: {
        width: number;
        height: number;
    };
    actions: {
        refresh: () => void;
    };
}

// 一度作成した後は、削除されないようにする
export const KonvaCanvas: Component<Props> = ({ canvas, hyperStage, actions }) => {
    const properties = style({
        width: px(canvas.width),
        height: px(canvas.height),
    });

    const oncreate = (element: HTMLDivElement) => {
        // この時点でcontainer内に新しい要素が作られるため、
        // この要素内には hyperapp 管理下の要素を作らないこと
        const stage = new konva.Stage({
            ...canvas,
            container: element,
        });

        // Layerの登録
        {
            stage.add(resources.konva.layers.background);
            stage.add(resources.konva.layers.field);
            stage.add(resources.konva.layers.boxes);
            stage.add(resources.konva.layers.overlay);
        }

        hyperStage.addStage(stage);

        actions.refresh();
    };

    const onupdate = (element: any, attr: any) => {
        if (canvas.width !== attr.canvas.width || canvas.height !== attr.canvas.height) {
            hyperStage.resize(canvas);
        }
    };

    const ondestroy = () => {
        hyperStage.removeStage();
    };

    return <div canvas={canvas} id="canvas-container" style={properties}
                oncreate={oncreate} onupdate={onupdate} ondestroy={ondestroy}/>;
};
