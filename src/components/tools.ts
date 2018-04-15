import { Component, style } from '../lib/types';
import { div, nav } from '@hyperapp/html';

interface ToolsProps {
    dataTest: string;
    height: number;
}

export const tools: Component<ToolsProps> = (props, children) => {
    return nav({
        dataTest: props.dataTest,
        className: 'teal page-footer tools',
        style: style({
            width: '100%',
            height: props.height + 'px',
            margin: 0,
            padding: 0,
        }),
    }, [
        div({
            className: 'nav-wrapper',
            style: style({
                width: '100%',
                height: props.height + 'px',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }),
        }, children),
    ]);
};
