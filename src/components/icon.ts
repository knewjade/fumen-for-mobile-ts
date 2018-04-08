import { Component, style } from '../lib/types';
import { i } from '@hyperapp/html';

interface IconProps {
    width: number;
    height: number;
    scale: number;
    display?: 'block';
    color?: string;
    depth?: boolean;
}

export const icon: Component<IconProps> = (props, children) => {
    const margin = 5;

    let className = 'material-icons';
    if (props.color === undefined) {
        className += ' teal darken-3';
    }
    if (props.depth) {
        className += ' z-depth-1';
    }

    return i({
        className,
        style: style({
            color: props.color,
            display: props.display,
            fontSize: props.height * props.scale + 'px',
            height: props.height - margin * 2 + 'px',
            lineHeight: props.height - margin * 2 + 'px',
            width: props.width + 'px',
            margin: margin + 'px',
            border: 'solid 1px #999',
            boxSizing: 'border-box',
            textAlign: 'center',
            cursor: 'pointer',
        }),
    }, children);
};
