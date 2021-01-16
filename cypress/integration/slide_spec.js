import {expectFumen, visit} from '../support/common';
import {operations} from "../support/operations";

describe('Slide', () => {
    it.skip('Up/Down', () => {
        visit({
            fumen: 'v115@bhE8AeI8AeD8AgH',
            mode: 'writable',
        });

        operations.mode.slide.open();
        operations.mode.slide.up();

        expectFumen('v115@RhE8AeD8JeE8AeD8AgH')

        operations.mode.slide.down();

        expectFumen('')
    });
});
