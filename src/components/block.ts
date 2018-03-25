import { Piece } from '../lib/enums';
import { param } from '@hyperapp/html';
import { getHighlightColor, getNormalColor } from '../lib/colors';
import { Component } from '../lib/types';
// Konvaは最後に読み込むこと！
// エラー対策：Uncaught ReferenceError: __importDefault is not define
import * as Konva from 'konva';

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
    rect: Konva.Rect;
    highlight: boolean;
    background: string;
}

export const block: Component<BlockProps> = (props) => {
    function fill(block: Konva.Rect) {
        if (props.piece === Piece.Empty) {
            block.fill(props.background);
        } else if (props.highlight) {
            block.fill(getHighlightColor(props.piece));
        } else {
            block.fill(getNormalColor(props.piece));
        }
    }

    function resize(block: Konva.Rect) {
        block.setSize(props.size);
    }

    function move(block: Konva.Rect) {
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
