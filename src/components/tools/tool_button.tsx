import { h } from 'hyperapp';
import { Component, px, style } from '../../lib/types';
import { SizedIcon, SizedIconProps } from '../atomics/icons';

interface Props {
    width: number;
    iconName: string;
    sticky?: boolean;
    marginRight?: number;
    marginLeft?: number;
    datatest?: string;
    key: string;
    colors: {
        baseClass: string;
        baseCode: string;
        darkCode: string;
    };
    actions: {
        onclick?: (e: MouseEvent) => void;
    };
}

export const ToolButton: Component<Props & SizedIconProps> = (
    {
        height, width, fontSize, key, iconName, sticky = false,
        marginLeft = undefined, marginRight = 0,
        datatest, colors, enable = true, actions,
    },
) => {
    const aProperties = style({
        height: px(height),
        lineHeight: px(height),
        width: px(width),
        marginLeft: sticky ? 'auto' : marginLeft,
        position: sticky ? 'absolute' : undefined,
        right: sticky ? '10px' : undefined,
        marginRight: px(marginRight),
    });

    const onclick = actions.onclick;

    return (
        <a href="#"
           key={key}
           datatest={datatest}
           style={aProperties}
           onclick={onclick !== undefined ? (event: MouseEvent) => {
               onclick(event);
               event.stopPropagation();
               event.preventDefault();
           } : undefined}>
            <SizedIcon height={height} fontSize={fontSize} colors={colors} enable={enable}>
                {iconName}
            </SizedIcon>
        </a>
    );
};
