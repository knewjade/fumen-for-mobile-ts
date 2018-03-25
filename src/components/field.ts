import { param } from '@hyperapp/html';
import { Component } from '../lib/types';
// Konvaは最後に読み込むこと！
// エラー対策：Uncaught ReferenceError: __importDefault is not define
import * as Konva from 'konva';

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
    background: Konva.Rect;
    line: Konva.Line;
}

export const field: Component<FieldProps> = (props, children) => {
    return param({
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
            console.log('update');
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
