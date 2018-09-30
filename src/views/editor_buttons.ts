import { px, style } from '../lib/types';
import { a, div, i, img, span } from '@hyperapp/html';
import { EditorLayout } from './editor';
import { VNode } from 'hyperapp';
import { parsePieceName, Piece } from '../lib/enums';

export const colorButton = ({ layout, piece, highlight, colorize, onclick }: {
    layout: EditorLayout,
    piece: Piece,
    highlight: boolean,
    colorize: boolean,
    onclick: (data: { piece: Piece }) => void,
}) => {
    const borderWidth = highlight ? 3 : 1;
    const pieceName = parsePieceName(piece);

    const contents = [
        img({
            src: colorize ? `img/${pieceName}.svg` : `img/${pieceName}_classic.svg`,
            height: `${0.55 * layout.buttons.size.height}`,
            style: style({
                margin: 'auto',
            }),
        }),
    ];

    return toolButton({
        borderWidth,
        width: layout.buttons.size.width,
        margin: 5,
        backgroundColorClass: 'white',
        textColor: '#333',
        borderColor: highlight ? '#ff5252' : '#333',
        datatest: `btn-piece-${pieceName.toLowerCase()}`,
        key: `btn-piece-${pieceName.toLowerCase()}`,
        onclick: () => onclick({ piece }),
    }, contents);
};

export const inferenceButton = ({ layout, highlight, actions }: {
    layout: EditorLayout,
    highlight: boolean,
    actions: {
        selectInferencePieceColor: () => void;
    },
}) => {
    const contents = iconContents({
        description: 'comp',
        iconSize: 22,
        iconName: 'image_aspect_ratio',
    });
    const borderWidth = highlight ? 3 : 1;

    return toolButton({
        borderWidth,
        width: layout.buttons.size.width,
        margin: 5,
        backgroundColorClass: 'white',
        textColor: '#333',
        borderColor: highlight ? '#ff5252' : '#333',
        datatest: 'btn-piece-inference',
        key: 'btn-piece-inference',
        onclick: () => actions.selectInferencePieceColor(),
    }, contents);
};

export const iconContents = (
    { description, iconSize, iconName }: {
        description: string;
        iconSize: number;
        iconName: string;
    },
) => {
    const properties = style({
        display: 'block',
        fontSize: px(iconSize),
        border: 'solid 0px #000',
        marginRight: px(2),
        cursor: 'pointer',
    });

    const className = 'material-icons left';

    const icon = i({
        className,
        style: properties,
    }, iconName);

    return [icon, ' ', span({ style: style({ fontSize: px(11) }) }, description)];
};

export const switchIconContents = (
    { description, iconSize, enable }: {
        description: string;
        iconSize: number;
        enable: boolean;
    },
) => {
    const properties = style({
        display: 'block',
        fontSize: px(iconSize),
        border: 'solid 0px #000',
        marginRight: px(2),
        cursor: 'pointer',
    });

    const className = 'material-icons left';

    const icon = i({
        className,
        style: properties,
    }, enable ? 'check_box' : 'check_box_outline_blank');

    return [icon, ' ', span({ style: style({ fontSize: px(11) }) }, description)];
};

export const radioIconContents = (
    { description, iconSize, enable }: {
        description: string;
        iconSize: number;
        enable: boolean;
    },
) => {
    const properties = style({
        display: 'block',
        border: 'solid 0px #000',
        marginRight: px(2),
        cursor: 'pointer',
    });

    const className = 'material-icons left';

    const icon = i({
        className,
        style: properties,
    }, enable ? 'radio_button_checked' : 'radio_button_unchecked');

    return [icon, ' ', span({ style: style({ fontSize: px(11) }) }, description)];
};

export const keyButton = (
    { width, height, toolButtonMargin, keyPage, currentIndex, actions }: {
        width: number;
        height: number;
        toolButtonMargin: number;
        keyPage: boolean;
        currentIndex: number;
        actions: {
            changeToRef: (data: { index: number }) => void;
            changeToKey: (data: { index: number }) => void;
        };
    }) => {
    const keyOnclick = keyPage ?
        () => actions.changeToRef({ index: currentIndex })
        : () => actions.changeToKey({ index: currentIndex });

    return switchButton({
        width,
        borderWidth: 1,
        margin: toolButtonMargin,
        backgroundColorClass: 'red',
        textColor: '#333',
        borderColor: '#f44336',
        datatest: 'btn-key-page',
        key: 'btn-key-ref-page',
        onclick: keyOnclick,
        enable: keyPage,
    }, switchIconContents({
        description: 'key',
        iconSize: 18,
        enable: keyPage,
    }));
};

