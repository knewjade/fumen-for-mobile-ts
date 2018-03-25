import { Component, style } from '../lib/types';
import { div, input } from '@hyperapp/html';

interface CommentProps {
    isChanged: boolean;
    height: number;
    text: string;
}

export const comment: Component<CommentProps> = (props) => {
    const commentStyle = style({
        width: '100%',
        height: props.height + 'px',
        lineHeight: props.height + 'px',
        boxSizing: 'border-box',
        textAlign: 'center',
        border: 'none',
    });

    if (props.isChanged) {
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
            type: 'text',
            className: props.isChanged ? 'green darken-1' : '',
            style: commentStyle,
            value: props.text,
            readonly: 'readonly',
        }),
    ]);
};