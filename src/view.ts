import { View, VNode, VNodeChild } from 'hyperapp';
import { button, main, table, td, tr } from '@hyperapp/html';
import { Actions, DownActions, UpActions } from './actions';
import { State } from './states';

export interface Component<Props> {
    (props: Props, children?: VNodeChild<object | null>[]): VNode<object>;
}

// === メイン ===
export const view: View<State, Actions> = (state, actions) => (
    main([
        // h1(state.count),
        // up(state.count, actions),
        // down(state.count, actions),
        // section({}, {}),
        // section({}, {}),
        field({ state, actions }),
    ])
);

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
    const size = 30;
    const tableProps = {
        style: {
            width: size * 10 + 'px',
            height: size * 24 + 'px',
            margin: '0px',
            padding: '0px',
        },
    };
    return table(tableProps, Array.from({ length: 24 }).map((v, i) => line({
        ...props,
        size,
        y: i,
    })));
};

interface LineProps {
    state: State;
    actions: Actions;
    y: number;
    size: number;
}

const line: Component<LineProps> = (props) => {
    return tr(Array.from({ length: 10 }).map((v, i) => block({
        ...props,
        x: i,
    })));
};

interface BlockProps {
    state: State;
    actions: Actions;
    x: number;
    y: number;
    size: number;
}

const block: Component<BlockProps> = (props) => {
    const size = props.size;
    const value = props.state.field[props.y * 10 + props.x];
    const tdProps = {
        x: props.x,
        y: props.y,
        style: {
            width: size + 'px',
            height: size + 'px',
            background: value === 0 ? '#0089fc' : '#000',
            margin: '0px',
            padding: '0px',
        },
        ontouchmove: (event: any) => {
            const touch = event.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const attributes = element.attributes as any;
            const x = parseInt(attributes.x.nodeValue, 10);
            const y = parseInt(attributes.y.nodeValue, 10);
            return props.actions.off({ x, y });
        },
    };
    return td(tdProps);
};

window.addEventListener('touchmove.noScroll', (event) => {
    console.log('pass');
    event.preventDefault();
    event.stopPropagation();
    return false;
});
