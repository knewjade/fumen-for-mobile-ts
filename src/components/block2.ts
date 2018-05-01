import { param } from '@hyperapp/html';
import { Component } from '../lib/types';
import konva = require('konva');

interface BlockProps {
    dataTest: string;
    position: {
        x: number;
        y: number;
    };
    key: string;
    size: {
        width: number,
        height: number,
    };
    rect: konva.Rect;
    color: string;
}

export const block2: Component<BlockProps> = (props) => {
    function fill(block: konva.Rect) {
        block.fill(props.color);
    }

    function resize(block: konva.Rect) {
        block.setSize(props.size);
    }

    function move(block: konva.Rect) {
        block.setAbsolutePosition(props.position);
    }

    return param({
        dataTest: props.dataTest,
        key: props.key,
        size: props.size,
        color: props.color,
        position: props.position,
        oncreate: () => {
            resize(props.rect);
            move(props.rect);
            fill(props.rect);
        },
        onupdate: (container: any, attr: any) => {
            if (props.size.width !== attr.size.width || props.size.height !== attr.size.height) {
                resize(props.rect);
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                move(props.rect);
            }
            if (props.color !== attr.color) {
                fill(props.rect);
            }
        },
    });
};
