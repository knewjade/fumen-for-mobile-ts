import { Component } from '../lib/types';
import { h } from 'hyperapp';
import konva = require('konva');
import { action } from '../actions';

interface Props {
    fieldBlocks: konva.Rect[];
    sentBlocks: konva.Rect[];
    actions: {
        ontouchStartField(data: { index: number }): void;
        ontouchMoveField(data: { index: number }): void;
        ontouchEndField(data: { index: number }): void;

        ontouchStartSentLine(data: { index: number }): action;
        ontouchMoveSentLine(data: { index: number }): action;
        ontouchEndSentLine(data: { index: number }): action;
    };
}

export const DrawEventCanvas: Component<Props> = ({ fieldBlocks, sentBlocks, actions }) => {
    const oncreate = () => {
        fieldBlocks.forEach((rect, index) => {
            rect.on('touchstart mousedown', () => actions.ontouchStartField({ index }));
            rect.on('touchmove mouseenter', () => actions.ontouchMoveField({ index }));
            rect.on('touchend mouseup', () => actions.ontouchEndField({ index }));
        });

        sentBlocks.forEach((rect, index) => {
            rect.on('touchstart mousedown', () => actions.ontouchStartSentLine({ index }));
            rect.on('touchmove mouseenter', () => actions.ontouchMoveSentLine({ index }));
            rect.on('touchend mouseup', () => actions.ontouchEndSentLine({ index }));
        });
    };

    const ondestroy = () => {
        fieldBlocks.forEach((rect) => {
            rect.off('touchstart mousedown');
            rect.off('touchmove mouseenter');
            rect.off('touchend mouseup');
        });

        sentBlocks.forEach((rect, index) => {
            rect.off('touchstart mousedown');
            rect.off('touchmove mouseenter');
            rect.off('touchend mouseup');
        });
    };

    return <param name="konva" value="draw-event-box" oncreate={oncreate} ondestroy={ondestroy}/>;
};
