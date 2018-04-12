import { HyperStage } from '../lib/hyper';
import { Component, style } from '../lib/types';
import { main } from '@hyperapp/html';
import konva = require('konva');

interface GameProps {
    key: string;
    canvas: {
        width: number;
        height: number;
    };
    stage: HyperStage;
    eventBox: konva.Rect;
    backPage: () => void;
    nextPage: () => void;
}

export const game: Component<GameProps> = (props, children) => {
    return main({
        id: 'canvas-container',
        key: props.key,
        style: style({
            width: props.canvas.width,
            height: props.canvas.height + 'px',
        }),
        canvas: props.canvas,
        oncreate: (element: HTMLMainElement) => {
            // この時点でcontainer内に新しい要素が作られるため、
            // この要素内には hyperapp 管理下の要素を作らないこと
            const stage = new konva.Stage({
                container: element,
                width: props.canvas.width,
                height: props.canvas.height,
            });

            props.stage.addStage(stage);
            props.eventBox.setSize(props.canvas);

            props.eventBox.on('tap click', (e: any) => {
                const stage = e.currentTarget.getStage() as konva.Stage;
                const { x } = stage.getPointerPosition();
                const { width } = stage.getSize();
                const touchX = x / width;
                if (touchX < 0.5) {
                    props.backPage();
                } else {
                    props.nextPage();
                }
            });
        },
        onupdate: (element: any, attr: any) => {
            if (attr.canvas.width !== props.canvas.width || attr.canvas.height !== props.canvas.height) {
                props.stage.resize(props.canvas);
                props.eventBox.setSize(props.canvas);
            }
        },
    }, children);
};
