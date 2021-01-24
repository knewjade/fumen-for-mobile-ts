import { block, Color, datatest, expectFumen, mino, minoPosition, Piece, Rotation, visit } from '../support/common';
import { operations } from '../support/operations';

// テト譜を開く
describe('Put pieces', () => {
    it('Move piece', () => {
        visit({ mode: 'edit' });

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
        visit({ mode: 'edit' });

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
            mode: 'edit',
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
        visit({ mode: 'edit' });

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

        // 環境によってはクリップボードのエラーメッセージが消えない場合があるため
        cy.wait(2000);

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
        visit({ mode: 'edit' });

        operations.mode.piece.open();

        cy.get(datatest('img-rotation-empty')).should('be.visible');

        // T
        minoPosition(Piece.T, Rotation.Right)(3, 3).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        cy.get(datatest('img-rotation-right')).should('be.visible');

        operations.mode.piece.rotateToLeft();

        cy.get(datatest('img-rotation-spawn')).should('be.visible');

        operations.mode.piece.rotateToLeft();

        cy.get(datatest('img-rotation-left')).should('be.visible');

        operations.mode.piece.rotateToLeft();

        cy.get(datatest('img-rotation-reverse')).should('be.visible');

        operations.mode.piece.rotateToLeft();

        cy.get(datatest('img-rotation-right')).should('be.visible');

        // 次のページ
        operations.mode.tools.nextPage();

        cy.get(datatest('img-rotation-empty')).should('be.visible');

        // O
        minoPosition(Piece.O, Rotation.Spawn)(6, 18).forEach(position => {
            operations.mode.block.click(position[0], position[1]);
        });

        cy.get(datatest('img-rotation-spawn')).should('be.visible');

        operations.mode.piece.rotateToRight();

        cy.get(datatest('img-rotation-right')).should('be.visible');

        operations.mode.piece.rotateToRight();

        cy.get(datatest('img-rotation-reverse')).should('be.visible');

        operations.mode.piece.rotateToRight();

        cy.get(datatest('img-rotation-left')).should('be.visible');

        operations.mode.piece.rotateToRight();

        cy.get(datatest('img-rotation-spawn')).should('be.visible');

        // 前のページ
        operations.mode.tools.backPage();

        cy.get(datatest('img-rotation-right')).should('be.visible');
    });

    it('Spawn guideline piece', () => {
        visit({ mode: 'edit' });

        operations.mode.piece.open();

        operations.mode.piece.spawn.T();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.S();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.Z();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.I();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.L();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.J();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.O();
        operations.mode.piece.harddrop();

        expectFumen('v115@vhGVQJXBJU3IRyIStIWjITZI');
    });

    it('Spawn classic piece', () => {
        visit({ fumen: 'v115@vhAAAA', mode: 'edit' });

        operations.mode.piece.open();

        operations.mode.piece.spawn.T();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.S();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.Z();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.I();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.L();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.J();
        operations.mode.piece.harddrop();

        operations.mode.piece.spawn.O();
        operations.mode.piece.harddrop();

        expectFumen('v115@vhGFrBHhBEXBBSBCIBG+AD0A');
    });

    it('Spawn: usecase 1', () => {
        visit({ mode: 'edit' });
        operations.mode.piece.open();

        {
            operations.mode.piece.spawn.I();
            operations.mode.piece.harddrop();
        }

        {
            operations.mode.piece.spawn.Z();
            operations.mode.piece.harddrop();
        }

        {
            operations.mode.piece.spawn.L();
            operations.mode.piece.rotateToRight();
            operations.mode.piece.moveToLeftEnd();
            operations.mode.piece.harddrop();
        }

        {
            operations.mode.piece.spawn.O();
            operations.mode.piece.moveToRightEnd();
            operations.mode.piece.harddrop();
        }

        {
            operations.mode.piece.spawn.S();
            operations.mode.piece.moveToRightEnd();
            operations.mode.piece.rotateToLeft();
            operations.mode.piece.moveToLeft();
            operations.mode.piece.harddrop();
        }

        {
            operations.mode.piece.spawn.T();
            operations.mode.piece.moveToLeftEnd();
            operations.mode.piece.rotateToRight();
            operations.mode.piece.harddrop();
            operations.mode.piece.rotateToRight();
        }

        {
            operations.mode.piece.spawn.J();
            operations.mode.piece.moveToRightEnd();
            operations.mode.piece.harddrop();
        }

        expectFumen('v115@vhGRQJUGJKJJTNJ/MJFKJWSJ');
    });

    it('Spawn: usecase 2', () => {
        visit({ mode: 'edit' });
        operations.mode.piece.open();
        operations.mode.piece.draw();  // 自動でmoveに切り替わることを期待

        {
            operations.mode.piece.spawn.Z();
            operations.mode.piece.rotateToLeft();
            operations.mode.block.click(1, 1);
        }

        {
            operations.mode.piece.spawn.J();
            operations.mode.piece.rotateToLeft();
            operations.mode.block.click(7, 1);
        }

        {
            operations.mode.piece.spawn.O();
            operations.mode.block.click(8, 0);
        }

        {
            operations.mode.piece.spawn.I();
            operations.mode.block.click(2, 0);
        }

        {
            operations.mode.piece.spawn.S();
            operations.mode.block.click(3, 1);
        }

        {
            operations.mode.piece.spawn.T();
            operations.mode.piece.rotateToRight();
            operations.mode.piece.rotateToRight();
            operations.mode.block.click(5, 1);
        }

        {
            operations.mode.piece.spawn.L();
            operations.mode.piece.rotateToRight();
            operations.mode.block.click(8, 1);
        }

        expectFumen('v115@vhGcJJ+MJTNJRPJ3FJlLJKNJ');
    });

    it('Reset', () => {
        visit({ mode: 'edit' });
        operations.mode.piece.open();
        operations.mode.piece.draw();

        // Disable: all
        cy.get(datatest('btn-reset-piece')).should('have.class', 'disabled');
        cy.get(datatest('btn-rotate-to-right')).should('have.class', 'disabled');
        cy.get(datatest('btn-rotate-to-left')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-right')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-left')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-right-end')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-left-end')).should('have.class', 'disabled');
        cy.get(datatest('btn-harddrop')).should('have.class', 'disabled');

        operations.mode.block.click(5, 5);

        // Enable: reset only
        cy.get(datatest('btn-reset-piece')).should('not.have.class', 'disabled');
        cy.get(datatest('btn-rotate-to-right')).should('have.class', 'disabled');
        cy.get(datatest('btn-rotate-to-left')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-right')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-left')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-right-end')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-left-end')).should('have.class', 'disabled');
        cy.get(datatest('btn-harddrop')).should('have.class', 'disabled');

        operations.mode.piece.spawn.Z();

        // Enable: all
        cy.get(datatest('btn-reset-piece')).should('not.have.class', 'disabled');
        cy.get(datatest('btn-rotate-to-right')).should('not.have.class', 'disabled');
        cy.get(datatest('btn-rotate-to-left')).should('not.have.class', 'disabled');
        cy.get(datatest('btn-move-to-right')).should('not.have.class', 'disabled');
        cy.get(datatest('btn-move-to-left')).should('not.have.class', 'disabled');
        cy.get(datatest('btn-move-to-right-end')).should('not.have.class', 'disabled');
        cy.get(datatest('btn-move-to-left-end')).should('not.have.class', 'disabled');
        cy.get(datatest('btn-harddrop')).should('not.have.class', 'disabled');

        operations.mode.piece.resetPiece();

        // Disable: all
        cy.get(datatest('btn-reset-piece')).should('have.class', 'disabled');
        cy.get(datatest('btn-rotate-to-right')).should('have.class', 'disabled');
        cy.get(datatest('btn-rotate-to-left')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-right')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-left')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-right-end')).should('have.class', 'disabled');
        cy.get(datatest('btn-move-to-left-end')).should('have.class', 'disabled');
        cy.get(datatest('btn-harddrop')).should('have.class', 'disabled');
    });

    it('Inference', () => {
        visit({ mode: 'edit' });
        operations.mode.piece.open();
        operations.mode.piece.draw();

        operations.mode.block.click(5, 5);

        cy.get(block(5, 5)).should('have.attr', 'color', Color.Completion.Highlight2);

        // 消えない
        cy.get(datatest('btn-piece-select-mode')).click();

        cy.get(block(5, 5)).should('have.attr', 'color', Color.Completion.Highlight2);

        // 消えない
        cy.get(datatest('btn-piece-mode')).click();

        cy.get(block(5, 5)).should('have.attr', 'color', Color.Completion.Highlight2);

        // 消える
        operations.mode.piece.spawn.T();

        cy.get(block(5, 5)).should('not.have.attr', 'color', Color.Completion.Highlight2);
    });

    it('Split inference', () => {
        visit({ mode: 'edit' });
        operations.mode.piece.open();
        operations.mode.piece.draw();

        operations.mode.block.click(5, 5);
        operations.mode.block.click(4, 5);
        operations.mode.block.click(3, 5);

        // L
        operations.mode.block.click(3, 3);
        cy.get(block(4, 5)).should('have.attr', 'color', Color.Completion.Highlight2);
        operations.mode.block.click(3, 3);

        operations.mode.block.click(3, 4);
        cy.get(block(4, 5)).should('have.attr', 'color', Color.L.Highlight2);
        operations.mode.block.click(3, 4);

        // T
        operations.mode.block.click(4, 3);
        cy.get(block(4, 5)).should('have.attr', 'color', Color.Completion.Highlight2);
        operations.mode.block.click(4, 3);

        operations.mode.block.click(4, 4);
        cy.get(block(4, 5)).should('have.attr', 'color', Color.T.Highlight2);
        operations.mode.block.click(4, 4);

        // J
        operations.mode.block.click(5, 3);
        cy.get(block(4, 5)).should('have.attr', 'color', Color.Completion.Highlight2);
        operations.mode.block.click(5, 3);

        operations.mode.block.click(5, 4);
        cy.get(block(4, 5)).should('have.attr', 'color', Color.J.Highlight2);
        operations.mode.block.click(5, 4);
    });

    it('Swap current piece', () => {
        visit({ mode: 'edit' });
        operations.mode.piece.open();

        {
            operations.mode.piece.spawn.Z();
            operations.mode.block.click(5, 10);
        }

        {
            operations.mode.piece.spawn.J();
            operations.mode.piece.harddrop();
        }

        {
            operations.mode.piece.spawn.J();
            operations.mode.piece.harddrop();
        }

        expectFumen('v115@vhBWQJWGJ');
    });
});
