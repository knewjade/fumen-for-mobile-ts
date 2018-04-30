import { h } from 'hyperapp';
import { ComponentWithText, px, style } from '../lib/types';

interface Props {
    dataTest?: string;
    height: number;
    minWidth: number;
    fontSize: number;
    marginRight?: number;
}

export const ToolText: ComponentWithText<Props> = (
    { dataTest, height, fontSize, minWidth, marginRight = 0 }, children,
) => {
    const properties = style({
        lineHeight: px(height),
        fontSize: px(fontSize),
        minWidth: px(minWidth),
        textAlign: 'center',
        whiteSpace: 'nowrap',
        marginRight: px(marginRight),
    });

    return <span datatest={ dataTest } style={ properties }>{ children }</span>;
};
