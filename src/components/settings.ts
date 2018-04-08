import { Component, style } from '../lib/types';
import { div } from '@hyperapp/html';

interface SettingsProps {
}

export const settings: Component<SettingsProps> = (props, children) => {
    return div({
        style: style({
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'start',
            alignItems: 'center',
        }),
    }, children);
};
