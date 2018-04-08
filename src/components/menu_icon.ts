import { Component, style } from '../lib/types';
import { i } from '@hyperapp/html';

interface IconProps {
    width: number;
    height: number;
    scale: number;
}

export const menuIcon: Component<IconProps> = (props, children) => {
    const margin = 5;

    return i({
        className: 'material-icons teal darken-3',  // z-depth-1
        style: style({
            fontSize: props.height * props.scale + 'px',
            height: props.height - margin * 2 + 'px',
            lineHeight: props.height - margin * 2 + 'px',
            width: props.width + 'px',
            margin: margin + 'px',
            border: 'solid 1px #26a69a',
            boxSizing: 'border-box',
            textAlign: 'center',
            cursor: 'pointer',
        }),
    }, children);
};