export const toolButton = (
    {
        width, backgroundColorClass, textColor, borderColor, borderWidth = 1, borderType = 'solid',
        datatest, key, onclick, flexGrow, margin, enable = true,
    }: {
        flexGrow?: number;
        width: number;
        margin: number;
        backgroundColorClass: string;
        textColor: string;
        borderColor: string;
        borderWidth?: number;
        borderType?: string;
        datatest: string;
        key: string;
        enable?: boolean;
        onclick: (event: MouseEvent) => void;
    },
    contents: string | number | (string | number | VNode<{}>)[],
) => {
    return a({
        datatest,
        key,
        href: '#',
        class: `waves-effect z-depth-0 btn-flat ${backgroundColorClass} ${enable ? '' : 'disabled'}`,
        style: style({
            flexGrow,
            color: enable ? textColor : '#9e9e9e',
            border: enable ? `${borderType} ${borderWidth}px ${borderColor}` : 'solid 1px #9e9e9e',
            margin: `${px(margin)} 0px`,
            padding: px(0),
            width: px(width),
            maxWidth: px(width),
            textAlign: 'center',
        }),
        onclick: (event: MouseEvent) => {
            onclick(event);
            event.stopPropagation();
            event.preventDefault();
        },
    }, [
        div({
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
            },
        }, contents),
    ]);
};

export const dualButton = (
    {
        width, backgroundColorClass, textColor, borderColor, borderWidth = 1, borderType = 'solid', flexGrow, margin,
    }: {
        flexGrow?: number;
        width: number;
        margin: number;
        backgroundColorClass: string;
        textColor: string;
        borderColor: string;
        borderWidth?: number;
        borderType?: string;
    },
    left: {
        datatest: string;
        key: string;
        enable?: boolean;
        contents: string | number | (string | number | VNode<{}>)[];
        onclick: (event: MouseEvent) => void;
    },
    right: typeof left) => {

    const button = ({ datatest, key, contents, onclick, enable = true, margin }: typeof left & { margin: string }) => {
        return a({
            datatest,
            key,
            href: '#',
            class: `waves-effect z-depth-0 btn-flat ${backgroundColorClass} ${enable ? '' : 'disabled'}`,
            style: style({
                margin,
                color: enable ? textColor : '#9e9e9e',
                border: enable ? `${borderType} ${borderWidth}px ${borderColor}` : 'solid 1px #9e9e9e',
                padding: px(0),
                width: '50%',
                maxWidth: '50%',
                textAlign: 'center',
            }),
            onclick: (event: MouseEvent) => {
                onclick(event);
                event.stopPropagation();
                event.preventDefault();
            },
        }, [
            div({
                style: {
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                },
            }, contents),
        ]);
    };

    return div({
        style: style({
            flexGrow,
            width: px(width),
            maxWidth: px(width),
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            margin: `${px(margin)} 0px`,
            padding: px(0),
        }),
    }, [
        button({ ...left, margin: '0px 2px 0px 0px' }),
        button({ ...right, margin: '0px 0px 0px 2px' }),
    ]);
};

export const switchButton = (
    {
        width, backgroundColorClass, textColor, borderColor, borderWidth = 1,
        datatest, key, onclick, flexGrow, margin, enable,
    }: {
        flexGrow?: number;
        width: number;
        margin: number;
        backgroundColorClass: string;
        textColor: string;
        borderColor: string;
        borderWidth?: number;
        datatest: string;
        key: string;
        enable: boolean;
        onclick: (event: MouseEvent) => void;
    },
    contents: string | number | (string | number | VNode<{}>)[],
) => {
    return a({
        key,
        href: '#',
        class: `waves-effect z-depth-0 btn-flat ${enable ? backgroundColorClass : 'white'}`,
        datatest: `${datatest}-${enable ? 'on' : 'off'}`,
        style: style({
            flexGrow,
            color: enable ? '#fff' : textColor,
            border: enable ? `solid ${borderWidth}px ${borderColor}` : 'dashed 1px #333',
            margin: `${px(margin)} 0px`,
            padding: px(0),
            width: px(width),
            maxWidth: px(width),
            textAlign: 'center',
        }),
        onclick: (event: MouseEvent) => {
            onclick(event);
            event.stopPropagation();
            event.preventDefault();
        },
    }, [
        div({
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
            },
        }, contents),
    ]);
};

export const toolSpace = (
    { width, key, flexGrow, margin }: {
        flexGrow?: number;
        width: number;
        margin: number;
        key: string;
    }) => {
    return div({
        key,
        class: 'white',
        style: style({
            flexGrow,
            color: '#fff',
            borderWidth: px(0),
            margin: `${px(margin)} 0px`,
            padding: px(0),
            width: px(width),
            maxWidth: px(width),
            boxSizing: 'border-box',
            textAlign: 'center',
        }),
    }, []);
};
