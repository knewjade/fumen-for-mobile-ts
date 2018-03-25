import { Component, style } from '../lib/types';
import { div, nav } from '@hyperapp/html';

interface ToolsProps {
    height: number;
}

export const tools: Component<ToolsProps> = (props, children) => {
    return nav({
        className: 'teal page-footer',
        style: style({
            width: '100%',
            height: props.height + 'px',
            margin: 0,
            padding: 0,
        }),
    }, [
        div({
            className: 'nav-wrapper',
        }, children),
    ]);
};
