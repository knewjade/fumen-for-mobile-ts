import { datatest, expectFumen, minoPosition, Piece, Rotation, visit } from '../support/common';
import { operations } from '../support/operations';

describe('Comments', () => {
    it('Should not apply comment to other pages', () => {
        visit({ mode: 'edit' });

        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        cy.get(datatest('text-comment')).type('こんにちは');
        cy.get(datatest('text-comment')).should('have.value', 'こんにちは');

        operations.mode.tools.backPage();

        cy.get(datatest('text-comment')).should('have.value', '');

        operations.mode.tools.backPage();

        cy.get(datatest('text-comment')).should('have.value', '');

        expectFumen('v115@vhCAgHAgHAgWeAlvs2A1sDfEToABBlvs2AWDEfET4J?6Alvs2AW5AAA');
    });

    it('Comment readonly/writable', () => {
        visit({ mode: 'edit' });

        operations.mode.piece.open();

        cy.get(datatest('text-comment')).type('hello');

        operations.menu.commentReadonly();

        cy.get(datatest('text-comment')).should('have.attr', 'readonly');

        operations.menu.commentWritable();

        cy.get(datatest('text-comment')).should('not.have.attr', 'readonly');
    });

    it('Write comments', () => {
        visit({ mode: 'edit' });

        operations.mode.piece.open();

        // 1ページ目
        minoPosition(Piece.O, Rotation.Spawn)(3, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        cy.get(datatest('text-comment')).type('hello');

        // 2ページ目
        minoPosition(Piece.L, Rotation.Reverse)(6, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 3ページ目
        minoPosition(Piece.J, Rotation.Reverse)(7, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        cy.get(datatest('text-comment')).type('world');

        // 4ページ目
        minoPosition(Piece.I, Rotation.Left)(9, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        cy.get(datatest('text-comment')).type('!!!');

        // 5ページ目
        minoPosition(Piece.Z, Rotation.Spawn)(4, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 6ページ目
        minoPosition(Piece.S, Rotation.Left)(1, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        cy.get(datatest('text-comment')).clear().type('ここまで1巡目');

        // 7ページ目
        minoPosition(Piece.T, Rotation.Left)(2, 20).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        operations.mode.piece.harddrop();
        operations.mode.piece.rotateToLeft();

        cy.get(datatest('text-comment')).clear().type('TSD');

        // 8ページ目
        operations.mode.tools.nextPage();

        cy.get(datatest('text-comment')).clear();

        // 9ページ目
        operations.mode.tools.nextPage();

        cy.get(datatest('text-comment')).clear().type('ここから2巡目');

        expectFumen('v115@vhIzKYFAooMDEPBAAACMJmHYKAooMDEvzjXEMnBAAp?IYTAooMDEvzjXEM388AxnA6AFrmAAUBJvJYlAlvs2A1sDfE?To3ABlvs2A3HEfET4ZOBxX3JBEIfRA1Dq9BlAAAAFFYDAUN?SBAAgWAAAgWlAlvs2A1sDfETo3ABlvs2AUDEfETYOVByX3J?BEIfRA1Dq9BlAAAA');

        operations.mode.tools.undo();

        expectFumen('v115@vhIzKYFAooMDEPBAAACMJmHYKAooMDEvzjXEMnBAAp?IYTAooMDEvzjXEM388AxnA6AFrmAAUBJvJYlAlvs2A1sDfE?To3ABlvs2A3HEfET4ZOBxX3JBEIfRA1Dq9BlAAAAFFYDAUN?SBAAgWAAAgH');

        operations.mode.tools.redo();

        expectFumen('v115@vhIzKYFAooMDEPBAAACMJmHYKAooMDEvzjXEMnBAAp?IYTAooMDEvzjXEM388AxnA6AFrmAAUBJvJYlAlvs2A1sDfE?To3ABlvs2A3HEfET4ZOBxX3JBEIfRA1Dq9BlAAAAFFYDAUN?SBAAgWAAAgWlAlvs2A1sDfETo3ABlvs2AUDEfETYOVByX3J?BEIfRA1Dq9BlAAAA');
    });

    it('Quiz', () => {
        visit({ mode: 'edit' });

        operations.mode.piece.open();

        // 1ページ目
        minoPosition(Piece.T, Rotation.Spawn)(1, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        cy.get(datatest('text-comment')).type('#Q=[](T)ZSIOLJ');

        operations.mode.tools.nextPage();

        // 2ページ目
        minoPosition(Piece.Z, Rotation.Spawn)(3, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 3ページ目
        minoPosition(Piece.S, Rotation.Spawn)(4, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        expectFumen('v115@vhC1OYaAFLDmClcJSAVDEHBEooRBUoAVBadFgCs/AA?A0KJXBJ');

        // 4ページ目
        minoPosition(Piece.Z, Rotation.Spawn)(5, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        cy.get(datatest('text-comment')).clear().type('#Q=[](T)ZSIOLJ');

        // 5ページ目
        minoPosition(Piece.T, Rotation.Left)(6, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 6ページ目
        minoPosition(Piece.I, Rotation.Left)(9, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        expectFumen('v115@vhF1OYaAFLDmClcJSAVDEHBEooRBUoAVBadFgCs/AA?A0KJXBJ0LYaAFLDmClcJSAVDEHBEooRBUoAVBadFgCs/AAA?dHJpIJ');
    });

    it('Multi quiz', () => {
        visit({
            mode: 'edit',
            fumen: 'v115@vhGyOY3AFLDmClcJSAVjiSAVG88AYS88AZPUABCowA?BR4K6Bl/UtClfJSASE7SAyltSATzarDMjzCATEJm/I3LJtK?JUBJAgH'
        });

        operations.mode.piece.open();

        // 1ページ目
        cy.get(datatest('text-comment')).should('have.value', '#Q=[O](L)J;#Q=[S](Z)T;hello');
        operations.mode.tools.nextPage();

        // 2ページ目
        cy.get(datatest('text-comment')).should('have.value', '#Q=[O](J);#Q=[S](Z)T;hello');
        operations.mode.tools.nextPage();

        // 3ページ目
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](J);#Q=[S](Z)T;hello');
        operations.mode.tools.nextPage();

        // 4ページ目
        cy.get(datatest('text-comment')).should('have.value', '#Q=[S](Z)T;hello');
        operations.mode.tools.nextPage();

        // 5ページ目
        cy.get(datatest('text-comment')).should('have.value', '#Q=[Z](T);hello');
        operations.mode.tools.nextPage();

        // 6ページ目
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](Z);hello');
        operations.mode.tools.nextPage();

        // 7ページ目
        cy.get(datatest('text-comment')).should('have.value', 'hello');

        // 新規ページ追加
        operations.mode.tools.nextPage();

        // 8ページ目
        cy.get(datatest('text-comment')).should('have.value', 'hello');

        expectFumen('v115@vhHyOY3AFLDmClcJSAVjiSAVG88AYS88AZPUABCowA?BR4K6Bl/UtClfJSASE7SAyltSATzarDMjzCATEJm/I3LJtK?JUBJAgHAgH');
    });

    it('Invalid quiz', () => {
        visit({ mode: 'edit' });

        operations.mode.piece.open();

        // 1ページ目
        cy.get(datatest('text-comment')).type('#Q=[](T)OZASLJ');
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)OZASLJ');

        minoPosition(Piece.T, Rotation.Spawn)(1, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        operations.mode.tools.nextPage();

        // 2ページ目
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)OZASLJ');

        minoPosition(Piece.Z, Rotation.Spawn)(3, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        operations.mode.tools.nextPage();

        // 3ページ目
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)OZASLJ');

        minoPosition(Piece.O, Rotation.Spawn)(8, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        cy.get(datatest('text-comment')).clear().type('#Q=[O](S)LJ');
        cy.get(datatest('text-comment')).should('have.value', '#Q=[O](S)LJ');

        operations.mode.tools.nextPage();

        cy.get(datatest('text-comment')).should('have.value', '#Q=[S](L)J');

        expectFumen('v115@vhD1OYaAFLDmClcJSAVDEHBEooRBUoAVBvnTtCs/AA?A0KJTNYXAFLDmClcJSAVjiSAVG88A4c88AZifBAAgH');
    });

    it('merge comment1', () => {
        visit({ mode: 'edit' });

        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        // 3ページ
        cy.get(datatest('text-comment')).type('hello');
        cy.get(datatest('text-comment')).should('have.value', 'hello');
        // (blank) > [ref] > hello

        operations.mode.tools.backPage();
        operations.mode.tools.backPage();

        // 1ページ
        cy.get(datatest('text-comment')).should('have.value', '');
        cy.get(datatest('text-comment')).type('hello').type('{enter}');
        cy.get(datatest('text-comment')).should('have.value', 'hello');
        // hello > [ref] > [ref]

        cy.get(datatest('text-comment')).clear();
        // (blank) > [ref] > [ref]

        expectFumen('v115@vhCAgHAgHAgH');
    });

    it('merge comment2', () => {
        visit({ mode: 'edit' });

        // 1ページ
        cy.get(datatest('text-comment')).type('こんにちは');
        cy.get(datatest('text-comment')).should('have.value', 'こんにちは');

        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        // 4ページ
        cy.get(datatest('text-comment')).should('have.value', 'こんにちは');
        cy.get(datatest('text-comment')).clear().type('hello');
        cy.get(datatest('text-comment')).should('have.value', 'hello');
        // こんにちは > [ref] > [ref] > hello

        operations.mode.tools.backPage();
        operations.mode.tools.backPage();

        // 2ページ
        cy.get(datatest('text-comment')).should('have.value', 'こんにちは');
        cy.get(datatest('text-comment')).clear();
        cy.get(datatest('text-comment')).should('have.value', '');
        // こんにちは > (blank) > [ref] > hello

        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        // 4ページ
        cy.get(datatest('text-comment')).should('have.value', 'hello');
        cy.get(datatest('text-comment')).clear();
        cy.get(datatest('text-comment')).should('have.value', '');
        // こんにちは > (blank) > [ref] > [ref]

        operations.mode.tools.backPage();

        // 3ページ
        cy.get(datatest('text-comment')).should('have.value', '');
        cy.get(datatest('text-comment')).type('world');
        cy.get(datatest('text-comment')).should('have.value', 'world');
        // こんにちは > (blank) > world > [ref]

        operations.mode.tools.nextPage();

        // 4ページ
        cy.get(datatest('text-comment')).should('have.value', 'world');

        operations.mode.tools.backPage();
        operations.mode.tools.backPage();

        // 2ページ
        cy.get(datatest('text-comment')).should('have.value', '');
        cy.get(datatest('text-comment')).type('こんにちは');
        cy.get(datatest('text-comment')).should('have.value', 'こんにちは');
        // こんにちは > [ref] > world > [ref]

        operations.mode.tools.backPage();

        // 1ページ
        cy.get(datatest('text-comment')).should('have.value', 'こんにちは');
        cy.get(datatest('text-comment')).clear().type('world').type('{enter}');
        cy.get(datatest('text-comment')).should('have.value', 'world');
        // world > [ref] > [ref] > [ref]

        cy.get(datatest('text-comment')).clear();
        // (blank) > [ref] > [ref] > [ref]

        expectFumen('v115@vhDAgHAgHAgHAgH');
    });

    it('merge quiz', () => {
        visit({ mode: 'edit' });

        operations.mode.piece.open();

        // 1ページ
        cy.get(datatest('text-comment')).type('#Q=[](L)JSZOTI');
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](L)JSZOTI');

        operations.mode.piece.spawn.L();
        operations.mode.piece.harddrop();

        // 2ページ
        operations.mode.tools.nextPage();
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](J)SZOTI');

        operations.mode.piece.spawn.S();
        operations.mode.piece.harddrop();

        // 3ページ
        operations.mode.tools.nextPage();
        cy.get(datatest('text-comment')).should('have.value', '#Q=[J](Z)OTI');

        operations.mode.piece.spawn.Z();
        operations.mode.piece.harddrop();

        // 4ページ
        operations.mode.tools.nextPage();
        cy.get(datatest('text-comment')).should('have.value', '#Q=[J](O)TI');

        operations.mode.tools.backPage();
        operations.mode.tools.backPage();
        operations.mode.tools.backPage();

        // 1ページ
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](L)JSZOTI');
        cy.get(datatest('text-comment')).clear();
        cy.get(datatest('text-comment')).should('have.value', '');

        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        // 3ページ
        cy.get(datatest('text-comment')).should('have.value', '');
        cy.get(datatest('text-comment')).type('#Q=[](Z)OJIT');
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](Z)OJIT');

        operations.mode.tools.backPage();
        operations.mode.tools.backPage();

        // 1ページ
        cy.get(datatest('text-comment')).should('have.value', '');
        cy.get(datatest('text-comment')).type('#Q=[](L)SZOJIT').type('{enter}');
        cy.get(datatest('text-comment')).should('have.value', '#Q=[](L)SZOJIT');

        cy.get(datatest('text-comment')).clear();

        expectFumen('v115@vhDSQJXGJU8IAgH');
    });
});
