import { Component, style } from '../lib/types';
import { div, input } from '@hyperapp/html';

interface Props {
    dataTest: string;
    highlight: boolean;
    height: number;
    text: string;
}

export const comment: Component<Props> = (props) => {
    const commentStyle = style({
        width: '100%',
        height: props.height + 'px',
        lineHeight: props.height + 'px',
        fontSize: props.height * 0.6 + 'px',
        boxSizing: 'border-box',
        textAlign: 'center',
        border: 'none',
    });

    if (props.highlight) {
        commentStyle.color = '#fff';
    }

    return div({
        style: style({
            width: '100%',
            height: props.height + 'px',
            whiteSpace: 'nowrap',
        }),
    }, [
        input({
            dataTest: props.dataTest,
            type: 'text',
            className: props.highlight ? 'green darken-1' : '',
            style: commentStyle,
            value: props.text,
            readonly: 'readonly',
        }),
    ]);
};
