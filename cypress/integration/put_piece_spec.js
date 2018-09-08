import { block, Color, expectFumen, mino, minoPosition, Piece, Rotation, visit } from './_common';
import { operations } from './_operations';

// テト譜を開く
describe('Put pieces', () => {
    it('Move piece', () => {
        visit({});

        operations.screen.writable();

        operations.mode.piece.open();

        minoPosition(Piece.O, Rotation.Spawn)(4, 0).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.moveOn();

        operations.mode.block.click(0, 10);
        operations.mode.block.click(4, 10);

        operations.mode.tools.undo();

        operations.mode.editor.nextPage();

        operations.mode.piece.drawOn();

        minoPosition(Piece.O, Rotation.Spawn)(4, 0).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.tools.undo();

        operations.mode.editor.nextPage();

        minoPosition(Piece.J, Rotation.Right)(4, 14).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.harddrop();

        expectFumen('v115@vhCTXIAgHOLJ');
    });

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

    it('Move pieces', () => {
        visit({ fumen: 'v115@zgB8EeD8HeB8AeE8AeC8BeC8BeC8AeE8AeB8JeAgHz?gBAEeDAHeBAAeEAAeBAAeA8AeAAHeAAEeAAKeAgH0gB8DeB?8AeB8FeD8AeD8AeB8CeA8BeA8DeA8AeAABeAAAeA8KeAgH0?gBAD8BeA8BAAeE8BeBAEeA8BeBAEeA8BeBADeB8LeAgH' });

        operations.screen.writable();

        operations.mode.piece.open();

        // T
        {
            minoPosition(Piece.T, Rotation.Spawn)(2, 3).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToRight();

            mino(Piece.T, Rotation.Right)(1, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.T);
            });

            operations.mode.piece.resetPiece();

            minoPosition(Piece.T, Rotation.Spawn)(6, 3).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToLeft();

            mino(Piece.T, Rotation.Left)(7, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.T);
            });
        }

        operations.mode.editor.nextPage();

        // SZ
        {
            minoPosition(Piece.S, Rotation.Right)(1, 2).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToRight();

            mino(Piece.S, Rotation.Reverse)(2, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });

            operations.mode.piece.resetPiece();

            minoPosition(Piece.Z, Rotation.Spawn)(8, 13).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToLeft();
            operations.mode.piece.harddrop();
            operations.mode.piece.rotateToLeft();

            mino(Piece.Z, Rotation.Reverse)(7, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.Z);
            });
        }

        operations.mode.editor.nextPage();

        // LJ
        {
            minoPosition(Piece.L, Rotation.Spawn)(3, 3).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToRight();

            mino(Piece.L, Rotation.Right)(2, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.L);
            });

            operations.mode.piece.resetPiece();

            minoPosition(Piece.J, Rotation.Spawn)(6, 3).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToLeft();

            mino(Piece.J, Rotation.Left)(7, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.J);
            });
        }

        operations.mode.editor.nextPage();

        // I
        {
            minoPosition(Piece.I, Rotation.Right)(0, 2).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToRight();

            mino(Piece.I, Rotation.Reverse)(2, 0).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.I);
            });
        }

        expectFumen('v115@zgB8EeD8HeB8AeE8AeC8BeC8BeC8AeE8AeB8Je9MJz?gBAEeDAHeBAAeEAQLBAAeA8AeAABeRLDeAADeQLAAKekMJ0?gB8DeB8AeB8FeD8AeD8AeB8CeA8BeAtAPCeA8AeAABeAAAP?AtKe+MJ0gBAD8BeA8BAAeE8BeBAEeglBeBAEeglBeBADehl?LehOJ');
    });
});
