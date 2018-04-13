import { getPieces, isMinoPiece, Piece } from '../lib/enums';
import { param } from '@hyperapp/html';
import { Component } from '../lib/types';
import konva = require('konva');

interface BoxProps {
    key: string;
    position: {
        x: number;
        y: number;
    };
    rect: {
        box: konva.Rect;
        pieces: konva.Rect[];
    };
    box: {
        size: number;
        color?: string;
    };
    piece: {
        value?: Piece,
        color?: string;
        size: number;
    };
}

const pieceMargin = 1;

export const box: Component<BoxProps> = (props, children) => {
    const setAbsolutePosition = (parts: konva.Rect[], piece: Piece) => {
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
        const step: (n: number) => number = n => n * pieceSize + Math.floor(n) * pieceMargin;

        const center = {
            x: props.position.x + props.box.size / 2,
            y: props.position.y + props.box.size / 2,
        };

        for (let index = 0; index < blocks.length; index += 1) {
            const [x, y] = blocks[index];

            const part = parts[index];

            part.setAbsolutePosition({
                x: center.x + step(x - x2) + pieceMargin / 2,
                y: center.y + step(y - y2) + pieceMargin / 2,
            });
        }
    };

    const setPosition = () => {
        props.rect.box.setAbsolutePosition(props.position);
        if (props.piece.value !== undefined && isMinoPiece(props.piece.value)) {
            setAbsolutePosition(props.rect.pieces, props.piece.value);
        }
    };

    const setBoxSize = () => {
        props.rect.box.setSize({ width: props.box.size, height: props.box.size });
    };

    const setPieceSize = () => {
        props.rect.pieces.forEach(it => it.setSize({ width: props.piece.size, height: props.piece.size }));
    };

    const setBoxColor = () => {
        if (props.box.color !== undefined) {
            props.rect.box.show();
            props.rect.box.fill(props.box.color);
        } else {
            props.rect.box.hide();
        }
    };

    const setPieceColor = () => {
        if (props.piece.color !== undefined) {
            props.rect.pieces.forEach(it => it.show());

            const color = props.piece.color;
            props.rect.pieces.forEach(it => it.fill(color));
        } else {
            props.rect.pieces.forEach(it => it.hide());
        }
    };

    return param({
        key: props.key,
        position: props.position,
        box: props.box,
        piece: props.piece,
        oncreate: () => {
            // position
            setPosition();

            // size
            setBoxSize();
            setPieceSize();

            // color
            setBoxColor();
            setPieceColor();
        },
        onupdate: (ignore: any, attr: any) => {
            // position
            if (props.position.x !== attr.position.x
                || props.position.y === attr.position.y
                || props.piece.value !== attr.piece.value
            ) {
                setPosition();
            }

            // size
            if (props.box.size !== attr.box.size) {
                setBoxSize();
            }
            if (props.piece.size !== attr.piece.size) {
                setPieceSize();
            }

            // color
            if (props.box.color !== attr.box.color) {
                setBoxColor();
            }
            if (props.piece.color !== attr.piece.color) {
                setPieceColor();
            }
        },
    }, children);
};
