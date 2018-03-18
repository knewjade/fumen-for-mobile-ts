import { app } from 'hyperapp';
import { actions } from './actions';
import { view } from './view';
import { initState } from './states';

app(initState, actions, view, document.body);

window.onresize = () => {
    console.log('event: resize');
    // console.log(event);
    const [width, height] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
    // console.log(width + ' ' + height);
    // setTimeout(main.up, 10);
    // main.change({ width: -1, height: -1 });
    const canvas = document.getElementById('canvas');
    (canvas as any).myonresize(canvas);
};


// for unittest
export function hello(): string {
    return 'hello';
}
