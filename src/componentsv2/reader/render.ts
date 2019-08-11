import konva from 'konva';
import { managers } from '../../repository/managers';
import { ReaderLayout } from './layout';
import { Actions } from '../../actions';
import { State } from '../../states';
import { Layers } from '../../repository/konva/manager';
import { Piece } from '../../lib/enums';
import { decideBackgroundColor, decidePieceColor } from '../../lib/colors';
import { getPieces } from '../../lib/piece';
import { HighlightType } from '../../state_types';

type ComponentGenerator = (layout: ReaderLayout, state: State, actions: Actions) => KonvaComponent;

interface KonvaComponent {
    update: (layout: ReaderLayout, state: State, actions: Actions) => void;
    onDestroy: () => void;
}

export const render: ComponentGenerator = (layout, state, actions) => {
    const background = backgroundComponent(layout, state, actions);
    const event = eventComponent(layout, state, actions);

    const fieldBottomLine = fieldBottomLineComponent(layout, state, actions);

    const blocks = blocksComponents(layout, state, actions);
    const sentLines = sentLinesComponents(layout, state, actions);

    const hold = holdComponent(layout, state, actions);
    const nexts = nextComponents(layout, state, actions);

    const wrappers = [background, fieldBottomLine, hold, event].concat(blocks).concat(sentLines).concat(nexts);

    return {
        update: (layout, state, actions) => {
            wrappers.forEach((wrapper) => {
                wrapper.update(layout, state, actions);
            });
        },
        onDestroy: () => {
            wrappers.forEach((wrapper) => {
                wrapper.onDestroy();
            });
        },
    };
};

// field

const blocksComponents: ComponentGenerator = () => {
    const blocks: any[] = [];
    for (let index = 0; index < 230; index += 1) {
        blocks[index] = blockComponent(0, '#333');
    }

    return {
        update: (layout, state) => {
            const field = state.field;
            const blockSize = layout.field.blockSize;

            for (let index = 0; index < blocks.length; index += 1) {
                const [xIndex, yIndex] = [index % 10, Math.floor(index / 10)];
                const yField = 22 - yIndex;
                const blockValue = field[xIndex + yIndex * 10];

                const size = {
                    width: blockSize,
                    height: yField !== 0 ? blockSize : blockSize / 2,
                };
                const position = {
                    x: layout.field.topLeft.x + xIndex * blockSize + xIndex + 1,
                    y: layout.field.topLeft.y + Math.max(0, yField - 0.5) * blockSize + yField + 1,
                };

                const color = blockValue.piece === Piece.Empty ?
                    decideBackgroundColor(yIndex) :
                    decidePieceColor(blockValue.piece, blockValue.highlight, state.fumen.guideLineColor);

                blocks[index].update(position.x, position.y, size.width, size.height, color);
            }
        },
        onDestroy: () => {
            for (const block of blocks) {
                block.onDestroy();
            }
        },
    };
};

const sentLinesComponents: ComponentGenerator = () => {
    const blocks: any[] = [];
    for (let index = 0; index < 10; index += 1) {
        blocks[index] = blockComponent(0, '#333');
    }

    return {
        update: (layout, state) => {
            const sentLine = state.sentLine;
            const blockSize = layout.field.blockSize;
            const fieldBottomLeft = layout.field.topLeft.y + (blockSize + 1) * 22.5 + 1;

            for (let index = 0; index < blocks.length; index += 1) {
                const [xIndex, yIndex] = [index % 10, Math.floor(index / 10)];
                const blockValue = sentLine[xIndex + yIndex * 10];

                const size = { width: blockSize, height: blockSize };
                const position = {
                    x: layout.field.topLeft.x + xIndex * blockSize + xIndex + 1,
                    y: fieldBottomLeft + layout.field.bottomBorderWidth,
                };
                const color = decidePieceColor(blockValue.piece, blockValue.highlight, state.fumen.guideLineColor);

                blocks[index].update(position.x, position.y, size.width, size.height, color);
            }
        },
        onDestroy: () => {
            for (const block of blocks) {
                block.onDestroy();
            }
        },
    };
};

const blockComponent = (strokeWidth: number, strokeColor: string) => {
    const rect = new konva.Rect({
        strokeWidth,
        strokeColor,
        opacity: 1,
    });

    managers.konva.add(Layers.Front, rect);

    return {
        update: (x: number, y: number, width: number, height: number, color: string) => {
            rect.setSize({ width, height });
            rect.setPosition({ x, y });
            rect.fill(color);
            rect.show();
        },
        onDestroy: () => {
            rect.remove();
        },
        hide: () => {
            rect.hide();
        },
    };
};

