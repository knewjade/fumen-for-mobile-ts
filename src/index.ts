import { app } from 'hyperapp';
import { actions } from './actions';
import { view } from './view';
import { initState } from './states';
import * as Konva from 'konva';

app(initState, actions, view(), document.body);

setTimeout(() => {

    const BOX_SIZE = 25;


    const width = window.innerWidth;
    const height = BOX_SIZE * 24;

    const stage = new Konva.Stage({
        width,
        height,
        container: 'container',
    });

    const layer = new Konva.Layer();
    layer.on('touchmove', (evt: any) => {
        const box = evt.target;
        box.fill('#333');
        box.draw();
    });

    stage.add(layer);


// generate boxes
    for (let ix = 0; ix < 10; ix += 1) {
        for (let iy = 0; iy < 24; iy += 1) {
            const box = new Konva.Rect({
                x: ix * BOX_SIZE,
                y: iy * BOX_SIZE,
                width: BOX_SIZE - 1,
                height: BOX_SIZE - 1,
                fill: '#599cff',
                stroke: 'white',
            });
            layer.add(box);
        }
    }
    layer.draw();


    const container = document.getElementById('container')!;

// create a simple instance
// by default, it only adds horizontal recognizers
    const hammer = new Hammer(container);
    hammer.get('pinch').set({ enable: true });
    hammer.on('tap pinch', (ev) => {
        console.log(ev);
        // container.textContent = ev.type + ' gesture detected.';
    });
}, 2000);

// window.onresize = () => {
//     console.log('event: resize [window]');
//     const canvas = document.getElementById('canvas');
//     (canvas as any).myonresize(canvas);
// };


// for unittest
export function hello(): string {
    return 'hello';
}
