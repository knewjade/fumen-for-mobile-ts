import { expectFumen, visit } from '../support/common';
import { operations } from '../support/operations';

// テト譜を開く
describe('Fill', () => {
    it('Fill field', () => {
        visit({ fumen: 'v115@9gB8DeD8BeA8CeA8FeA8BeA8EeA8CeA8MeAgH', mode: 'edit' });

        operations.mode.fill.open();
        operations.mode.fill.Gray();

        {
            operations.mode.block.click(1, 1);
        }

        operations.mode.block.J();

        {
            operations.mode.block.click(8, 1);
        }

        expectFumen('v115@9gB8DeG8CeA8i0D8BeA8i0C8CeA8i0JeAgH');

        operations.mode.block.Z();

        {
            operations.mode.block.click(8, 1);
        }

        expectFumen('v115@9gB8DeG8CeA8CtD8BeA8CtC8CeA8CtJeAgH');

        operations.mode.block.Empty();

        {
            operations.mode.block.dragToUp(8, { from: 0, to: 3 });
        }

        expectFumen('v115@9gB8HeC8GeD8FeC8QeAgH');
    });

    it('Draw sent line', () => {
        visit({ fumen: 'v115@vhAAgH', mode: 'edit' });

        operations.mode.fill.open();
        operations.mode.fill.Gray();

        {
            operations.mode.block.click(1, -1);
        }

        expectFumen('v115@lhJ8AgH');

        operations.mode.block.open({ home: true });
        operations.mode.block.O();

        {
            operations.mode.block.click(5, -1);
        }

        operations.mode.fill.open({ home: true });

        {
            operations.mode.block.click(7, -1);
        }

        expectFumen('v115@lhE8UpAgH');

        {
            operations.mode.block.click(7, -1);
        }

        expectFumen('v115@lhE8UpAgH');
    });
});
