import { block, Color, datatest, expectFumen, mino, minoPosition, Piece, Rotation, visit } from '../support/common';
import { operations } from '../support/operations';

// テト譜を開く
describe('Put pieces', () => {
    it('Move piece', () => {
        visit({ mode: 'writable' });

        operations.mode.piece.open();

        minoPosition(Piece.O, Rotation.Spawn)(4, 0).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.move();

        operations.mode.block.click(0, 10);
        operations.mode.block.click(4, 10);

        operations.mode.tools.undo();

        operations.mode.tools.nextPage();

        operations.mode.piece.draw();

        minoPosition(Piece.O, Rotation.Spawn)(4, 0).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.tools.undo();

        operations.mode.tools.nextPage();

        minoPosition(Piece.J, Rotation.Right)(4, 14).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.harddrop();

        expectFumen('v115@vhCTXIAgHOLJ');
    });

    it('Put pieces', () => {
        visit({ mode: 'writable' });

        operations.mode.piece.open();

        operations.mode.block.click(0, 0);
        cy.get(block(0, 0)).should('have.attr', 'color', Color.Completion.Highlight2);

        operations.mode.piece.resetPiece();
        cy.get(block(0, 0)).should('not.have.attr', 'color', Color.Completion.Highlight2);

        minoPosition(Piece.I, Rotation.Spawn)(4, 0).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.tools.nextPage();

        minoPosition(Piece.Z, Rotation.Spawn)(4, 1).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        minoPosition(Piece.L, Rotation.Right)(0, 1).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        minoPosition(Piece.O, Rotation.Spawn)(8, 0).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        minoPosition(Piece.S, Rotation.Right)(6, 1).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        minoPosition(Piece.T, Rotation.Reverse)(2, 15).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.tools.home();
        operations.mode.flags.open();
        operations.mode.flags.lockToOff();

        operations.mode.tools.home();
        operations.mode.piece.open();

        operations.mode.tools.nextPage();
        operations.mode.piece.resetPiece();

        minoPosition(Piece.T, Rotation.Reverse)(2, 10).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.tools.nextPage();
        operations.mode.piece.resetPiece();

        minoPosition(Piece.T, Rotation.Reverse)(2, 5).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.tools.nextPage();
        operations.mode.piece.resetPiece();

        minoPosition(Piece.T, Rotation.Reverse)(2, 1).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.tools.nextPage();
        operations.mode.tools.home();
        operations.mode.flags.open();
        operations.mode.flags.lockToOn();

        operations.mode.tools.nextPage();

        expectFumen('v115@vhKRQJUGJKJJTNJvMJFEmFdmF2mFKnFKJAgH');
    });

    it('Move pieces', () => {
        visit({
            fumen: 'v115@zgB8EeD8HeB8AeE8AeC8BeC8BeC8AeE8AeB8JeAgHz?gBAEeDAHeBAAeEAAeBAAeA8AeAAHeAAEeAAKeAgH0gB8DeB?8AeB8FeD8AeD8AeB8CeA8BeA8DeA8AeAABeAAAeA8KeAgH0?gBAD8BeA8BAAeE8BeBAEeA8BeBAEeA8BeBADeB8LeAgH',
            mode: 'writable',
        });

        operations.mode.piece.open();

        // T
        {
            minoPosition(Piece.T, Rotation.Spawn)(2, 3).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToRight();

            mino(Piece.T, Rotation.Right)(1, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.T.Highlight2);
            });

            operations.mode.piece.resetPiece();

            minoPosition(Piece.T, Rotation.Spawn)(6, 3).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToLeft();

            mino(Piece.T, Rotation.Left)(7, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.T.Highlight2);
            });
        }

        operations.mode.tools.nextPage();

        // SZ
        {
            minoPosition(Piece.S, Rotation.Right)(1, 2).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToRight();

            mino(Piece.S, Rotation.Reverse)(2, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.S.Highlight2);
            });

            operations.mode.piece.resetPiece();

            minoPosition(Piece.Z, Rotation.Spawn)(8, 13).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToLeft();
            operations.mode.piece.harddrop();
            operations.mode.piece.rotateToLeft();

            mino(Piece.Z, Rotation.Reverse)(7, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.Z.Highlight2);
            });
        }

        operations.mode.tools.nextPage();

        // LJ
        {
            minoPosition(Piece.L, Rotation.Spawn)(3, 3).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToRight();

            mino(Piece.L, Rotation.Right)(2, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.L.Highlight2);
            });

            operations.mode.piece.resetPiece();

            minoPosition(Piece.J, Rotation.Spawn)(6, 3).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToLeft();

            mino(Piece.J, Rotation.Left)(7, 1).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.J.Highlight2);
            });
        }

        operations.mode.tools.nextPage();

        // I
        {
            minoPosition(Piece.I, Rotation.Right)(0, 2).forEach(position => {
                operations.mode.block.click(position[0], position[1]);
            });

            operations.mode.piece.rotateToRight();

            mino(Piece.I, Rotation.Reverse)(2, 0).forEach(block => {
                cy.get(block).should('have.attr', 'color', Color.I.Highlight2);
            });
        }

        expectFumen('v115@zgB8EeD8HeB8AeE8AeC8BeC8BeC8AeE8AeB8Je9MJz?gBAEeDAHeBAAeEAQLBAAeA8AeAABeRLDeAADeQLAAKekMJ0?gB8DeB8AeB8FeD8AeD8AeB8CeA8BeAtAPCeA8AeAABeAAAP?AtKe+MJ0gBAD8BeA8BAAeE8BeBAEeglBeBAEeglBeBADehl?LehOJ');
    });

    it('Move pieces 2', () => {
        visit({ mode: 'writable' });

        operations.mode.piece.open();

        // T
        minoPosition(Piece.T, Rotation.Spawn)(3, 3).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.harddrop();
        operations.mode.piece.moveToLeft();
        operations.mode.piece.moveToLeft();
        operations.mode.piece.moveToLeft();
        operations.mode.piece.moveToLeft();
        operations.mode.piece.moveToLeft();

        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.redo();

        operations.mode.tools.nextPage();

        // I
        minoPosition(Piece.I, Rotation.Spawn)(4, 4).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.harddrop();

        operations.mode.piece.moveToRight();
        operations.mode.piece.moveToRight();
        operations.mode.piece.moveToRight();

        operations.mode.tools.undo();
        operations.mode.tools.redo();

        operations.mode.tools.nextPage();

        // O
        minoPosition(Piece.O, Rotation.Spawn)(3, 10).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.harddrop();

        operations.mode.piece.moveToRight();
        operations.mode.piece.moveToRight();
        operations.mode.piece.moveToRight();

        operations.mode.piece.harddrop();

        operations.mode.piece.moveToLeft();
        operations.mode.piece.moveToLeft();
        operations.mode.piece.moveToLeft();

        expectFumen('v115@vhCVPJxMJTLJ');

        // I
        minoPosition(Piece.I, Rotation.Spawn)(6, 18).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.moveToLeftEnd();
        operations.mode.piece.rotateToLeft();
        operations.mode.piece.harddrop();

        operations.mode.tools.nextPage();

        // I
        minoPosition(Piece.I, Rotation.Spawn)(2, 21).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        operations.mode.piece.moveToRightEnd();
        operations.mode.piece.rotateToRight();
        operations.mode.piece.harddrop();

        expectFumen('v115@vhEVPJxMJTLJ5/IJ+I');

        operations.mode.piece.lockToOff();

        operations.mode.tools.nextPage();

        operations.mode.piece.rotateToRight();

        operations.mode.tools.nextPage();

        operations.mode.piece.rotateToRight();

        operations.mode.piece.lockToOn();

        operations.mode.tools.nextPage();

        expectFumen('v115@vhHVPJxMJTLJ5/IJ+mhCn59IAgH');
    });

    it('Show current rotation', () => {
        visit({ mode: 'writable' });

        operations.mode.piece.open();

        cy.get(datatest('img-rotation-empty')).should('visible');

        // T
        minoPosition(Piece.T, Rotation.Right)(3, 3).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        cy.get(datatest('img-rotation-right')).should('visible');

        operations.mode.piece.rotateToLeft();

        cy.get(datatest('img-rotation-spawn')).should('visible');

        operations.mode.piece.rotateToLeft();

        cy.get(datatest('img-rotation-left')).should('visible');

        operations.mode.piece.rotateToLeft();

        cy.get(datatest('img-rotation-reverse')).should('visible');

        operations.mode.piece.rotateToLeft();

        cy.get(datatest('img-rotation-right')).should('visible');

        // 次のページ
        operations.mode.tools.nextPage();

        cy.get(datatest('img-rotation-empty')).should('visible');

        // O
        minoPosition(Piece.O, Rotation.Spawn)(6, 18).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        cy.get(datatest('img-rotation-spawn')).should('visible');

        operations.mode.piece.rotateToRight();

        cy.get(datatest('img-rotation-right')).should('visible');

        operations.mode.piece.rotateToRight();

        cy.get(datatest('img-rotation-reverse')).should('visible');

        operations.mode.piece.rotateToRight();

        cy.get(datatest('img-rotation-left')).should('visible');

        operations.mode.piece.rotateToRight();

        cy.get(datatest('img-rotation-spawn')).should('visible');

        // 前のページ
        operations.mode.tools.backPage();

        cy.get(datatest('img-rotation-right')).should('visible');
    });
});
