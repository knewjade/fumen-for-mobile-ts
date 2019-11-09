import { Coordinate, Size } from '../../views/commons';

export interface ReaderLayout {
    canvas: {
        topLeft: Coordinate;
        size: Size;
    };
    field: {
        blockSize: number;
        bottomBorderWidth: number;
        topLeft: Coordinate;
        size: Size;
    };
    hold: {
        boxSize: number;
        size: Size;
        topLeft: Coordinate;
    };
    nexts: {
        boxSize: number;
        size: Size;
        topLeft: (index: number) => Coordinate;
    };
    comment: {
        topLeft: Coordinate;
        size: Size;
    };
    tools: {
        topLeft: Coordinate;
        size: Size;
    };
}

export const getLayout = (display: { width: number, height: number }): ReaderLayout => {
    const commentHeight = 35;
    const toolsHeight = 50;
    const borderWidthBottomField = 2.4;

    // キャンバスの大きさ
    const canvasSize = {
        width: display.width,
        height: display.height - (toolsHeight + commentHeight),
    };

    // フィールドのブロックサイズ
    const blockSize = Math.min(
        Math.floor(Math.min(canvasSize.height / 23.5, canvasSize.width / 10)) - 2,
        (canvasSize.width / 16),
    );

    // フィールドの大きさ
    const fieldSize = {
        width: (blockSize + 1) * 10 + 1,
        height: (blockSize + 1) * 23.5 + 1 + borderWidthBottomField + 1,
    };

    // Hold・Nextのボックスサイズ
    const boxSize = Math.max(
        Math.min(fieldSize.width / 5 * 1.15, (canvasSize.width - fieldSize.width) / 2 - 15),
        5,
    );
    const boxMargin = boxSize / 4;

    // フィールドの左上
    const fieldTopLeft = {
        x: (canvasSize.width - fieldSize.width) / 2,
        y: (canvasSize.height - fieldSize.height) / 2,
    };

    return {
        canvas: {
            topLeft: {
                x: 0,
                y: 0,
            },
            size: canvasSize,
        },
        field: {
            blockSize,
            bottomBorderWidth: borderWidthBottomField,
            topLeft: fieldTopLeft,
            size: fieldSize,
        },
        hold: {
            boxSize,
            size: {
                width: boxSize,
                height: boxSize,
            },
            topLeft: {
                x: fieldTopLeft.x - (boxSize + boxMargin / 2),
                y: fieldTopLeft.y,
            },
        },
        nexts: {
            boxSize,
            size: {
                width: boxSize,
                height: boxSize,
            },
            topLeft: (index: number) => ({
                x: fieldTopLeft.x + fieldSize.width + boxMargin / 2,
                y: fieldTopLeft.y + index * (boxSize + boxMargin),
            }),
        },
        comment: {
            topLeft: {
                x: 0,
                y: display.height - (toolsHeight + commentHeight),
            },
            size: {
                width: display.width,
                height: commentHeight,
            },
        },
        tools: {
            topLeft: {
                x: 0,
                y: display.height - toolsHeight,
            },
            size: {
                width: display.width,
                height: toolsHeight,
            },
        },
    };
};
