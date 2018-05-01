import { Component } from '../../lib/types';
import { h } from 'hyperapp';
import { Block as Blocks, resources } from '../../states';
import { Piece } from '../../lib/enums';
import { Block } from './block';
import { getHighlightColor, getNormalColor } from '../../lib/colors';
import konva = require('konva');

interface Props {
    topLeft: {
        x: number;
        y: number;
    };
    field: Blocks[];
    blockSize: number;
    fieldMarginWidth: number;
}

const decidePieceColor = (piece: Piece, highlight: boolean) => {
    return highlight ? getHighlightColor(piece) : getNormalColor(piece);
};

const decideBackgroundColor = (yIndex: number) => {
    return yIndex < 20 ? '#000' : '#333';
};

export const Field: Component<Props> = ({ topLeft, field, blockSize, fieldMarginWidth }) => {
    const fieldBottomLeft = topLeft.y + (blockSize + 1) * 22.5 + 1;

    // プレイフィールドの描画
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

    // せり上がりの描画
    const sentBlocks = resources.konva.sentBlocks.map((rect, index) => {
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
            y: fieldBottomLeft + fieldMarginWidth,
        };
        const color = blockValue.piece === Piece.Empty ?
            '#000' :
            decidePieceColor(blockValue.piece, blockValue.highlight || false);

        return <Block key={key} dataTest={key} size={size} position={position} color={color} rect={rect}/>;
    });

    const size = {
        width: 10 * (blockSize + 1) + 1,
        height: (blockSize + 1) * 23.5 + 1 + fieldMarginWidth,
    };

    return (
        <div>

            <Block key="field-bg" dataTest="field-bg" rect={resources.konva.background}
                   size={size} position={topLeft} color="#333"/>

            {...blocks}

            <Line key="field-margin" dataTest="field-margin" line={resources.konva.fieldMarginLine}
                  width={fieldMarginWidth} color="#d8d8d8"
                  start={{ x: topLeft.x, y: fieldBottomLeft + (fieldMarginWidth / 2) }}
                  end={{ x: topLeft.x + size.width, y: fieldBottomLeft + (fieldMarginWidth / 2) }}/>

            {...sentBlocks}

        </div>
    );
};

interface LineProps {
    line: konva.Line;
    key: string;
    dataTest: string;
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
    width: number;
    color: string;
}

const Line: Component<LineProps> = ({ key, dataTest, line, color, width, start, end }) => {
    const move = () => line.points([start.x, start.y, end.x, end.y]);
    const setWidth = () => line.strokeWidth(width);
    const fill = () => line.stroke(color);

    const oncreate = () => {
        move();
        setWidth();
        fill();
        line.show();
    };

    const onupdate = (container: any, attr: any) => {
        if (start.x !== attr.start.x ||
            start.y !== attr.start.y ||
            end.x !== attr.end.x ||
            end.y !== attr.end.y
        ) {
            move();
        }

        if (width !== attr.width) {
            setWidth();
        }

        if (color !== attr.color) {
            fill();
        }
    };

    const ondestroy = () => {
        line.hide();
    };

    return <param name="konva" value={key} key={key} datatest={dataTest}
                  oncreate={oncreate} onupdate={onupdate} ondestroy={ondestroy}
                  color={color} start={start} end={end} width={width}/>;
};
