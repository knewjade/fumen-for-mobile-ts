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
});
