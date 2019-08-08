import { VNode } from '@hyperapp/hyperapp';
import { main } from '../actions';
import { forEach, isEqual } from 'lodash';

interface Component<Props> {
    render(props: Props): VNode<object>;
}

interface ComponentBase<Props, Locals> {
    render(props: Props, locals: Locals): VNode<object>;
}

type Primitive = string | number | boolean | undefined | null;

class Hub<Locals> {
    public readonly locals: Locals;

    private prevWatchKey_: { [key in string]: Primitive } = {};
    private watchKey_: { [key in string]: Primitive } = {};
    private watchs_: { [key in string]: (locals: Locals) => Primitive } = {};

    private shouldUpdate_ = true;

    constructor(locals: Locals) {
        this.locals = { ...locals };
    }

    watch(key: string, func: (locals: Locals) => Primitive): void {
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

export function componentize<Props, Actions, Locals>(
    initLocals: Locals,
    generator: (hub: Hub<Locals>, initProps: Props, initActions: Actions) => ComponentBase<Props, Locals>,
): (props: Props, actions: Actions) => Component<Props> {
    return (initProps, initActions) => {
        const hub = new Hub<Locals>(initLocals);
        const g = generator(hub, initProps, initActions);

        let prev: { props: Props, node: VNode<object> | null } = {
            props: { ...initProps },
            node: null,
        };

        return {
            render: (props: Props) => {
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
