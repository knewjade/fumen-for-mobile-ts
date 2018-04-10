import { Piece } from '../lib/enums';
import { param } from '@hyperapp/html';
import { getHighlightColor, getNormalColor } from '../lib/colors';
import { Component } from '../lib/types';
import konva = require('konva');

interface BlockProps {
    position: {
        x: number;
        y: number;
    };
    key: string;
    size: {
        width: number,
        height: number,
    };
    piece: Piece;
    rect: konva.Rect;
    highlight: boolean;
    background: string;
}

export const block: Component<BlockProps> = (props) => {
    function fill(block: konva.Rect) {
        if (props.piece === Piece.Empty) {
            block.fill(props.background);
        } else if (props.highlight) {
            block.fill(getHighlightColor(props.piece));
        } else {
            block.fill(getNormalColor(props.piece));
        }
    }

    function resize(block: konva.Rect) {
        block.setSize(props.size);
    }

    function move(block: konva.Rect) {
        block.setAbsolutePosition(props.position);
    }

    return param({
        key: props.key,
        size: props.size,
        value: props.piece,
        highlight: props.highlight,
        position: props.position,
        background: props.background,
        oncreate: () => {
            move(props.rect);
            resize(props.rect);
            fill(props.rect);
        },
        onupdate: (container: any, attr: any) => {
            // console.log(container.attributes.x.value);
            if (props.piece !== attr.value
                || props.highlight !== attr.highlight
                || props.background !== attr.background
            ) {
                fill(props.rect);
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                move(props.rect);
            }
            if (props.size.width !== attr.size.width || props.size.height !== attr.size.height) {
                resize(props.rect);
            }
        },
    });
};
