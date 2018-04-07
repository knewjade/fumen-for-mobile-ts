import { getPieces, isMinoPiece, Piece } from '../lib/enums';
import { param } from '@hyperapp/html';
import { getHighlightColor } from '../lib/colors';
import { Component } from '../lib/types';
import konva = require('konva');

interface BoxProps {
    position: {
        x: number;
        y: number;
    };
    size: number;
    rect: {
        box: konva.Rect;
        parts: konva.Rect[];
    };
    piece: {
        value?: Piece,
        size: number;
        margin: number;
    };
    visible: boolean;
}

export const box: Component<BoxProps> = (props, children) => {
    function draw(parts: konva.Rect[], piece: Piece) {
        const blocks = getPieces(piece).map(([x, y]) => [x, -y]);
        const max = {
            x: 0,
            y: 0,
        };
        const min = {
            x: 0,
            y: 0,
        };

        for (const [x, y] of blocks) {
            if (max.x < x) {
                max.x = x;
            } else if (x < min.x) {
                min.x = x;
            }

            if (max.y < y) {
                max.y = y;
            } else if (y < min.y) {
                min.y = y;
            }
        }

        const x2 = (max.x - min.x + 1) / 2 + min.x;
        const y2 = (max.y - min.y + 1) / 2 + min.y;

        const pieceSize = props.piece.size;
        const pieceMargin = props.piece.margin;
        const step: (n: number) => number = n => n * pieceSize + Math.floor(n) * pieceMargin;

        // console.log(x2, y2);
        const center = {
            x: props.position.x + props.size / 2,
            y: props.position.y + props.size / 2,
        };
        // console.log(center);

        for (let index = 0; index < blocks.length; index += 1) {
            const [x, y] = blocks[index];

            const part = parts[index];

            part.setAbsolutePosition({
                x: center.x + step(x - x2) + pieceMargin / 2,
                y: center.y + step(y - y2) + pieceMargin / 2,
            });
            part.setSize({ width: pieceSize, height: pieceSize });
            part.fill(getHighlightColor(piece));
        }
    }

    return param({
        position: props.position,
        size: props.size,
        piece: props.piece,
        oncreate: () => {
            props.rect.box.setSize({ width: props.size, height: props.size });
            props.rect.box.setAbsolutePosition(props.position);

            const piece = props.piece;
            if (piece.value === undefined) {
                props.rect.box.hide();

                for (const part of props.rect.parts) {
                    part.hide();
                }
            } else {
                props.rect.box.show();

                if (isMinoPiece(piece.value)) {
                    for (const part of props.rect.parts) {
                        part.show();
                    }
                    draw(props.rect.parts, piece.value);
                } else {
                    for (const part of props.rect.parts) {
                        part.hide();
                    }
                }
            }
        },
        onupdate: (ignore: any, attr: any) => {
            if (props.size !== attr.size) {
                props.rect.box.setSize({ width: props.size, height: props.size });
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                props.rect.box.setAbsolutePosition(props.position);
            }

            const piece = props.piece;
            if (piece.value === undefined) {
                props.rect.box.hide();

                for (const part of props.rect.parts) {
                    part.hide();
                }
            } else if (piece.value !== attr.piece.value
                || piece.size !== attr.piece.size
                || piece.margin !== attr.margin) {
                props.rect.box.show();

                if (isMinoPiece(piece.value)) {
                    for (const part of props.rect.parts) {
                        part.show();
                    }
                    draw(props.rect.parts, piece.value);
                } else {
                    for (const part of props.rect.parts) {
                        part.hide();
                    }
                }
            }
        },
    }, children);
};
