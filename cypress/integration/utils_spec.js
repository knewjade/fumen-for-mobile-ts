import { expectFumen, visit } from '../support/common';
import { operations } from '../support/operations';

describe('Utils', () => {
    it('Mirror', () => {
        visit({
            fumen: 'v115@vhGBPJcJJTFJi/IvLJGBJNMJ',
            mode: 'edit',
        });

        operations.mode.tools.mirror({ home: true });

        expectFumen('v115@vhGBRJvNJTHJGDJcLJiBJ9KJ')

        operations.mode.tools.mirror({ home: true });

        expectFumen('v115@vhGBPJcJJTFJi/IvLJGBJNMJ')
    });
});
