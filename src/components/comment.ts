import { Component, style } from '../lib/types';
import { div, input } from '@hyperapp/html';

interface CommentProps {
    height: number;
    textColor: string;
    backgroundColor: string;
    text: string;
}

export const comment: Component<CommentProps> = (props) => {
    return div({
        style: style({
            backgroundColor: props.backgroundColor,
            width: '100%',
            height: props.height + 'px',
            whiteSpace: 'nowrap',
        }),
    }, [
        input({
            type: 'text',
            style: style({
                color: props.textColor,
                width: '100%',
                height: props.height + 'px',
                lineHeight: props.height + 'px',
                boxSizing: 'border-box',
                textAlign: 'center',
                border: 'none',
            }),
            value: props.text,
            readonly: 'readonly',
        }),
    ]);
};
