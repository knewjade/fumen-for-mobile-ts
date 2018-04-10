import { CSSProperties } from 'typestyle/lib/types';
import { VNode } from 'hyperapp';

export interface ModalInstance {
    open: () => void;
    close: () => void;
    destroy: () => void;
}

export const style: (properties: CSSProperties) => CSSProperties = properties => properties;

export type Children = string | number | (string | number | VNode<{}>)[];

export interface Component<Props = {}> {
    (props: Props, children?: Children): VNode<object>;
}
