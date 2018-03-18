import { app } from 'hyperapp';
import { actions } from './actions';
import { view } from './view';
import { initState } from './states';

app(initState, actions, view(), document.body);

// setTimeout(main.refresh as any, 1);
// window.onresize = () => {
//     console.log('event: resize [window]');
//     const canvas = document.getElementById('canvas');
//     (canvas as any).myonresize(canvas);
// };


// for unittest
export function hello(): string {
    return 'hello';
}
