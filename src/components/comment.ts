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
    commentKey: string;
    actions?: {
        onenter: () => void;
        onupdate: () => void;
    };
}

export const comment: Component<Props> = (
    { height, textColor, backgroundColorClass, dataTest, key, id, text, readonly, placeholder, commentKey, actions },
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

    const create = (element: HTMLInputElement) => {
        update(element, {});
    };

    const update = (element: HTMLInputElement, oldAttributes: { commentKey?: string }) => {
        if (oldAttributes.commentKey !== commentKey) {
            element.value = text;
        }
    };

    let lastComposingOnEnterDown = true;

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
            commentKey,
            type: 'text',
            className: backgroundColorClass,
            style: commentStyle,
            // value: text,  // 更新するたびにそれまで入力していた文字も消えてしまうため、onupdateで変更を最小限にする
            readonly: readonly ? 'readonly' : undefined,
            oncreate: create,
            onupdate: update,
            onkeydown: actions !== undefined ? (event: KeyboardEvent & { isComposing: boolean }) => {
                // 最後にEnterを押されたときのisComposingを記録する
                // IMEで変換しているときはtrueになる
                if (event.key === 'Enter') {
                    lastComposingOnEnterDown = event.isComposing;
                }
            } : undefined,
            onkeyup: actions !== undefined ? (event: KeyboardEvent & { isComposing: boolean }) => {
                if (!event.isComposing) {
                    // テキストの更新
                    actions.onupdate();

                    if (!lastComposingOnEnterDown && event.key === 'Enter') {
                        // エンターが押された (IMEには反応しない)
                        actions.onenter();
                    }
                }
            } : undefined,
        }),
    ]);
};
