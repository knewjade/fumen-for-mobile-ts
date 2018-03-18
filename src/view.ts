import { View, VNode, VNodeChild } from 'hyperapp';
import { button, canvas, div, footer, main } from '@hyperapp/html';
import { Actions, DownActions, UpActions } from './actions';
import { State } from './states';

interface Component<Props> {
    (props: Props, children?: VNodeChild<object | null>[]): VNode<object>;
}

type lifecycle = (element: any, oldattributes: any) => void;

// === メイン ===
export const view: View<State, Actions> = (state, actions) => (
    div({
        style: {
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
        },
    }, [
        // header(),
        main({
            style: {
                display: 'flex',
                flex: '1 0 auto',
                flexDirection: 'column',
            },
        }, [
            field({ state, actions }),
        ]),
        footer({
            className: 'page-footer',
            style: {
                flexBasis: '20px',
                marginTop: 'auto',
            },
        }, 'hello' + state.count),
    ])
);

// h1(state.count),
// up(state.count, actions),
// down(state.count, actions),
// section({}, {}),
// section({}, {}),

// ===  Up 操作 ===
const up: View<number, UpActions> = (count, actions) => (
    button({ onclick: () => actions.up(3), disabled: 10 <= count }, '+3')
);

// === Down 操作 ===
const down: View<number, DownActions> = (count, actions) => (
    button({ onclick: () => actions.down(2), disabled: count <= 0 }, '-2')
);

interface FieldProps {
    state: State;
    actions: Actions;
}

const field: Component<FieldProps> = (props) => {
    return canvas({
        id: 'canvas',
        style: {
            flex: '1 0 auto',
        },
        oncreate: (element: Element) => {
            console.log('event: create [canvas]');
            const [width, height] = [element.clientWidth, element.clientHeight];
            props.actions.change({ width, height });

        },
        onupdate: (element: Element) => {
            console.log('event: update [canvas]');
            console.log(props.state.canvas);
        },
        myonresize: (element: Element) => {
            console.log('event: reseize [canvas]');
            const [width, height] = [element.clientWidth, element.clientHeight];
            console.log('  old => ' + [props.state.canvas.width, props.state.canvas.height]);
            console.log('  new => ' + [width, height]);
            if (height !== props.state.canvas.height || width !== props.state.canvas.width) {
                props.actions.change({ width, height });
            }
        },
    });
};
