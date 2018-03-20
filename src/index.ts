import { app } from 'hyperapp';
import { actions } from './actions';
import { view } from './view';
import { initState } from './states';
import { decode } from './lib/fumen';

app(initState, actions, view(), document.body);

const pages = decode('ghE8JeAgh');
console.log(pages);

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
