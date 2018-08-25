import { datatest, px, py } from './_common';
import { operations } from './_operations';

describe('Drawing Tools', () => {
    it('Remove', () => {
        cy.visit('./public/index.html?d=v115@vhG9NYaAFLDmClcJSAVDEHBEooRBUoAVBa9aPCM+AA?A0sBXjB2uBzkBifBplBmhI8NjSFAooMDEPBAAAvhEHiuFA3?XaDEEBAAAHiBAwDHmBAAA');

        operations.screen.writable();

        operations.mode.tools.open();

        operations.mode.tools.removePage();
        operations.mode.tools.removePage();

        operations.mode.editor.nextPage();
        operations.mode.editor.nextPage();

        operations.mode.tools.removePage();

        operations.mode.editor.nextPage();
        operations.mode.editor.nextPage();

        operations.mode.tools.removePage();

        operations.mode.editor.nextPage();

        operations.mode.tools.removePage();
        operations.mode.tools.removePage();

        operations.mode.editor.nextPage();

        operations.mode.tools.removePage();

        // 新規ページ
        operations.mode.block.open();

        operations.mode.editor.nextPage();
        operations.mode.block.L();
        operations.mode.block.dragToRight({ from: 0, to: 5 }, 1);

        operations.mode.editor.nextPage();
        operations.mode.block.J();
        operations.mode.block.dragToRight({ from: 0, to: 5 }, 2);

        operations.mode.editor.nextPage();
        operations.mode.block.S();
        operations.mode.block.dragToRight({ from: 0, to: 5 }, 3);

        operations.mode.editor.nextPage();
        operations.mode.block.Z();
        operations.mode.block.dragToRight({ from: 0, to: 5 }, -1);

        // 書き込んだページを削除
        operations.mode.tools.open();

        operations.mode.editor.backPage();
        operations.mode.tools.removePage();

        operations.mode.editor.backPage();
        operations.mode.tools.removePage();

        operations.mode.editor.backPage();
        operations.mode.tools.removePage();

        operations.settings.copyToClipboard();

        // データを取り出す
        {
            cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@QhwwFeBtxwGeBtwwJeXDYaAFLDmClcJSAVDEHBEooR?BUoAVBa9aPCM+AAAvhA2uBIhRpHeRpaeifQXAFLDmClcJSA?VjiSAVG88AYP88AZSdBAvhAplBLhwwFeRpAewwAeAPAeQaA?egHhlQ4C8BtQpJeHiuFA3XaDEEBAAA9giWQaDexDwwBtg0Q?LAewhRLwSQahWQaQLwwwhhlwhA8HeAAJeHmB9gU4Eek0Eek?lOeEtEeAAA');
        }
    });
});
