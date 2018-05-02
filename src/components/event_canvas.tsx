import { Component } from '../lib/types';
import { h } from 'hyperapp';
import konva = require('konva');

interface Props {
    rect: konva.Rect;
    canvas: {
        width: number;
        height: number;
    };
    actions: {
        backPage: () => void;
        nextPage: () => void;
    };
}

export const EventCanvas: Component<Props> = ({ rect, canvas, actions }) => {
    const resize = () => rect.setSize(canvas);

    const oncreate = () => {
        resize();

        rect.on('tap click', (e: any) => {
            const stage = e.currentTarget.getStage() as konva.Stage;
            const { x } = stage.getPointerPosition();
            const { width } = stage.getSize();
            const touchX = x / width;
            if (touchX < 0.5) {
                actions.backPage();
            } else {
                actions.nextPage();
            }
        });
    };

    const onupdate = (container: any, attr: any) => {
        if (canvas.width !== attr.canvas.width || canvas.height !== attr.canvas.height) {
            resize();
        }
    };

    const ondestroy = () => {
        rect.off('tap click');
    };

    return <param name="konva" value="event-box" canvas={canvas}
                  oncreate={oncreate} onupdate={onupdate} ondestroy={ondestroy}/>;
};
