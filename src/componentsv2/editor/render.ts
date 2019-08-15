import konva from 'konva';
import { managers } from '../../repository/managers';
import { Actions } from '../../actions';
import { State } from '../../states';
import { Layers } from '../../repository/konva/manager';
import { Piece } from '../../lib/enums';
import { decideBackgroundColor, decidePieceColor } from '../../lib/colors';
import { EditorLayout } from './layout';
import { VNode } from '@hyperapp/hyperapp';
import { param } from '@hyperapp/html';

type ComponentGenerator = (layout: EditorLayout, state: State, actions: Actions) => KonvaComponent;

interface KonvaComponent {
    update: (layout: EditorLayout, state: State, actions: Actions) => void;
    onDestroy: () => void;
    toNodes: () => (VNode<{}> | undefined)[];
}

export const render: ComponentGenerator = (layout, state, actions) => {
    const background = backgroundComponent(layout, state, actions);
    const event = eventComponent(layout, state, actions);

    const fieldBottomLine = fieldBottomLineComponent(layout, state, actions);

    const blocks = blocksComponents(layout, state, actions);
    const sentLines = sentLinesComponents(layout, state, actions);

    const wrappers = [background, fieldBottomLine, event].concat(blocks).concat(sentLines);

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
        toNodes: () => {
            let children: (VNode<{}> | undefined)[] = [];
            wrappers.forEach((wrapper) => {
                children = children.concat(wrapper.toNodes());
            });
            return children;
        },
    };
};

// field

const blocksComponents: ComponentGenerator = (layout, state, actions) => {
    const blocks: any[] = [];
    for (let index = 0; index < 230; index += 1) {
        blocks[index] = blockComponent(
            `block-${index % 10}-${22 - Math.floor(index / 10)}`,
            0,
            '#333',
            () => {
                actions.ontouchStartField({ index });
            },
            () => {
                actions.ontouchMoveField({ index });
            },
            () => {
                actions.ontouchEnd();
            },
        );
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
        toNodes: () => {
            return blocks.map(block => block.toNode());
        },
    };
};

const sentLinesComponents: ComponentGenerator = (layout, state, actions) => {
    const blocks: any[] = [];
    for (let index = 0; index < 10; index += 1) {
        blocks[index] = blockComponent(
            `sent-block-${index % 10}-0`,
            0,
            '#333',
            () => {
                actions.ontouchStartSentLine({ index });
            },
            () => {
                actions.ontouchMoveSentLine({ index });
            },
            () => {
                actions.ontouchEnd();
            },
        );
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
        toNodes: () => {
            return blocks.map(block => block.toNode());
        },
    };
};

const blockComponent = (
    datatest: string,
    strokeWidth: number,
    strokeColor: string,
    onTouchStart: () => void,
    onTouchMove: () => void,
    onTouchEnd: () => void,
) => {
    let fillColor = '#fff';
    const rect = new konva.Rect({
        strokeWidth,
        strokeColor,
        fillColor,
        opacity: 1,
    });

    rect.on('touchstart mousedown', onTouchStart);
    rect.on('touchmove mouseenter', onTouchMove);
    rect.on('touchend mouseup', onTouchEnd);

    managers.konva.add(Layers.Front, rect);

    return {
        update: (x: number, y: number, width: number, height: number, color: string) => {
            rect.setSize({ width, height });
            rect.setPosition({ x, y });
            rect.fill(color);
            fillColor = color;
            rect.show();
        },
        onDestroy: () => {
            rect.off('touchstart mousedown');
            rect.off('touchmove mouseenter');
            rect.off('touchend mouseup');
            rect.remove();
        },
        toNode: () => {
            return param({
                datatest,
                color: fillColor,
            });
        },
        hide: () => {
            rect.hide();
        },
    };
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
        toNodes: () => [],
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
        toNodes: () => [],
    };
};

const eventComponent: ComponentGenerator = (layout, state, actions) => {
    const rect = new konva.Rect({
        fill: '#333',
        opacity: 0.0,  // 0 ほど透過
        strokeEnabled: false,
        listening: true,
    });

    managers.konva.add(Layers.Background, rect);

    const flags = {
        mouseOnField: false,
        addBodyEvent: false,
    };

    rect.on('touchleave mouseleave', () => {
        flags.mouseOnField = false;

        if (!flags.addBodyEvent) {
            flags.addBodyEvent = true;
            document.body.addEventListener('mouseup', () => {
                flags.addBodyEvent = false;
                if (!flags.mouseOnField) {
                    actions.ontouchEnd();
                }
            }, { once: true });
        }
    });
    rect.on('touchenter mouseenter', () => {
        flags.mouseOnField = true;
    });

    return {
        update: (layout) => {
            rect.setSize(layout.canvas.size);
        },
        onDestroy: () => {
            rect.off('touchleave mouseleave');
            rect.off('touchenter touchenter');
            rect.remove();
        },
        toNodes: () => [],
    };
};
