import { div } from '@hyperapp/html';
import { VNode } from 'hyperapp';
import { Children } from '../lib/types';

interface ModalProps {
    oncreate: (element: any) => void;
}

type ModalFunc = (props: ModalProps, content: Children, footer: Children) => VNode<any>;

export const modal: ModalFunc = (props, content, footer) => {
    return div({
        ...props,
        id: 'modal',
        className: 'modal bottom-sheet',
    }, [
        div({
            className: 'modal-content',
        }, content),
        div({
            className: 'modal-footer',
        }, footer),
    ]);
};
