import { VNode } from '@hyperapp/hyperapp';
import { main } from '../actions';
import { isEqual, isFunction } from 'lodash';

interface Component<S, A, L> {
    render(state: S): VNode<object>;
}

interface ComponentWithLocals<S, A, L> {
    render(state: S, locals: L): VNode<object>;
}

type Primitive = string | number | boolean;

class Hub<L> {
    public locals: L;

    private prevWatchKey_: { [key in string]: Primitive } = {};
    private watchKey_: { [key in string]: Primitive } = {};

    private shouldUpdate_ = true;

    constructor(locals: L) {
        this.locals = { ...locals };
    }

    watch(key: string, value: Primitive | (() => Primitive)): boolean {
        const v: Primitive = isFunction(value) ? value() : value;
        if (this.watchKey_[key] === v) {
            return false;
        }

        this.watchKey_[key] = v;
        return true;
    }

    refresh() {
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

export function componentize<S, A, L>(
    initLocals: L, generator: (initState: S, initActions: A, hub: Hub<L>) => ComponentWithLocals<S, A, L>,
): (state: S, actions: A) => Component<S, A, L> {
    return (initState, initActions) => {
        const hub = new Hub<L>(initLocals);
        const g = generator(initState, initActions, hub);

        let prev: { state: S, node: VNode<object> | null } = {
            state: { ...initState },
            node: null,
        };

        return {
            render: (state: S) => {
                if (prev.node === null || !isEqual(state, prev.state) || hub.shouldUpdate) {
                    const node = g.render(state, hub.locals);
                    prev = { node, state: { ...state } };
                    hub.updated();
                    return node;
                }

                return prev.node;
            },
        };
    };
}
