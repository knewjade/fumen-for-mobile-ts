import { div } from '@hyperapp/html';
import { VNode } from 'hyperapp';
import { Children } from '../lib/types';

interface ModalProps {
    id: string;
    key: string;
    isOpened: boolean;
    bottomSheet: boolean;
    oncreate: (element: HTMLDivElement, attr: ModalProps) => void;
    onupdate: (element: HTMLDivElement, attr: ModalProps) => void;
}

type ModalFunc = (props: ModalProps, content?: Children, footer?: Children) => VNode<any>;

export const modal: ModalFunc = (props, content, footer) => {
    /**
     Caution: MaterializeのModalは、指定したmodal-divの次の要素としてoverlay-divを生成する。
     そのとき、hyperappは管理していない要素をみつけ、結果エラーとなる。
     そのため、overlayが最後の要素となるようにmodalをwrapするdivを用意する
     */
    return div({
        key: props.key,
    }, [
        div({
            id: props.id,
            isOpened: props.isOpened,
            bottomSheet: props.bottomSheet,
            oncreate: props.oncreate,
            onupdate: props.onupdate,
            className: 'modal' + (props.bottomSheet ? ' bottom-sheet' : ''),
        }, [
            div({
                className: 'modal-content',
            }, content),
            div({
                className: 'modal-footer',
            }, footer),
        ]),
    ]);
};
