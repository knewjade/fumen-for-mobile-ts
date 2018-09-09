import { Component, px, style } from '../lib/types';
import { div, input } from '@hyperapp/html';

interface Props {
    dataTest: string;
    textColor: string;
    backgroundColorClass: string;
    height: number;
    text: string;
    readonly: boolean;
    placeholder?: string;
    actions?: {
        oninput: (data: { text?: string }) => void;
        onblur: (data: { text?: string }) => void;
    };
}

export const comment: Component<Props> = (
    { height, textColor, backgroundColorClass, dataTest, text, readonly, placeholder, actions },
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

    const oninput = actions !== undefined ? (e: TextEvent) => {
        if (e.target === null) {
            return;
        }

        const target = e.target as HTMLTextAreaElement;
        const value = target.value !== '' ? target.value : '';
        actions.oninput({ text: value });
    } : undefined;

    const onblur = actions !== undefined ? (e: TextEvent) => {
        if (e.target === null) {
            return;
        }

        const target = e.target as HTMLTextAreaElement;
        const value = target.value !== '' ? target.value : '';
        actions.onblur({ text: value });
    } : undefined;

    return div({
        style: style({
            width: '100%',
            height: px(height),
            whiteSpace: 'nowrap',
        }),
    }, [
        input({
            dataTest,
            placeholder,
            oninput,
            onblur,
            type: 'text',
            className: backgroundColorClass,
            style: commentStyle,
            value: text,
            readonly: readonly ? 'readonly' : undefined,
        }),
    ]);
};
