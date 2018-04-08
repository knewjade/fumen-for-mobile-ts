import { div } from '@hyperapp/html';
import { VNode } from 'hyperapp';
import { Children } from '../lib/types';

interface ModalProps {
    id: string;
    enable: boolean;
    bottomSheet: boolean;
    oncreate: (element: HTMLDivElement, attr: ModalProps) => void;
    onupdate: (element: HTMLDivElement, attr: ModalProps) => void;
}

type ModalFunc = (props: ModalProps, content: Children, footer: Children) => VNode<any>;

export const modal: ModalFunc = (props, content, footer) => {
    return div({
        ...props,
        className: 'modal' + (props.bottomSheet ? ' bottom-sheet' : ''),
    }, [
        div({
            className: 'modal-content',
        }, content),
        div({
            className: 'modal-footer',
        }, footer),
    ]);
};
