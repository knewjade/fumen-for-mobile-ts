import { Component } from '../../lib/types';
import { h } from 'hyperapp';
import konva from 'konva';

interface Props {
    rect: konva.Rect;
    canvas: {
        width: number;
        height: number;
    };
    actions: {
        ontapCanvas: (e: any) => void;
    };
}

export const EventCanvas: Component<Props> = ({ rect, canvas, actions }) => {
    const resize = () => rect.setSize(canvas);

    const oncreate = () => {
        resize();

        rect.show();
        rect.on('tap click', actions.ontapCanvas);
    };

    const onupdate = (container: any, attr: any) => {
        if (canvas.width !== attr.canvas.width || canvas.height !== attr.canvas.height) {
            resize();
        }
    };

    const ondestroy = () => {
        rect.off('tap click');
        rect.hide();
    };

    return <param key="reader-event-canvas" name="konva" value="event-box" canvas={canvas}
                  oncreate={oncreate} onupdate={onupdate} ondestroy={ondestroy}/>;
};
