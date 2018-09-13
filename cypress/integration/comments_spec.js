import { datatest, expectFumen, minoPosition, Piece, Rotation, visit } from './_common';
import { operations } from './_operations';

describe('Comments', () => {
    it('Should not apply comment to other pages', () => {
        visit({});

        operations.screen.writable();

        operations.mode.editor.nextPage();
        operations.mode.editor.nextPage();

        cy.get(datatest('text-comment')).type('こんにちは');
        cy.get(datatest('text-comment')).should('have.value', 'こんにちは');

        operations.mode.editor.backPage();

        cy.get(datatest('text-comment')).should('have.value', '');

        operations.mode.editor.backPage();

        cy.get(datatest('text-comment')).should('have.value', '');

        expectFumen('v115@vhCAgHAgHAgWeAlvs2A1sDfEToABBlvs2AWDEfET4J?6Alvs2AW5AAA');
    });

    it('Comment readonly/writable', () => {
        visit({});

        operations.screen.writable();

        operations.mode.piece.open();

        cy.get(datatest('text-comment')).type('hello');

        operations.menu.commentReadonly();

        cy.get(datatest('text-comment')).should('have.attr', 'readonly');

        operations.menu.commentWritable();

        cy.get(datatest('text-comment')).should('not.have.attr', 'readonly');
    });

    it('Write comments', () => {
        visit({});

        operations.screen.writable();

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
        operations.mode.editor.nextPage();

        cy.get(datatest('text-comment')).clear();

        // 9ページ目
        operations.mode.editor.nextPage();

        cy.get(datatest('text-comment')).clear().type('ここから2巡目');

        expectFumen('v115@vhIzKYFAooMDEPBAAACMJmHYKAooMDEvzjXEMnBAAp?IYTAooMDEvzjXEM388AxnA6AFrmAAUBJvJYlAlvs2A1sDfE?To3ABlvs2A3HEfET4ZOBxX3JBEIfRA1Dq9BlAAAAFFYDAUN?SBAAgWAAAgWlAlvs2A1sDfETo3ABlvs2AUDEfETYOVByX3J?BEIfRA1Dq9BlAAAA');

        operations.mode.tools.undo();

        expectFumen('v115@vhIzKYFAooMDEPBAAACMJmHYKAooMDEvzjXEMnBAAp?IYTAooMDEvzjXEM388AxnA6AFrmAAUBJvJYlAlvs2A1sDfE?To3ABlvs2A3HEfET4ZOBxX3JBEIfRA1Dq9BlAAAAFFYDAUN?SBAAgWAAAgH');

        operations.mode.tools.redo();

        expectFumen('v115@vhIzKYFAooMDEPBAAACMJmHYKAooMDEvzjXEMnBAAp?IYTAooMDEvzjXEM388AxnA6AFrmAAUBJvJYlAlvs2A1sDfE?To3ABlvs2A3HEfET4ZOBxX3JBEIfRA1Dq9BlAAAAFFYDAUN?SBAAgWAAAgWlAlvs2A1sDfETo3ABlvs2AUDEfETYOVByX3J?BEIfRA1Dq9BlAAAA');
    });
});