// hold

const holdComponent: ComponentGenerator = () => {
    const box = boxComponent();

    return {
        update: (layout, state) => {
            if (state.hold !== undefined) {
                box.update(
                    state.hold,
                    layout.hold.topLeft,
                    layout.hold.size,
                    layout.hold.boxSize / 4 - 1,
                    state.fumen.guideLineColor,
                );
            } else {
                box.hide();
            }
        },
        onDestroy: () => {
            box.onDestroy();
        },
    };
};

const nextComponents: ComponentGenerator = () => {
    const boxes = [
        boxComponent(),
        boxComponent(),
        boxComponent(),
        boxComponent(),
        boxComponent(),
    ];

    return {
        update: (layout, state) => {
            if (state.nexts !== undefined) {
                for (let index = 0; index < state.nexts.length; index += 1) {
                    boxes[index].update(
                        state.nexts[index],
                        layout.nexts.topLeft(index),
                        layout.nexts.size,
                        layout.nexts.boxSize / 4 - 1,
                        state.fumen.guideLineColor,
                    );
                }
            } else {
                for (const box of boxes) {
                    box.hide();
                }
            }
        },
        onDestroy: () => {
            for (const box of boxes) {
                box.onDestroy();
            }
        },
    };
};

const boxComponent = () => {
    const background = blockComponent(1, '#666');
    const blocks = [
        blockComponent(0, '#333'),
        blockComponent(0, '#333'),
        blockComponent(0, '#333'),
        blockComponent(0, '#333'),
    ];

    return {
        update: (
            piece: Piece,
            topLeft: { x: number, y: number },
            size: { width: number, height: number },
            pieceSize: number,
            guideLineColor: boolean,
        ) => {
            // background
            background.update(topLeft.x, topLeft.y, size.width, size.height, '#333');

            // blocks
            const positions = getPiecePositions(piece, size, pieceSize, 1);

            const color = decidePieceColor(piece, HighlightType.Highlight2, guideLineColor);

            for (let index = 0; index < blocks.length; index += 1) {
                const position = positions[index];
                blocks[index].update(
                    topLeft.x + position.x, topLeft.y + position.y, pieceSize, pieceSize, color,
                );
            }
        },
        onDestroy: () => {
            background.onDestroy();
            for (const block of blocks) {
                block.onDestroy();
            }
        },
        hide: () => {
            background.hide();
            for (const block of blocks) {
                block.hide();
            }
        },
    };
};

const getPiecePositions = (
    piece: Piece, size: { width: number, height: number }, pieceSize: number, margin: number,
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
        x: size.width / 2,
        y: size.height / 2,
    };

    return blocks.map(([x, y]) => ({
        x: center.x + step(x - centerIndex.x),
        y: center.y + step(y - centerIndex.y),
    }));
};

// etc

const backgroundComponent: ComponentGenerator = () => {
    const rect = new konva.Rect({
        fill: '#333',
        strokeWidth: 0,
        opacity: 1,
    });

    managers.konva.add(Layers.Background, rect);

    return {
        update: (layout) => {
            rect.setSize(layout.field.size);
            rect.setPosition(layout.field.topLeft);
        },
        onDestroy: () => {
            rect.remove();
        },
    };
};

const fieldBottomLineComponent: ComponentGenerator = ({ field }) => {
    const line = new konva.Line({
        x: 0,
        y: 0,
        points: [],
        stroke: '#d8d8d8',
        strokeWidth: field.bottomBorderWidth,
    });

    managers.konva.add(Layers.Front, line);

    return {
        update: ({ field }) => {
            const blockSize = field.blockSize;
            const fieldBottomLeft = field.topLeft.y + (blockSize + 1) * 22.5 + 1;

            const start = {
                x: field.topLeft.x,
                y: fieldBottomLeft + (field.bottomBorderWidth / 2),
            };
            const end = {
                x: field.topLeft.x + field.size.width,
                y: fieldBottomLeft + (field.bottomBorderWidth / 2),
            };
            line.points([start.x, start.y, end.x, end.y]);
        },
        onDestroy: () => {
            line.remove();
        },
    };
};

const eventComponent: ComponentGenerator = (layout, state, actions) => {
    const rect = new konva.Rect({
        fill: '#333',
        opacity: 0.0,  // 0 ほど透過
        strokeEnabled: false,
        listening: true,
    });

    managers.konva.add(Layers.Overlay, rect);

    rect.show();
    rect.on('tap click', actions.ontapCanvas);

    return {
        update: (layout) => {
            rect.setSize(layout.canvas.size);
        },
        onDestroy: () => {
            rect.remove();
        },
    };
};
