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
    background: Konva.Rect;
}

export const field: Component<FieldProps> = (props, children) => {
    return param({
        position: props.position,
        size: props.size,
        oncreate: () => {
            props.background.setSize(props.size);
            props.background.setAbsolutePosition(props.position);
        },
        onupdate: (ignore: any, attr: any) => {
            if (props.size.width !== attr.size.width || props.size.height !== attr.size.height) {
                props.background.setSize(props.size);
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                props.background.setAbsolutePosition(props.position);
            }
        },
    }, children);
};
