import { h } from 'hyperapp';
import { BoxRect } from './box_rect';
import { getPieces, Piece } from '../../lib/enums';
import { Component } from '../../lib/types';
import konva = require('konva');

interface Props {
    rects: konva.Rect[];
    key: string;
    boxSize: number;
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
    boxLeftTop: { x: number, y: number }, piece: Piece, boxSize: number, pieceSize: number, margin: number,
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

    const step = (n: number) => n * pieceSize + (0 < n ? Math.floor(n) : Math.ceil(n)) * margin;

    // ボックス中央の座標
    const center = {
        x: boxLeftTop.x + boxSize / 2,
        y: boxLeftTop.y + boxSize / 2,
    };

    return blocks.map(([x, y]) => ({
        x: center.x + step(x - centerIndex.x),
        y: center.y + step(y - centerIndex.y),
    }));
};

export const Box: Component<Props> = ({ key, boxSize, topLeft, piece, rects }) => {
    const sizeObj = { width: boxSize, height: boxSize };

    let positions: any[] = [];
    if (piece !== undefined) {
        const pieceSize = piece.size;
        const pieceSizeObj = { width: pieceSize, height: pieceSize };

        positions = getPiecePositions(topLeft, piece.type, boxSize, pieceSize, 1).map((position, index) => {
            const positionKey = key + '-' + index;
            return <BoxRect key={positionKey} dataTest={positionKey} rect={rects[index + 1]} size={pieceSizeObj}
                            fillColor={piece.color} strokeColor="#333" strokeWidth={0} position={position}/>;
        });
    }

    const type = piece !== undefined ? piece.type : Piece.Empty;
    return (
        <div>
            <BoxRect key={key} dataTest={key} rect={rects[0]} type={type}
                     size={sizeObj} fillColor="#333" strokeColor="#666" strokeWidth={1} position={topLeft}/>

            {...positions}
        </div>
    );
};
