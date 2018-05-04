import { h } from 'hyperapp';
import { i } from '@hyperapp/html';
import { Component, px, style } from '../../lib/types';

interface Props {
    width: number;
    iconName: string;
    sticky?: boolean;
    marginRight?: number;
    datatest?: string;
    colors: {
        baseClass: string;
        darkCode: string;
    };
    actions: {
        onclick(): void;
    };
}

interface IconProps {
    height: number;
    fontSize: number;
    colors: {
        baseClass: string;
        darkCode: string;
    };
}

export const ToolButton: Component<Props & IconProps> = (
    { height, width, fontSize, iconName, sticky = false, marginRight = 0, datatest, colors, actions },
) => {
    const aProperties = style({
        height: px(height),
        lineHeight: px(height),
        width: px(width),
        marginLeft: sticky ? 'auto' : undefined,
        position: sticky ? 'absolute' : undefined,
        right: sticky ? '10px' : undefined,
        marginRight: px(marginRight),
    });

    return (
        <a href="#"
           datatest={datatest}
           style={aProperties}
           onclick={() => actions.onclick()}>
            <Icon height={height} fontSize={fontSize} colors={colors}>{iconName}</Icon>
        </a>
    );
};

const Icon: Component<IconProps> = ({ height, fontSize, colors }, children) => {
    const properties = style({
        display: 'block',
        fontSize: px(fontSize),
        height: px(height),
        lineHeight: px(height),
        width: '100%',
        border: 'solid 1px ' + colors.darkCode,
        boxSizing: 'border-box',
        textAlign: 'center',
        cursor: 'pointer',
        color: '#fff',
    });

    const className = 'material-icons darken-3 ' + colors.baseClass;

    return <i className={className} style={properties}>{children}</i>;
};
