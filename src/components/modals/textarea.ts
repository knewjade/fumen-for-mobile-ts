import { Component, style } from '../../lib/types';
import { textarea } from '@hyperapp/html';

interface TextAreaProps {
    id: string;
    key: string;
    dataTest: string;
    placeholder: string;
    error: boolean;
    text: string;
    actions: {
        update: (data: { value: string }) => void;
    };
}

export const TextArea: Component<TextAreaProps> = (
    { id, key, dataTest, placeholder, error, text, actions },
) => {
    const textAreaStyle = style({
        width: '100%',
        border: error ? undefined : 'solid 1px #ff5252',
    });

    const oncreate = (element: HTMLInputElement) => {
        element.value = text;
    };

    const oninput = (event: KeyboardEvent) => {
        if (event.target !== null) {
            const target = event.target as HTMLInputElement;
            actions.update({ value: target.value });
        }
    };

    const onenter = (event: KeyboardEvent) => {
        if (event.target !== null) {
            const target = event.target as HTMLInputElement;
            target.blur();
        }
    };

    let lastComposingOnEnterDown = true;

    const onkeydown = (event: KeyboardEvent) => {
        // 最後にEnterを押されたときのisComposingを記録する
        // IMEで変換しているときはtrueになる
        if (event.key === 'Enter') {
            lastComposingOnEnterDown = event.isComposing;
        }
    };

    const onkeyup = (event: KeyboardEvent) => {
        // 最後にエンターが押されたか (IMEには反応しない)
        if (!event.isComposing && !lastComposingOnEnterDown && event.key === 'Enter') {
            onenter(event);
        }
    };

    return textarea({
        id,
        key,
        dataTest,
        placeholder,
        oncreate,
        oninput,
        onkeydown,
        onkeyup,
        rows: 3,
        style: textAreaStyle,
    });
};
