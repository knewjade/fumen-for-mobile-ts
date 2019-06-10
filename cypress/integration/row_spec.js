import {expectFumen, visit} from '../support/common';
import {operations} from "../support/operations";

describe('Fill row', () => {
    it('Regular case', () => {
        visit({
            fumen: 'v115@3gwwHeywwhGeR4whBtAeRpAeR4glwhg0BtRpAeilwh?i0JeAgH',
            mode: 'writable',
        });

        operations.mode.fillRow.open();

        operations.mode.block.dragToUp(7, {from: 0, to: 6});

        expectFumen('v115@zgG8AeI8AeI8AeI8AeI8AeB8JeAgH')
    });
});
