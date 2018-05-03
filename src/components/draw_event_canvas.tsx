import { Component } from '../lib/types';
import { h } from 'hyperapp';
import { resources } from '../states';
import konva = require('konva');

interface Props {
    fieldBlocks: konva.Rect[];
    sentBlocks: konva.Rect[];
    actions: {
        drawField(data: { index: number }): void;
        clearField(data: { index: number }): void;
        fixField(): void;
    };
}

export const DrawEventCanvas: Component<Props> = ({ fieldBlocks, sentBlocks }) => {
    const oncreate = () => {
        fieldBlocks.forEach((rect, index) => {
            rect.on('touchstart mousedown', () => {
                console.log('start ' + index);
                resources.events.touch = 1;
            });

            rect.on('touchmove mouseenter', () => {
                if (resources.events.touch) {
                    console.log('  move ' + index);
                }
            });

            rect.on('touchend mouseup', () => {
                console.log('end ' + index);
                resources.events.touch = 0;
            });
        });
    };

    const onupdate = (container: any, attr: any) => {

    };

    const ondestroy = () => {
        fieldBlocks.forEach((rect) => {
            rect.off('touchstart mousedown');
            rect.off('touchmove mouseenter');
            rect.off('touchend mouseup');
        });
    };

    return <param name="konva" value="draw-event-box"
                  oncreate={oncreate} onupdate={onupdate} ondestroy={ondestroy}/>;
};
