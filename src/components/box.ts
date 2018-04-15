import { getPieces, isMinoPiece, Piece } from '../lib/enums';
import { param } from '@hyperapp/html';
import { Component } from '../lib/types';
import konva = require('konva');

interface BoxProps {
    key: string;
    dataTest: string;
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
        color: string;
    };
    piece: {
        type?: Piece,
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
        if (props.piece.type !== undefined && isMinoPiece(props.piece.type)) {
            setAbsolutePosition(props.rect.pieces, props.piece.type);
        }
    };

    const setBoxSize = () => {
        props.rect.box.setSize({ width: props.box.size, height: props.box.size });
    };

    const setPieceSize = () => {
        props.rect.pieces.forEach(it => it.setSize({ width: props.piece.size, height: props.piece.size }));
    };

    const setBoxColor = () => {
        props.rect.box.fill(props.box.color);
    };

    const setPieceColor = () => {
        if (props.piece.color !== undefined) {
            const color = props.piece.color;
            props.rect.pieces.forEach(it => it.fill(color));
        }
    };

    console.log(props.key);
    return param({
        key: props.key,
        dataTest: props.dataTest,
        x: props.position.x,
        y: props.position.y,
        type: props.piece.type,
        oncreate: () => {
            setPosition();
        },
        onupdate: (ignore: any, attr: any) => {
            if (props.position.x !== attr.x || props.position.y === attr.y || props.piece.type !== attr.type) {
                setPosition();
            }
        },
    }, [
        param({
            key: `${props.key}-box`,
            size: props.box.size,
            color: props.box.color,
            oncreate: () => {
                props.rect.box.show();
                setBoxSize();
                setBoxColor();
            },
            onupdate: (ignore: any, attr: any) => {
                if (props.box.size !== attr.size) {
                    setBoxSize();
                }

                if (props.box.color !== attr.color) {
                    setBoxColor();
                }
            },
            ondestroy: () => {
                props.rect.box.hide();
            },
        }),
        props.piece.color !== undefined ? param({
            key: `${props.key}-piece`,
            size: props.piece.size,
            color: props.piece.color,
            oncreate: () => {
                props.rect.pieces.forEach(it => it.show());
                setPieceSize();
                setPieceColor();
            },
            onupdate: (ignore: any, attr: any) => {
                if (props.piece.size !== attr.size) {
                    setPieceSize();
                }

                if (props.piece.color !== attr.color) {
                    setPieceColor();
                }
            },
            ondestroy: () => {
                props.rect.pieces.forEach(it => it.hide());
            },
        }) : undefined,
        param(children),
    ] as any);
};
