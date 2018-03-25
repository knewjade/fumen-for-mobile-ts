import { Component, style } from '../lib/types';
import { i } from '@hyperapp/html';

interface IconProps {
    height: number;
    scale: number;
    className?: string;
    onclick?: () => void;
    float?: 'left';
}

export const icon: Component<IconProps> = (props, children) => {
    const width = 65;
    const margin = 5;

    // z-depth-1
    let className = 'material-icons teal darken-3';
    if (props.className !== undefined && props.className !== '') {
        className = props.className + ' ' + className;
    }

    return i({
        className,
        style: style({
            fontSize: props.height * props.scale + 'px',
            height: props.height - margin * 2 + 'px',
            lineHeight: props.height - margin * 2 + 'px',
            width: width + 'px',
            margin: margin + 'px',
            border: 'solid 1px #26a69a',
            boxSizing: 'border-box',
            float: props.float,
            textAlign: 'center',
            cursor : 'pointer',
        }),
        onclick: props.onclick,
    }, children);
};
