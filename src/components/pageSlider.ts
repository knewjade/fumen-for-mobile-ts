import { div, input } from '@hyperapp/html';
import { Component, px, style } from '../lib/types';

interface Props {
    datatest: string;
    size: {
        width: number;
        height: number;
    };
    maxPage: number;
    currentIndex: number;
    actions: {
        openPageWhenChange: (data: { index: number }) => void;
    };
}

export const pageSlider: Component<Props> = ({ datatest, size, maxPage, currentIndex, actions }) => {
    const oninput = () => {
        const element = document.getElementById('input-page-number') as HTMLInputElement;
        if (element !== null) {
            const value = Number(element.value);
            actions.openPageWhenChange({ index: value - 1 });
        }
    };

    return div({
        className: 'range-field',
        style: style({
            width: px(size.width),
            height: px(size.height),
            margin: '0px auto',
        }),
    }, [
        input({
            oninput,
            datatest,
            id: 'input-page-number',
            type: 'range',
            min: '1',
            max: `${maxPage}`,
            value: `${currentIndex + 1}`,
        }),
    ]);
};
