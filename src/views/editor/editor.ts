import { CommentType, ModeTypes, Screens } from '../../lib/enums';
import { View } from 'hyperapp';
import { resources, State } from '../../states';
import { EditorTools } from '../../components/tools/editor_tools';
import { Palette } from '../../lib/colors';
import { Actions } from '../../actions';
import { div } from '@hyperapp/html';
import { px, style } from '../../lib/types';
import { ViewError } from '../../lib/errors';
import { comment } from '../../components/comment';
import { pageSlider } from '../../components/pageSlider';
import { toolMode } from './tool_mode';
import { blockMode } from './block_mode';
import { pieceMode } from './piece_mode';
import { flagsMode } from './flags_mode';
import { slideMode } from './slide_mode';
import { fillMode } from './fill_mode';
import { pieceSelectMode } from './piece_select_mode';
import { managers } from '../../repository/managers';
import { render } from '../../componentsv2/editor/render';
import { EditorLayout, getLayout } from '../../componentsv2/editor/layout';

export const toolStyle = (layout: EditorLayout) => {
    const margin = (layout.canvas.size.height - layout.field.size.height) / 2;
    return style({
        marginTop: '0px',
        marginBottom: '0px',
        marginLeft: '10px',
        marginRight: '0px',
        padding: `${px(margin)} 0px`,
        display: 'flex',
        justifyContent: 'flex-end',
        flexDirection: 'column',
        alignItems: 'center',
        height: px(layout.canvas.size.height),
        width: px(layout.buttons.size.width),
    });
};

const getMode = (state: State, actions: Actions, layout: EditorLayout) => {
    const pages = state.fumen.pages;
    const page = pages[state.fumen.currentIndex];
    const keyPage = page === undefined || page.field.obj !== undefined;

    // テト譜の仕様により、最初のページのフラグが全体に反映される
    const guideLineColor = state.fumen.pages[0] !== undefined ? state.fumen.pages[0].flags.colorize : true;

    switch (state.mode.type) {
    case ModeTypes.Drawing: {
        return blockMode({
            layout,
            actions,
            colorize: guideLineColor,
            modePiece: state.mode.piece,
        });
    }
    case ModeTypes.DrawingTool: {
        return toolMode({
            layout,
            actions,
            keyPage,
            touchType: state.mode.touch,
            currentIndex: state.fumen.currentIndex,
        });
    }
    case ModeTypes.Piece: {
        const page = state.fumen.pages[state.fumen.currentIndex];
        return pieceMode({
            layout,
            actions,
            move: page !== undefined ? page.piece : undefined,
            existInferences: 0 < state.events.inferences.length,
            pages: state.fumen.pages,
            flags: page.flags,
            touchType: state.mode.touch,
            currentIndex: state.fumen.currentIndex,
        });
    }
    case ModeTypes.Flags: {
        return flagsMode({
            layout,
            actions,
            flags: page.flags,
            currentIndex: state.fumen.currentIndex,
        });
    }
    case ModeTypes.Slide: {
        return slideMode({
            layout,
            actions,
        });
    }
    case ModeTypes.Fill: {
        return fillMode({
            layout,
            actions,
            colorize: guideLineColor,
            modePiece: state.mode.piece,
        });
    }
    case ModeTypes.SelectPiece: {
        return pieceSelectMode({
            layout,
            actions,
            colorize: guideLineColor,
        });
    }
    }

    throw new ViewError('Illegal mode');
};

const Tools = (state: State, actions: Actions, height: number) => {
    return EditorTools({
        actions,
        height,
        palette: Palette(Screens.Editor),
        animationState: state.play.status,
        currentPage: state.fumen.currentIndex + 1,
        maxPage: state.fumen.maxPage,
        modeType: state.mode.type,
        undoCount: state.history.undoCount,
        redoCount: state.history.redoCount,
        inferenceCount: state.events.inferences.length,
    });
};

export const getComment = (state: State, actions: Actions, layout: EditorLayout) => {
    const currentIndex = state.fumen.currentIndex;
    const currentPage = state.fumen.pages[currentIndex];

    switch (state.mode.comment) {
    case CommentType.Writable: {
        const isCommentKey = resources.comment !== undefined
            || (currentPage !== undefined && currentPage.comment.text !== undefined);

        const element = document.querySelector('#text-comment') as HTMLInputElement;
        const updateText = () => {
            if (element) {
                actions.updateCommentText({ text: element.value, pageIndex: state.fumen.currentIndex });
            }
        };
        return comment({
            key: 'text-comment',
            dataTest: 'text-comment',
            id: 'text-comment',
            textColor: isCommentKey ? '#333' : '#757575',
            backgroundColorClass: 'white',
            height: layout.comment.size.height,
            text: resources.comment !== undefined ? resources.comment.text : state.comment.text,
            placeholder: 'comment',
            readonly: false,
            commentKey: state.comment.changeKey,
            actions: {
                onupdate: updateText,
                onenter: () => {
                    if (element) {
                        element.blur();
                    }
                },
                onblur: () => {
                    updateText();
                    actions.commitCommentText();
                },
            },
        });
    }
    case CommentType.Readonly: {
        const currentIndex = state.fumen.currentIndex;
        const currentPage = state.fumen.pages[currentIndex];
        const isCommentKey = resources.comment !== undefined
            || (currentPage !== undefined && currentPage.comment.text !== undefined);

        return comment({
            key: 'text-comment',
            dataTest: 'text-comment',
            id: 'text-comment',
            textColor: isCommentKey ? '#333' : '#757575',
            backgroundColorClass: 'white',
            height: layout.comment.size.height,
            text: resources.comment !== undefined ? resources.comment.text : state.comment.text,
            readonly: true,
            commentKey: state.comment.changeKey,
        });
    }
    case CommentType.PageSlider: {
        return pageSlider({
            actions,
            datatest: 'range-page-slider',
            size: {
                width: layout.comment.size.width * 0.8,
                height: layout.comment.size.height,
            },
            currentIndex: state.fumen.currentIndex,
            maxPage: state.fumen.maxPage,
        });
    }
    }

    return div({
        style: style({
            width: px(layout.comment.size.width),
            height: px(layout.comment.size.height),
        }),
    });
};

export const view: View<State, Actions> = (state, actions) => {
    const layout = getLayout(state.display);

    const node = div({ key: 'view' }, [
        div({
            key: 'field-top',
            style: style({
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                userSelect: 'none',
            }),
        }, [
            managers.konva.render(layout.canvas.size, actions.refresh),

            getMode(state, actions, layout),
        ]),

        div({ key: 'menu-top' }, [
            getComment(state, actions, layout),

            Tools(state, actions, layout.tools.size.height),
        ]),
    ]);

    managers.konva.update(() => {
        managers.caches.get('editor.konva', () => render(layout, state, actions))
            .update(layout, state, actions);
    });

    return node;
};
