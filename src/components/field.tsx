import { Component } from '../lib/types';
import { h } from 'hyperapp';
import { Block as Blocks, resources } from '../states';
import { Piece } from '../lib/enums';
import { Block } from './block';
import { getHighlightColor, getNormalColor } from '../lib/colors';

interface Props {
    topLeft: {
        x: number;
        y: number;
    };
    field: Blocks[];
    blockSize: number;
}

const decidePieceColor = (piece: Piece, highlight: boolean) => {
    return highlight ? getHighlightColor(piece) : getNormalColor(piece);
};

const decideBackgroundColor = (yIndex: number) => {
    return yIndex < 20 ? '#000' : '#333';
};

export const Field: Component<Props> = ({ topLeft, field, blockSize }) => {
    const blocks = resources.konva.fieldBlocks.map((rect, index) => {
        const [xIndex, yIndex] = [index % 10, Math.floor(index / 10)];
        const yField = 22 - yIndex;
        const blockValue = field[xIndex + yIndex * 10];

        const key = `block-${xIndex}-${yIndex}`;
        const size = {
            width: blockSize,
            height: yField !== 0 ? blockSize : blockSize / 2,
        };
        const position = {
            x: topLeft.x + xIndex * blockSize + xIndex + 1,
            y: topLeft.y + Math.max(0, yField - 0.5) * blockSize + yField + 1,
        };
        const color = blockValue.piece === Piece.Empty ?
            decideBackgroundColor(yIndex) :
            decidePieceColor(blockValue.piece, blockValue.highlight || false);

        return <Block key={key} dataTest={key} size={size} position={position} color={color} rect={rect}/>;
    });

    return (
        <div>
            {...blocks}
        </div>
    );
};
