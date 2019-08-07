import {
    block,
    Color,
    datatest,
    expectFumen,
    minoPosition,
    Piece,
    px,
    py,
    rightTap,
    Rotation,
    visit
} from '../support/common';
import { operations } from '../support/operations';

describe('Drawing Tools', () => {
    it('Duplicate page', () => {
        visit({
            fumen: 'v115@vhF2OYaAFLDmClcJSAVDEHBEooRBKoAVBTXNFDsOBA?A3rBzkBsqBifBAAA',
            mode: 'writable',
        });

        operations.mode.tools.open();
        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();
        operations.mode.tools.duplicatePage();
        operations.mode.tools.toRef();

        operations.menu.lastPage();
        operations.mode.tools.duplicatePage();

        operations.menu.firstPage();

        operations.mode.block.open();
        operations.mode.block.Gray();
        operations.mode.block.click(9, 0);

        expectFumen('v115@khA8Je2OYaAFLDmClcJSAVDEHBEooRBKoAVBTXNFDs?OBAAvhB3rBzkBIhxSHexSaezkBvhCsqBifBAAAkhAAJeAAA');

        operations.mode.tools.home();
        operations.mode.tools.duplicatePage();

        expectFumen('v115@khA8Je2OYaAFLDmClcJSAVDEHBEooRBKoAVBTXNFDs?OBAARhgHIeiHQe2uBvhB3rBzkBIhxSHexSaezkBvhCsqBif?BAAAkhAAJeAAA');

        operations.mode.tools.undo();

        expectFumen('v115@khA8Je2OYaAFLDmClcJSAVDEHBEooRBKoAVBTXNFDs?OBAAvhB3rBzkBIhxSHexSaezkBvhCsqBifBAAAkhAAJeAAA');

        operations.mode.tools.redo();

        expectFumen('v115@khA8Je2OYaAFLDmClcJSAVDEHBEooRBKoAVBTXNFDs?OBAARhgHIeiHQe2uBvhB3rBzkBIhxSHexSaezkBvhCsqBif?BAAAkhAAJeAAA');

        operations.menu.lastPage();
        operations.mode.tools.backPage();

        operations.mode.tools.home();
        operations.mode.piece.open();

        minoPosition(Piece.T, Rotation.Spawn)(8, 1).forEach((block) => {
            operations.mode.block.click(block[0], block[1]);
        });

        operations.mode.tools.home();
        operations.mode.tools.duplicatePage();

        expectFumen('v115@khA8Je2OYaAFLDmClcJSAVDEHBEooRBKoAVBTXNFDs?OBAARhgHIeiHQe2uBvhB3rBzkBIhxSHexSaezkBvhCsqBif?BVtB9gilHexhAeAtEeAtBeAtAeR4AeQLUeVtB9gilHexhAe?AtEeAtBeAtAeR4AeQLJeAAJeAAA');
    });

    it('Update by lock flag', () => {
        visit({
            fumen: 'v115@bhJ8JeAgH',
            mode: 'writable',
        });

        cy.get(block(0, 0)).should('have.attr', 'color', Color.Gray.Highlight1);

        operations.mode.flags.open();
        operations.mode.flags.lockToOff();

        cy.get(block(0, 0)).should('have.attr', 'color', Color.Gray.Normal);

        operations.mode.flags.lockToOn();

        cy.get(block(0, 0)).should('have.attr', 'color', Color.Gray.Highlight1);
    });

    it('Remove', () => {
        visit({
            fumen: 'v115@vhG9NYaAFLDmClcJSAVDEHBEooRBUoAVBa9aPCM+AA?A0sBXjB2uBzkBifBplBmhI8NjSFAooMDEPBAAAvhEHiuFA3?XaDEEBAAAHiBAwDHmBAAA',
            mode: 'writable',
        });

        operations.mode.tools.open();

        operations.mode.tools.removePage();
        operations.mode.tools.removePage();

        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        operations.mode.tools.removePage();

        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        operations.mode.tools.removePage();

        operations.mode.tools.nextPage();

        operations.mode.tools.removePage();
        operations.mode.tools.removePage();

        operations.mode.tools.nextPage();

        operations.mode.tools.removePage();

        // 新規ページ
        operations.mode.block.open();

        operations.mode.tools.nextPage();
        operations.mode.block.L();
        operations.mode.block.dragToRight({ from: 0, to: 5 }, 1);

        operations.mode.tools.nextPage();
        operations.mode.block.J();
        operations.mode.block.dragToRight({ from: 0, to: 5 }, 2);

        operations.mode.tools.nextPage();
        operations.mode.block.S();
        operations.mode.block.dragToRight({ from: 0, to: 5 }, 3);

        operations.mode.tools.nextPage();
        operations.mode.block.Z();
        operations.mode.block.dragToRight({ from: 0, to: 5 }, -1);

        // 書き込んだページを削除
        operations.mode.tools.open();

        operations.mode.tools.backPage();
        operations.mode.tools.removePage();

        operations.mode.tools.backPage();
        operations.mode.tools.removePage();

        operations.mode.tools.backPage();
        operations.mode.tools.removePage();

        expectFumen('v115@QhwwFeBtxwGeBtwwJeXDYYAFLDmClcJSAVDEHBEooR?BToAVBv/7LCvhA2uBIhRpHeRpaeifQVAFLDmClcJSAVzbSA?VG88A4N88AZAAAAvhAplBLhwwFeRpAewwAeAPAeQaAegHhl?Q4C8BtQpJeHiuFA3XaDEEBAAA9giWQaDexDwwBtg0QLAewh?RLwSQahWQaQLwwwhhlwhA8HeAAJeHmB9gV4Del0DellNeFt?DeAAA');
    });

    it('Undo/Redo', () => {
        visit({
            fumen: 'v115@HhglIeglIehlAezhMeAgH',
            mode: 'writable',
        });

        operations.mode.tools.open();

        operations.mode.tools.nextPage();

        operations.mode.block.open();

        operations.mode.block.S();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 0);

        operations.mode.block.Z();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 1);

        operations.mode.block.T();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 2);

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 2');
        cy.get(block(9, 0)).should('have.attr', 'color', Color.S.Normal);
        cy.get(block(9, 1)).should('have.attr', 'color', Color.Z.Normal);
        cy.get(block(9, 2)).should('have.attr', 'color', Color.T.Normal);

        // Undo
        operations.mode.tools.undo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 2');
        cy.get(block(9, 0)).should('have.attr', 'color', Color.S.Normal);
        cy.get(block(9, 1)).should('have.attr', 'color', Color.Z.Normal);
        cy.get(block(9, 2)).should('not.have.attr', 'color', Color.T.Normal);

        operations.mode.tools.undo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 2');
        cy.get(block(9, 0)).should('have.attr', 'color', Color.S.Normal);
        cy.get(block(9, 1)).should('not.have.attr', 'color', Color.Z.Normal);
        cy.get(block(9, 2)).should('not.have.attr', 'color', Color.T.Normal);

        operations.mode.tools.undo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 2');
        cy.get(block(9, 0)).should('not.have.attr', 'color', Color.S.Normal);
        cy.get(block(9, 1)).should('not.have.attr', 'color', Color.Z.Normal);
        cy.get(block(9, 2)).should('not.have.attr', 'color', Color.T.Normal);

        operations.mode.tools.undo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');
        cy.get(block(9, 0)).should('not.have.attr', 'color', Color.S.Normal);
        cy.get(block(9, 1)).should('not.have.attr', 'color', Color.Z.Normal);
        cy.get(block(9, 2)).should('not.have.attr', 'color', Color.T.Normal);

        operations.mode.tools.undo();

        cy.get(block(6, 0)).should('have.attr', 'color', Color.I.Normal);

        // inference

        operations.mode.block.Completion();
        operations.mode.block.click(9, 0);

        operations.mode.tools.undo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');
        cy.get(block(9, 0)).should('not.have.attr', 'color', Color.S.Normal);
        cy.get(block(9, 1)).should('not.have.attr', 'color', Color.Z.Normal);
        cy.get(block(9, 2)).should('not.have.attr', 'color', Color.T.Normal);

        // Redo
        operations.mode.tools.redo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 2');
        cy.get(block(9, 0)).should('not.have.attr', 'color', Color.S.Normal);
        cy.get(block(9, 1)).should('not.have.attr', 'color', Color.Z.Normal);
        cy.get(block(9, 2)).should('not.have.attr', 'color', Color.T.Normal);

        operations.mode.tools.redo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 2');
        cy.get(block(9, 0)).should('have.attr', 'color', Color.S.Normal);
        cy.get(block(9, 1)).should('not.have.attr', 'color', Color.Z.Normal);
        cy.get(block(9, 2)).should('not.have.attr', 'color', Color.T.Normal);

        // Remove page
        operations.mode.tools.open();

        operations.mode.tools.backPage();
        operations.mode.tools.removePage();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');

        operations.mode.tools.undo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 2');
        cy.get(block(6, 0)).should('have.attr', 'color', Color.I.Normal);
        cy.get(block(9, 0)).should('not.have.attr', 'color', Color.S.Normal);

        operations.mode.tools.redo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');

        operations.mode.tools.undo();

        operations.mode.tools.nextPage();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 2');
        cy.get(block(6, 0)).should('have.attr', 'color', Color.I.Normal);
        cy.get(block(9, 0)).should('have.attr', 'color', Color.S.Normal);

        // New page
        operations.menu.newPage();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');
        cy.get(block(6, 0)).should('not.have.attr', 'color', Color.I.Normal);
        cy.get(block(9, 0)).should('not.have.attr', 'color', Color.S.Normal);

        operations.mode.tools.undo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 2');
        cy.get(block(6, 0)).should('have.attr', 'color', Color.I.Normal);
        cy.get(block(9, 0)).should('have.attr', 'color', Color.S.Normal);

        operations.mode.tools.redo();

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');
        cy.get(block(6, 0)).should('not.have.attr', 'color', Color.I.Normal);
        cy.get(block(9, 0)).should('not.have.attr', 'color', Color.S.Normal);

        operations.mode.tools.undo();

        // http://harddrop.com/fumen/?
        expectFumen('v115@HhglIeglIehlAezhMeAgHihS4JeAAA');
    });

    it.only('Auto save', () => {
        visit({
            fumen: 'v115@HhglIeglIehlAezhMeAgH',
            mode: 'writable',
        });

        operations.mode.tools.open();

        operations.mode.tools.nextPage();

        operations.mode.block.open();

        operations.mode.block.O();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 0);

        operations.mode.block.J();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 1);

        cy.wait(1000);

        visit({ mode: 'writable', reload: true });

        expectFumen('v115@HhglIeglIehlAezhMeAgHYhi0GeSpJeAAA');

        operations.mode.block.open();

        operations.menu.lastPage();

        operations.mode.tools.nextPage();

        operations.mode.block.T();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 2);

        operations.mode.block.S();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 3);

        operations.mode.tools.undo();

        cy.wait(1000);

        visit({ reload: true });

        expectFumen('v115@HhglIeglIehlAezhMeAgHYhi0GeSpJeAAAOhywdeAA?A');

        operations.screen.writable();

        operations.mode.block.open();

        operations.menu.lastPage();

        operations.mode.tools.nextPage();

        operations.mode.block.L();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 4);

        operations.mode.block.I();
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 4);

        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.redo();

        cy.wait(1000);

        visit({ reload: true });

        expectFumen('v115@HhglIeglIehlAezhMeAgHYhi0GeSpJeAAAOhywdeAA?A6gilxeAAA');
    });

    it('Flags', () => {
        visit({
            fumen: 'v115@lhwhglQpAtwwg0Q4CeAgH',
            mode: 'writable',
        });

        operations.mode.block.open();

        operations.mode.block.Gray();

        operations.mode.block.click(7, -1);

        operations.mode.block.click(0, 0);
        operations.mode.block.click(1, 0);
        operations.mode.block.click(0, 1);

        operations.mode.tools.home();
        operations.mode.flags.open();

        operations.mode.flags.riseToOn();
        operations.mode.flags.mirrorToOn();

        operations.mode.tools.nextPage();

        // 2ページ目
        operations.mode.tools.home();
        operations.mode.block.open();

        operations.mode.block.T();

        operations.mode.block.click(0, 0);
        operations.mode.block.click(1, 0);

        operations.mode.block.click(0, -1);

        operations.mode.tools.home();
        operations.mode.flags.open();

        operations.mode.flags.riseToOn();
        operations.mode.flags.mirrorToOn();

        operations.mode.flags.lockToOff();
        operations.mode.flags.riseToOff();
        operations.mode.flags.mirrorToOff();

        operations.mode.tools.nextPage();

        // 3ページ目
        operations.mode.flags.lockToOn();
        operations.mode.flags.mirrorToOn();
        operations.mode.tools.nextPage();

        expectFumen('v115@RhA8IeB8HewhglQpAtwwg0Q4A8BeAINbhxwHewwIeA?AevhBAwDAAA');

        // 3ページ目
        operations.mode.flags.lockToOff();
        operations.mode.flags.mirrorToOn();
        operations.mode.flags.riseToOn();

        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();

        expectFumen('v115@RhA8IeB8HewhglQpAtwwg0Q4A8BeAINbhxwHewwIeA?AevhBAwDAAA');

        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();

        expectFumen('v115@RhA8IeB8HewhglQpAtwwg0Q4A8BeAINbhxwHewwIeA?AevhBAwDAoj');
    });

    it('Flags 2', () => {
        visit({});

        operations.menu.newPage();

        operations.mode.block.open();

        operations.mode.block.I();

        minoPosition(Piece.I, Rotation.Spawn)(1, 0).forEach((block) => {
            operations.mode.block.click(block[0], block[1]);
        });

        operations.mode.tools.home();
        operations.mode.flags.open();

        operations.mode.flags.lockToOff();
        operations.mode.flags.riseToOn();
        operations.mode.flags.mirrorToOn();

        for (let i = 0; i < 10; i++) {
            operations.mode.tools.nextPage();
        }

        minoPosition(Piece.I, Rotation.Spawn)(1, 0).forEach((p) => {
            cy.get(block(p[0], p[1])).should('have.attr', 'color', Color.I.Normal);
        });

        expectFumen('v115@bhzhPeAIrvhJAojAojAojAojAojAojAojAojAojAoj');
    });

    it('Slide', () => {
        visit({
            fumen: 'v115@heB8GeD8FeD8GeB8hfB8GeD8FeD8GeB8rexyHjeTaH?hxwIfgTaLfJHJDhQaIeQaIeQaIeQaMepmH',
        });

        // MenuからWritableモードにして開く
        operations.screen.writable();

        operations.mode.slide.open();

        operations.mode.slide.right();
        operations.mode.slide.left();

        operations.mode.tools.nextPage();

        operations.mode.slide.left();
        operations.mode.slide.right();

        operations.mode.tools.nextPage();

        operations.mode.slide.down();
        operations.mode.slide.up();

        operations.mode.tools.nextPage();

        operations.mode.slide.up();
        operations.mode.slide.down();

        expectFumen('v115@heB8GeD8FeD8GeB8hfB8GeD8FeD8GeB8reAgHvhCAA?AAAAAAA');

        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        operations.mode.tools.backPage();
        operations.mode.tools.home();
        operations.mode.tools.toRef();

        operations.mode.tools.backPage();

        operations.mode.slide.open();
        operations.mode.slide.down();

        expectFumen('v115@heB8GeD8FeD8GeB8hfB8GeD8FeD8GeB8reAgHvhBAA?AAAAheBAGeAABeAAPeA8BeA8GeB8XfBAGeAABeAAPeA8BeA?8GeB8heAAAvhAAAAheB8GeA8BeA8PeAABeAAGeBAXfB8GeA?8BeA8PeAABeAAGeBAheAAA');
    });

    it('Clear button visibility', () => {
        visit({
            fumen: 'v115@vhF2OYaAFLDmClcJSAVDEHBEooRBKoAVBTXNFDsOBA?A3rBzkBsqBifBAAA',
            mode: 'writable',
        });

        {
            operations.menu.firstPage();

            operations.menu.open();

            cy.get(datatest('btn-clear-to-end')).should('not.have.class', 'disabled');
            cy.get(datatest('btn-clear-past')).should('have.class', 'disabled');
        }

        rightTap();

        {
            operations.menu.lastPage();

            operations.menu.open();

            cy.get(datatest('btn-clear-to-end')).should('have.class', 'disabled');
            cy.get(datatest('btn-clear-past')).should('not.have.class', 'disabled');
        }

        rightTap();

        {
            operations.mode.tools.backPage();

            operations.menu.open();

            cy.get(datatest('btn-clear-to-end')).should('not.have.class', 'disabled');
            cy.get(datatest('btn-clear-past')).should('not.have.class', 'disabled');
        }

        rightTap();

        {
            operations.menu.newPage();

            operations.menu.open();

            cy.get(datatest('btn-clear-to-end')).should('have.class', 'disabled');
            cy.get(datatest('btn-clear-past')).should('have.class', 'disabled');
        }
    });
});
