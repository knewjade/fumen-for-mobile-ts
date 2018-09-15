import { Component, px, style } from '../lib/types';
import { div, input } from '@hyperapp/html';

interface Props {
    dataTest: string;
    key: string;
    id: string;
    textColor: string;
    backgroundColorClass: string;
    height: number;
    text: string;
    readonly: boolean;
    placeholder?: string;
    actions?: {
        onkeypress: (event: KeyboardEvent) => void;
        onfocus: (event: TextEvent) => void;
        onblur: (event: TextEvent) => void;
    };
}

export const comment: Component<Props> = (
    { height, textColor, backgroundColorClass, dataTest, key, id, text, readonly, placeholder, actions },
) => {
    const commentStyle = style({
        width: '100%',
        height: px(height),
        lineHeight: px(height),
        fontSize: px(height * 0.6),
        boxSizing: 'border-box',
        textAlign: 'center',
        border: 'none',
        color: textColor,
    });

    return div({
        key,
        style: style({
            width: '100%',
            height: px(height),
            whiteSpace: 'nowrap',
        }),
    }, [
        input({
            key,
            dataTest,
            id,
            placeholder,
            onkeypress: actions !== undefined ? actions.onkeypress : undefined,
            onblur: actions !== undefined ? actions.onblur : undefined,
            onfocus: actions !== undefined ? actions.onfocus : undefined,
            type: 'text',
            className: backgroundColorClass,
            style: commentStyle,
            value: text,
            readonly: readonly ? 'readonly' : undefined,
        }),
    ]);
};
