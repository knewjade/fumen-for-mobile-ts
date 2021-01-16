import {expectFumen, visit} from '../support/common';
import {operations} from "../support/operations";

describe('Fill row', () => {
    it('Regular case', () => {
        visit({
            fumen: 'v115@3gwwHeywwhGeR4whBtAeRpAeR4glwhg0BtRpAeilwh?i0JeAgH',
            mode: 'writable',
        });

        operations.mode.fillRow.open();

        operations.mode.block.dragToUp(7, {from: 0, to: 3});
        operations.mode.block.dragToUp(9, {from: 4, to: 5});
        operations.mode.block.dragToUp(0, {from: 6, to: 8});

        expectFumen('v115@MgI8AeI8AeR8AeI8AeG8AeI8AeI8AeI8AeB8JeAgH')
    });

    it.skip('Row -> Slide -> Row', () => {
        visit({
            fumen: 'v115@vhAAgH',
            mode: 'writable',
        });

        operations.mode.fillRow.open();
        operations.mode.block.dragToUp(1, {from: 0, to: 4});

        operations.mode.tools.duplicatePage({ home: true });

        operations.mode.slide.open({ home: true });
        for (let i = 0; i < 5; i++) {
            operations.mode.slide.up();
        }

        operations.mode.fillRow.open({ home: true });
        operations.mode.block.dragToUp(7, {from: 0, to: 2});

        expectFumen('v115@zgA8AeI8AeI8AeI8AeI8AeH8JeAgHBgA8AeI8AeI8A?eI8AeI8AeH8AAAeIAAeHAAeA8EeAACeA8EeAACeA8EeAALe?AgH')
    });
});
