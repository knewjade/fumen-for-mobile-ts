import { VNode } from '@hyperapp/hyperapp';
import { main } from '../actions';
import { forEach, isEqual } from 'lodash';

interface Component<P, A, L> {
    render(props: P): VNode<object>;
}

interface ComponentWithLocals<P, A, L> {
    render(props: P, locals: L): VNode<object>;
}

type Primitive = string | number | boolean | undefined | null;

class Hub<L> {
    public readonly locals: L;

    private prevWatchKey_: { [key in string]: Primitive } = {};
    private watchKey_: { [key in string]: Primitive } = {};
    private watchs_: { [key in string]: (locals: L) => Primitive } = {};

    private shouldUpdate_ = true;

    constructor(locals: L) {
        this.locals = { ...locals };
    }

    watch(key: string, func: (locals: L) => Primitive): void {
        this.watchs_[key] = func;
    }

    refresh() {
        forEach(this.watchs_, (func, key) => {
            this.watchKey_[key] = func(this.locals);
        });

        this.shouldUpdate_ = this.shouldUpdate_ || !isEqual(this.watchKey_, this.prevWatchKey_);
        this.prevWatchKey_ = { ...this.watchKey_ };

        if (this.shouldUpdate_) {
            main.refresh();
        }
    }

    updated() {
        this.shouldUpdate_ = false;
    }

    get shouldUpdate() {
        return this.shouldUpdate_;
    }
}

export function componentize<P, A, L>(
    initLocals: L, generator: (hub: Hub<L>, initProps: P, initActions: A) => ComponentWithLocals<P, A, L>,
): (props: P, actions: A) => Component<P, A, L> {
    return (initProps, initActions) => {
        const hub = new Hub<L>(initLocals);
        const g = generator(hub, initProps, initActions);

        let prev: { props: P, node: VNode<object> | null } = {
            props: { ...initProps },
            node: null,
        };

        return {
            render: (props: P) => {
                if (prev.node === null || !isEqual(props, prev.props) || hub.shouldUpdate) {
                    const node = g.render(props, hub.locals);
                    prev = { node, props: { ...props } };
                    hub.updated();
                    return node;
                }

                return prev.node;
            },
        };
    };
}
