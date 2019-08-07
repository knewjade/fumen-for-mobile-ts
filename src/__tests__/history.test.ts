import { decode, encode } from '../lib/fumen/fumen';
import { toFumenTask, toPrimitivePage } from '../history_task';
import { CachePages } from '../lib/fumen/cache';

describe('history', () => {
    test('fumen', async () => {
        const init = await decode('v115@ehzhMeAgH');
        const task = toFumenTask(init.map(toPrimitivePage), 'v115@vhAVQJ', 0);

        // replay
        {
            const { pages, index } = await task.replay();
            const cachePages = new CachePages(pages);
            const data = await encode(cachePages.encode);
            expect(data).toEqual('vhAVQJ');
            expect(index).toEqual(0);
        }

        // revert
        {
            const { pages, index } = await task.revert();
            const cachePages = new CachePages(pages);
            const data = await encode(cachePages.encode);
            expect(data).toEqual('ehzhMeAgH');
            expect(index).toEqual(0);
        }
    });
});
