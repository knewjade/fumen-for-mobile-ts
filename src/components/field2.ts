import { param } from '@hyperapp/html';
import { Component } from '../lib/types';
import konva = require('konva');

interface FieldProps {
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    borderPosition: {
        startX: number;
        endX: number;
        y: number;
    };
    borderWidth: number;
    background: konva.Rect;
    line: konva.Line;
}

export const field2: Component<FieldProps> = (props, children) => {
    return param({
        key: 'field2',
        position: props.position,
        size: props.size,
        borderPosition: props.borderPosition,
        borderWidth: props.borderWidth,
        oncreate: () => {
            props.background.setSize(props.size);
            props.background.setAbsolutePosition(props.position);

            const borderPosition = props.borderPosition;
            props.line.points([borderPosition.startX, borderPosition.y, borderPosition.endX, borderPosition.y]);
            props.line.strokeWidth(props.borderWidth);
        },
        onupdate: (ignore: any, attr: any) => {
            if (props.size.width !== attr.size.width || props.size.height !== attr.size.height) {
                props.background.setSize(props.size);
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                props.background.setAbsolutePosition(props.position);
            }

            const borderPosition = props.borderPosition;
            if (borderPosition.startX !== attr.borderPosition.startX ||
                borderPosition.endX !== attr.borderPosition.endX ||
                borderPosition.y !== attr.borderPosition.y) {
                props.line.points([borderPosition.startX, borderPosition.y, borderPosition.endX, borderPosition.y]);
            }
            if (props.borderWidth !== attr.borderWidth) {
                props.line.strokeWidth(props.borderWidth);
            }
        },
    }, children);
};
