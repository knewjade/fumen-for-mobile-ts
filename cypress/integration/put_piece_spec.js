import { block, Color, expectFumen, minoPosition, Piece, Rotation, visit } from './_common';
import { operations } from './_operations';

// テト譜を開く
describe('Put pieces', () => {
    it('Put pieces', () => {
        visit({});

        operations.screen.writable();

        operations.mode.piece.open();

        operations.mode.block.click(0, 0);
        cy.get(block(0, 0)).should('have.attr', 'color', Color.Highlight.Completion);

        operations.mode.piece.resetPiece();
        cy.get(block(0, 0)).should('not.have.attr', 'color', Color.Highlight.Completion);

        minoPosition(Piece.I, Rotation.Spawn)(4, 0).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.editor.nextPage();

        minoPosition(Piece.Z, Rotation.Spawn)(4, 1).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.editor.nextPage();

        minoPosition(Piece.L, Rotation.Right)(0, 1).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.editor.nextPage();

        minoPosition(Piece.O, Rotation.Spawn)(8, 0).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.editor.nextPage();

        minoPosition(Piece.S, Rotation.Right)(6, 1).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.editor.nextPage();

        minoPosition(Piece.T, Rotation.Reverse)(2, 15).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.tools.home();
        operations.mode.flags.open();
        operations.mode.flags.lockToOff();

        operations.mode.tools.home();
        operations.mode.piece.open();

        operations.mode.editor.nextPage();
        operations.mode.piece.resetPiece();

        minoPosition(Piece.T, Rotation.Reverse)(2, 10).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.editor.nextPage();
        operations.mode.piece.resetPiece();

        minoPosition(Piece.T, Rotation.Reverse)(2, 5).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.editor.nextPage();
        operations.mode.piece.resetPiece();

        minoPosition(Piece.T, Rotation.Reverse)(2, 1).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.editor.nextPage();
        operations.mode.tools.home();
        operations.mode.flags.open();
        operations.mode.flags.lockToOn();

        operations.mode.editor.nextPage();

        expectFumen('v115@vhKRQJUGJKJJTNJvMJFEmFdmF2mFKnFKJAgH');
    });
});
