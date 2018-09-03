import { px, style } from '../lib/types';
import { a, div, i, img, span } from '@hyperapp/html';
import { EditorLayout } from './editor';
import { VNode } from 'hyperapp';
import { parsePieceName, Piece } from '../lib/enums';

export const colorButton = ({ layout, piece, highlight, actions }: {
    layout: EditorLayout,
    piece: Piece,
    highlight: boolean,
    actions: {
        selectPieceColor: (data: { piece: Piece }) => void,
    },
}) => {
    const borderWidth = highlight ? 3 : 1;
    const pieceName = parsePieceName(piece);

    const contents = [
        img({
            src: `img/${pieceName}.svg`,
            height: (0.6 * layout.buttons.size.height) + '',
            style: style({
                margin: 'auto',
            }),
        }),
    ];

    return toolButton({
        borderWidth,
        contents,
        width: layout.buttons.size.width,
        margin: 5,
        backgroundColorClass: 'white',
        textColor: '#333',
        borderColor: highlight ? '#ff8a80' : '#333',
        datatest: `btn-piece-${pieceName.toLowerCase()}`,
        key: `btn-piece-${pieceName.toLowerCase()}`,
        onclick: () => actions.selectPieceColor({ piece }),
    });
};

export const inferenceButton = ({ layout, highlight, actions }: {
    layout: EditorLayout,
    highlight: boolean,
    actions: {
        selectInferencePieceColor: () => void;
    },
}) => {
    const contents = iconContents({
        height: layout.buttons.size.height,
        description: 'comp',
        iconSize: 22,
        iconName: 'image_aspect_ratio',
    });
    const borderWidth = highlight ? 3 : 1;

    return toolButton({
        borderWidth,
        contents,
        width: layout.buttons.size.width,
        margin: 5,
        backgroundColorClass: 'white',
        textColor: '#333',
        borderColor: highlight ? '#ff8a80' : '#333',
        datatest: 'btn-piece-inference',
        key: 'btn-piece-inference',
        onclick: () => actions.selectInferencePieceColor(),
    });
};

export const iconContents = (
    { height, description, iconSize, iconName }: {
        height: number;
        description: string;
        iconSize: number;
        iconName: string;
    },
) => {
    const properties = style({
        display: 'block',
        height: px(height),
        lineHeight: px(height),
        fontSize: px(iconSize),
        border: 'solid 0px #000',
        marginRight: px(2),
        cursor: 'pointer',
    });

    const className = 'material-icons';

    const icon = i({
        className,
        style: properties,
    }, iconName);

    return [icon, span({ style: style({ fontSize: px(10) }) }, description)];
};

export const toolButton = (
    {
        width, backgroundColorClass, textColor, borderColor, borderWidth = 1,
        datatest, key, onclick, contents, flexGrow, margin,
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
        contents: string | number | (string | number | VNode<{}>)[];
        onclick: (event: MouseEvent) => void;
    }) => {
    return a({
        datatest,
        key,
        class: `waves-effect z-depth-0 btn ${backgroundColorClass}`,
        style: style({
            flexGrow,
            color: textColor,
            border: `solid ${borderWidth}px ${borderColor}`,
            marginTop: px(margin),
            marginBottom: px(margin),
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
            border: `solid 0px #fff`,
            marginTop: px(margin),
            width: px(width),
            maxWidth: px(width),
            padding: px(0),
            boxSizing: 'border-box',
            textAlign: 'center',
        }),
    }, []);
};
