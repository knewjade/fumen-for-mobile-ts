import { View, VNode } from 'hyperapp';
import { State } from '../states';
import { Actions } from '../actions';
import { div } from '@hyperapp/html';
import { comment } from '../components/comment';
import { CommentType, Screens } from '../lib/enums';
import { Palette } from '../lib/colors';
import { ReaderTools } from '../components/tools/reader_tools';
import { pageSlider } from '../components/pageSlider';
import { managers } from '../repository/managers';
import { render } from '../componentsv2/reader/render';
import { getLayout, ReaderLayout } from '../componentsv2/reader/layout';
import { PageEnv } from '../env';

const Tools = (state: State, actions: Actions, height: number) => {
    return ReaderTools({
        actions,
        height,
        palette: Palette(Screens.Reader),
        animationState: state.play.status,
        pages: `${state.fumen.currentIndex + 1} / ${state.fumen.maxPage}`,
    });
};

export const getComment = (state: State, actions: Actions, layout: ReaderLayout) => {
    switch (state.mode.comment) {
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
    default: {
        return comment({
            key: 'text-comment',
            dataTest: 'text-comment',
            id: 'text-comment',
            textColor: state.comment.isChanged ? '#fff' : '#333',
            backgroundColorClass: state.comment.text !== '' && state.comment.isChanged ? 'green darken-1' : 'white',
            height: layout.comment.size.height,
            text: state.comment.text,
            readonly: true,
            commentKey: state.comment.changeKey,
        });
    }
    }
};

export const view: View<State, Actions> = (state, actions) => {
    const layout = getLayout(state.display);

    const children = [
        div({ key: 'field-top' }, [
            managers.konva.render(layout.canvas.size, actions.refresh),

        ]),

        div({ key: 'menu-top' }, [
            getComment(state, actions, layout),

            Tools(state, actions, layout.tools.size.height),
        ]),
    ];

    managers.konva.update(() => {
        const renderObj = managers.caches.get('reader.konva', () => render(layout, state, actions));
        renderObj.update(layout, state, actions);

        // Elements for tests
        const nodes = div({}, renderObj.toNodes().filter(v => v !== undefined) as VNode<{}>[]);
        children.push(nodes as any);
    });

    return div({ key: 'view' }, children);
};
