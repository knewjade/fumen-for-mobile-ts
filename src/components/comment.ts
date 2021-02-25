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
    currentIndex: number;
    actions: {
        updateCommentText: (data: { text?: string, pageIndex: number }) => void;
        commitCommentText: () => void;
    };
}

export const comment: Component<Props> = (
    {
        height, textColor, backgroundColorClass, dataTest, key, id, text, readonly, placeholder, commentKey,
        currentIndex, actions,
    },
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

    const oncreate = (element: HTMLInputElement) => {
        element.value = text;
    };

    const onUpdate = (event: KeyboardEvent) => {
        if (event.target !== null) {
            const target = event.target as HTMLInputElement;
            actions.updateCommentText({ text: target.value, pageIndex: currentIndex });
        }
    };

    const onEnter = (event: KeyboardEvent) => {
        if (event.target !== null) {
            const target = event.target as HTMLInputElement;
            target.blur();
        }
    };

    const onBlur = () => {
        actions.commitCommentText();
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
            oncreate,
            type: 'text',
            className: backgroundColorClass,
            style: commentStyle,
            // value: text,  // 更新するたびにそれまで入力していた文字も消えてしまうため、onupdateで変更を最小限にする
            readonly: readonly ? 'readonly' : undefined,
            onkeydown: !readonly ? (event: KeyboardEvent & { isComposing: boolean }) => {
                // 最後にEnterを押されたときのisComposingを記録する
                // IMEで変換しているときはtrueになる
                if (event.key === 'Enter') {
                    lastComposingOnEnterDown = event.isComposing;
                }
            } : undefined,
            onkeyup: !readonly ? (event: KeyboardEvent & { isComposing: boolean }) => {
                // テキストの更新
                onUpdate(event);

                if (!event.isComposing && !lastComposingOnEnterDown && event.key === 'Enter') {
                    // エンターが押された (IMEには反応しない)
                    onEnter(event);
                }
            } : undefined,
            onblur: !readonly ? () => {
                onBlur();
            } : undefined,
        }),
    ]);
};
