import { Component } from '../lib/types';
import { h } from 'hyperapp';
import konva = require('konva');

interface Props {
    rect: konva.Rect;
    key: string;
    dataTest: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number,
        height: number,
    };
    color: string;
}

export const Block: Component<Props> = ({ key, dataTest, rect, color, position, size }) => {
    const resize = () => rect.setSize(size);
    const move = () => rect.setAbsolutePosition(position);
    const fill = () => rect.fill(color);

    const oncreate = () => {
        resize();
        move();
        fill();
        rect.show();
    };

    const onupdate = (container: any, attr: any) => {
        if (size.width !== attr.size.width || size.height !== attr.size.height) {
            resize();
        }
        if (position.x !== attr.position.x || position.y !== attr.position.y) {
            move();
        }
        if (color !== attr.color) {
            fill();
        }
    };

    const ondestroy = () => {
        rect.hide();
    };

    return <param name="konva" value="rect" key={key} datatest={dataTest}
                  oncreate={oncreate} onupdate={onupdate} ondestroy={ondestroy}
                  color={color} position={position} size={size}/>;
};
