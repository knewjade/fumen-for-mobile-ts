import { Component } from '../../lib/types';
import { h } from 'hyperapp';
import konva = require('konva');
import { action } from '../../actions';

interface Props {
    fieldBlocks: konva.Rect[];
    sentBlocks: konva.Rect[];
    actions: {
        ontouchStartPiece(data: { index: number }): void;
        // ontouchMoveField(data: { index: number }): void;

        // ontouchStartSentLine(data: { index: number }): action;
        // ontouchMoveSentLine(data: { index: number }): action;
        // ontouchEndSentLine(data: { index: number }): action;
    };
}

export const PieceEventCanvas: Component<Props> = ({ fieldBlocks, sentBlocks, actions }) => {
    const oncreate = () => {
        fieldBlocks.forEach((rect, index) => {
            rect.on('touchstart mousedown', () => actions.ontouchStartPiece({ index }));
            rect.on('touchmove mouseenter', () => {});
            rect.on('touchend mouseup', () => {});
        });

        sentBlocks.forEach((rect, index) => {
            rect.on('touchstart mousedown', () => {});
            rect.on('touchmove mouseenter', () => {});
            rect.on('touchend mouseup', () => {});
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

    return <param key="piece-event-canvas" name="konva" value="draw-event-box"
                  oncreate={oncreate} ondestroy={ondestroy}/>;
};
