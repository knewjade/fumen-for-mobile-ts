import { Component } from '../../lib/types';
import { h } from 'hyperapp';
import konva = require('konva');

interface Props {
    fieldBlocks: konva.Rect[];
    sentBlocks: konva.Rect[];
    fieldLayer: konva.Layer;
    actions: {
        ontouchStartField(data: { index: number }): void;
        ontouchMoveField(data: { index: number }): void;

        ontouchStartSentLine(data: { index: number }): void;
        ontouchMoveSentLine(data: { index: number }): void;

        ontouchEnd(): void;
    };
}

export const DrawingEventCanvas: Component<Props> = ({ fieldBlocks, sentBlocks, fieldLayer, actions }) => {
    const oncreate = () => {
        const flags = {
            mouseOnField: false,
            addBodyEvent: false,
        };

        fieldBlocks.forEach((rect, index) => {
            rect.on('touchstart mousedown', () => {
                actions.ontouchStartField({ index });
            });
            rect.on('touchmove mouseenter', () => {
                actions.ontouchMoveField({ index });
            });
            rect.on('touchend mouseup', () => {
                actions.ontouchEnd();
            });
        });

        sentBlocks.forEach((rect, index) => {
            rect.on('touchstart mousedown', () => {
                actions.ontouchStartSentLine({ index });
            });
            rect.on('touchmove mouseenter', () => {
                actions.ontouchMoveSentLine({ index });
            });
            rect.on('touchend mouseup', () => {
                actions.ontouchEnd();
            });
        });

        fieldLayer.on('touchleave mouseleave', () => {
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
        fieldLayer.on('touchenter mouseenter', () => {
            flags.mouseOnField = true;
        });
    };

    const ondestroy = () => {
        fieldBlocks.forEach((rect) => {
            rect.off('touchstart mousedown');
            rect.off('touchmove mouseenter');
            rect.off('touchend mouseup');
        });

        sentBlocks.forEach((rect) => {
            rect.off('touchstart mousedown');
            rect.off('touchmove mouseenter');
            rect.off('touchend mouseup');
        });

        fieldLayer.off('touchleave mouseleave');
        fieldLayer.off('touchenter touchenter');
    };

    return <param key="drawing-event-canvas" name="konva" value="draw-event-box"
                  oncreate={oncreate} ondestroy={ondestroy}/>;
};
