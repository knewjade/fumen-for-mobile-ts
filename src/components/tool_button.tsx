import { h } from 'hyperapp';
import { i } from '@hyperapp/html';
import { Component, px, style } from '../lib/types';

interface Props {
    width: number;
    iconName: string;
    sticky?: boolean;
    marginRight?: number;
    datatest?: string;
    actions: {
        onclick(): void;
    };
}

interface IconProps {
    height: number;
    fontSize: number;
}

export const ToolButton: Component<Props & IconProps> = (
    { height, width, fontSize, iconName, sticky = false, marginRight = 0, datatest, actions },
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
           datatest={ datatest }
           style={ aProperties }
           onclick={ () => actions.onclick() }>
            <Icon height={ height } fontSize={ fontSize }>{ iconName }</Icon>
        </a>
    );
};

const Icon: Component<IconProps> = ({ height, fontSize }, children) => {
    const properties = style({
        display: 'block',
        fontSize: px(fontSize),
        height: px(height),
        lineHeight: px(height),
        width: '100%',
        border: 'solid 1px #999',
        boxSizing: 'border-box',
        textAlign: 'center',
        cursor: 'pointer',
        color: '#fff',
    });

    return <i className="material-icons teal darken-3" style={ properties }>{ children }</i>;
};
