import { View } from 'hyperapp';
import { div, footer, main, span } from '@hyperapp/html';
import { Actions } from './actions';
import { State } from './states';

// === メイン ===
export const view: () => View<State, Actions> = () => {
    return () => {
        return div({
            style: {
                display: 'flex',
                minHeight: '100%',
                flexDirection: 'column',
            },
        }, [
            main({
                id: 'container',
                style: {
                    flex: '1 0 auto',
                },
            }),
            footer({
                style: {
                    flexBasis: '50px',
                    marginTop: 'auto',
                },
            }, [
                span('hello'),
                div({
                    className: 'page-footer',
                }, 'world'),
            ]),
        ]);
    };
};

