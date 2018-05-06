import { h } from 'hyperapp';
import { getPieces, Piece } from '../lib/enums';
import { Component } from '../lib/types';
import konva = require('konva');

interface Size {
    width: number;
    height: number;
}

interface Props {
    rects: {
        background: konva.Rect,
        pieces: konva.Rect[],
    };
    key: string;
    size: Size;
    topLeft: {
        x: number;
        y: number;
    };
    piece?: {
        type: Piece;
        color: string;
        size: number;
    };
}

const getPiecePositions = (
    boxLeftTop: { x: number, y: number }, piece: Piece, size: Size, pieceSize: number, margin: number,
) => {
    // ブロックの相対位置を取得
    const blocks = getPieces(piece).map(([x, y]) => [x, -y]);

    // 最大値と最小値を取得
    const mmIndex = {
        max: { x: 0, y: 0 },
        min: { x: 0, y: 0 },
    };
    for (const [x, y] of blocks) {
        if (mmIndex.max.x < x) {
            mmIndex.max.x = x;
        } else if (x < mmIndex.min.x) {
            mmIndex.min.x = x;
        }

        if (mmIndex.max.y < y) {
            mmIndex.max.y = y;
        } else if (y < mmIndex.min.y) {
            mmIndex.min.y = y;
        }
    }

    // 中央にあたるIndex
    const centerIndex = {
        x: (mmIndex.max.x - mmIndex.min.x + 1) / 2 + mmIndex.min.x,
        y: (mmIndex.max.y - mmIndex.min.y + 1) / 2 + mmIndex.min.y,
    };

    const step = (n: number) => n * (pieceSize + margin) + 0.5 * margin;

    // ボックス中央の座標
    const center = {
        x: boxLeftTop.x + size.width / 2,
        y: boxLeftTop.y + size.height / 2,
    };

    return blocks.map(([x, y]) => ({
        x: center.x + step(x - centerIndex.x),
        y: center.y + step(y - centerIndex.y),
    }));
};

export const Box: Component<Props> = ({ key, size, topLeft, piece, rects }) => {
    let positions: any[] = [];
    if (piece !== undefined) {
        const pieceSize = piece.size;
        const pieceSizeObj = { width: pieceSize, height: pieceSize };

        positions = getPiecePositions(topLeft, piece.type, size, pieceSize, 1).map((position, index) => {
            const positionKey = key + '-' + index;
            return <BoxRect key={positionKey} dataTest={positionKey} rect={rects.pieces[index]} size={pieceSizeObj}
                            fillColor={piece.color} strokeColor="#333" strokeWidth={0} position={position}/>;
        });
    }

    const type = piece !== undefined ? piece.type : Piece.Empty;
    return (
        <div>
            <BoxRect key={key} dataTest={key} rect={rects.background} type={type}
                     size={size} fillColor="#333" strokeColor="#666" strokeWidth={1} position={topLeft}/>

            {...positions}
        </div>
    );
};


interface BoxRectProps {
    rect: konva.Rect;
    key: string;
    dataTest: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number,
        height: number,
    };
    fillColor: string;
    strokeWidth: number;
    strokeColor: string;
    type?: Piece;
}

const BoxRect: Component<BoxRectProps> = (
    { key, dataTest, rect, fillColor, position, size, strokeWidth, strokeColor, type },
) => {
    const resize = () => rect.setSize(size);
    const move = () => rect.setAbsolutePosition(position);
    const fill = () => rect.fill(fillColor);
    const stroke = () => rect.stroke(strokeColor);
    const setStrokeWidth = () => rect.strokeWidth(strokeWidth);
    const setStrokeEnabled = () => rect.strokeEnabled(0 < strokeWidth);

    const oncreate = () => {
        resize();
        move();
        fill();
        setStrokeEnabled();
        stroke();
        setStrokeWidth();
        rect.show();
    };

    const onupdate = (container: any, attr: any) => {
        if (size.width !== attr.size.width || size.height !== attr.size.height) {
            resize();
        }

        if (position.x !== attr.position.x || position.y !== attr.position.y) {
            move();
        }

        if (fillColor !== attr.color) {
            fill();
        }

        if (strokeColor !== attr.strokeColor) {
            stroke();
        }

        if (strokeWidth !== attr.strokeWidth) {
            setStrokeEnabled();
            setStrokeWidth();
        }
    };

    const ondestroy = () => {
        rect.hide();
    };

    return <param name="konva" value={key} key={key} datatest={dataTest} type={type}
                  oncreate={oncreate} onupdate={onupdate} ondestroy={ondestroy}
                  color={fillColor} position={position} size={size}
                  strokeColor={strokeColor} strokeWidth={strokeWidth}/>;
};
