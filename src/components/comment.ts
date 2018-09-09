import { Component, px, style } from '../lib/types';
import { div, input } from '@hyperapp/html';

interface Props {
    dataTest: string;
    id: string;
    textColor: string;
    backgroundColorClass: string;
    height: number;
    text: string;
    readonly: boolean;
    placeholder?: string;
    actions?: {
        onkeyup: (event: KeyboardEvent) => void;
        onblur: (event: TextEvent) => void;
    };
}

export const comment: Component<Props> = (
    { height, textColor, backgroundColorClass, dataTest, id, text, readonly, placeholder, actions },
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
        style: style({
            width: '100%',
            height: px(height),
            whiteSpace: 'nowrap',
        }),
    }, [
        input({
            dataTest,
            id,
            placeholder,
            onkeyup: actions !== undefined ? actions.onkeyup : undefined,
            onblur: actions !== undefined ? actions.onblur : undefined,
            type: 'text',
            className: backgroundColorClass,
            style: commentStyle,
            value: text,
            readonly: readonly ? 'readonly' : undefined,
        }),
    ]);
};
