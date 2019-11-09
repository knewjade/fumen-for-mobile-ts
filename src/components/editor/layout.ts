import { Coordinate, Size } from '../../views/commons';

export interface EditorLayout {
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
    buttons: {
        size: Size;
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

export const getLayout = (display: { width: number, height: number }): EditorLayout => {
    const commentHeight = 35;
    const toolsHeight = 50;
    const borderWidthBottomField = 2.4;

    const canvasSize = {
        width: display.width,
        height: display.height - (toolsHeight + commentHeight),
    };

    const blockSize = Math.min(
        (canvasSize.height - borderWidthBottomField - 2) / 24,
        (canvasSize.width - 90) / 10.5,  // 横のスペースが最低でも90pxは残るようにする
    ) - 1;

    const fieldSize = {
        width: (blockSize + 1) * 10 + 1,
        height: (blockSize + 1) * 23.5 + 1 + borderWidthBottomField + 1,
    };

    const pieceButtonsSize = {
        width: Math.min((canvasSize.width - fieldSize.width) * 0.6, 80),
        height: Math.min(
            fieldSize.height / (1.25 * 9 + 0.25),
            40,
        ),
    };

    return {
        canvas: {
            topLeft: {
                x: 0,
                y: 0,
            },
            size: {
                width: fieldSize.width,
                height: canvasSize.height,
            },
        },
        field: {
            blockSize,
            bottomBorderWidth: borderWidthBottomField,
            topLeft: {
                x: 0,
                y: (canvasSize.height - fieldSize.height) / 2.0,
            },
            size: {
                width: fieldSize.width,
                height: fieldSize.height,
            },
        },
        buttons: {
            size: pieceButtonsSize,
        },
        comment: {
            topLeft: {
                x: 0,
                y: display.height - commentHeight - toolsHeight,
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
