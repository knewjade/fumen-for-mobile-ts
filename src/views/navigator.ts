import { a, div } from '@hyperapp/html';
import { px, style } from '../lib/types';
import { ColorPalette } from '../lib/colors';
import { i18n } from '../locales/keys';

interface Props {
    height: number;
    palette: ColorPalette;
    actions: {
        openInPC: () => void;
    };
}

export const navigatorElement = (
    { height, palette, actions }: Props,
) => {
    if (!height) {
        return undefined;
    }

    return div({
        className: `${palette.baseClass} lighten-5`,
        onclick: () => {
            actions.openInPC();
        },
        style: style({
            height: px(height),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '16px',
        }),
    }, [
        a({ href: '#' }, i18n.Navigator.OpenInPC()),
    ]);
};
