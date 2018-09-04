import { block, Color, datatest, expectFumen, mino, minoPosition, Piece, Rotation, sentBlock, visit } from './_common';
import { operations } from './_operations';

// テト譜を開く
describe('Drawing', () => {
    it('Draw blocks', () => {
        visit({});

        operations.screen.writable();

        operations.mode.block.open();
        operations.mode.block.Gray();

        {
            operations.mode.block.click(3, 18);
            operations.mode.block.click(5, 16);
            operations.mode.block.click(3, 14);
        }

        operations.mode.block.J();

        {
            operations.mode.block.click(3, 11);
            operations.mode.block.click(4, 10);
            operations.mode.block.click(5, 9);
            operations.mode.block.click(6, 8);
            operations.mode.block.click(7, 7);
        }

        operations.mode.block.O();

        // Go to next page
        cy.get(datatest('btn-next-page')).click();

        {
            operations.mode.block.click(9, 5);
            operations.mode.block.click(7, 3);
            operations.mode.block.click(5, 1);
        }

        operations.mode.block.S();

        operations.mode.block.dragToRight({ from: 1, to: 9 }, 0);
        operations.mode.block.dragToRight({ from: 1, to: 9 }, -1);

        expectFumen('v115@qeA8UeA8QeA8ceg0Jeg0Jeg0Jeg0Jeg0RfAgHygQpQ?eQpQeQpEeY4AeY4AgH');
    });

    it('Draw blocks 2', () => {
        visit({});

        operations.screen.writable();

        operations.mode.block.open();
        operations.mode.block.I();

        {
            operations.mode.block.click(0, 0);
            operations.mode.block.click(2, 5);
            operations.mode.block.click(4, 10);
            operations.mode.block.click(6, 15);
            operations.mode.block.click(8, 20);
            operations.mode.block.click(9, 21);
            operations.mode.block.click(8, 22);
        }

        operations.mode.block.T();
        operations.mode.block.dragToRight({ from: 0, to: 8 }, 1);

        operations.mode.block.O();
        operations.mode.block.dragToRight({ from: 0, to: 8 }, -1);

        expectFumen('v115@HewhJewhHewhuewhuewhuewhke4wAewhIeYpAeAgH');
    });

    it('Completion blocks', () => {
        visit({});

        operations.screen.writable();

        operations.mode.block.open();

        // I
        operations.mode.block.click(6, 0);
        operations.mode.block.click(6, 3);
        operations.mode.block.click(6, 2);
        operations.mode.block.click(6, 1);

        // L
        operations.mode.block.dragToRight({ from: 3, to: 5 }, 0);
        operations.mode.block.click(5, 1);

        // J
        operations.mode.block.click(7, 1);
        operations.mode.block.dragToRight({ from: 7, to: 9 }, 0);

        // S
        operations.mode.block.click(7, 2);
        operations.mode.block.click(8, 2);
        operations.mode.block.click(8, 1);
        operations.mode.block.click(9, 1);

        // Z
        operations.mode.block.click(5, 2);
        operations.mode.block.click(4, 2);
        operations.mode.block.click(4, 1);
        operations.mode.block.click(3, 1);

        // O
        operations.mode.block.click(0, 0);
        operations.mode.block.click(1, 0);
        operations.mode.block.click(0, 1);
        operations.mode.block.click(1, 1);

        // T
        operations.mode.block.click(3, 3);
        operations.mode.block.click(4, 3);
        operations.mode.block.click(5, 3);
        operations.mode.block.click(4, 4);

        // J
        operations.mode.block.click(0, 2);
        operations.mode.block.click(0, 3);
        operations.mode.block.click(0, 4);
        operations.mode.block.click(1, 4);

        // I
        operations.mode.block.click(9, 2);
        operations.mode.block.click(9, 3);
        operations.mode.block.click(9, 4);
        operations.mode.block.click(9, 5);

        // T
        operations.mode.block.click(1, 2);
        operations.mode.block.click(2, 2);
        operations.mode.block.click(3, 2);
        operations.mode.block.click(2, 1);

        // Go to next page
        cy.get(datatest('btn-next-page')).click();

        expectFumen('v115@ygwhh0BewwDewhg0BeywwhBewhg0ywR4whBtwhRpww?R4glwhg0BtRpAeilwhi0JeAgHvhAAgH');
    });

    it('Completion blocks 2', () => {
        visit({
            fumen: 'v115@AhG8CeG8CeH8BeG8JeAgH',
        });

        operations.screen.writable();

        operations.mode.block.open();

        // Z
        operations.mode.block.click(0, 1);
        operations.mode.block.click(1, 1);
        operations.mode.block.click(1, 0);
        operations.mode.block.click(2, 0);

        // Zミノの確認
        mino(Piece.Z, Rotation.Spawn)(1, 0).forEach((block) => {
            cy.get(block).should('have.attr', 'color', Color.Highlight.Z);
        });

        // 確定
        operations.mode.block.T();

        // Iミノの確認
        cy.get(block(0, 1)).should('have.attr', 'color', Color.Normal.Z);
        cy.get(block(1, 1)).should('have.attr', 'color', Color.Normal.Z);
        cy.get(block(1, 0)).should('have.attr', 'color', Color.Highlight.Z);
        cy.get(block(2, 0)).should('have.attr', 'color', Color.Highlight.Z);

        {
            // 補完ボタン
            operations.mode.block.Completion();

            operations.mode.block.click(2, 3);
            operations.mode.block.click(2, 2);
            operations.mode.block.click(2, 1);
            operations.mode.block.click(1, 1);

            // 補完ミノの確認
            {
                cy.get(block(2, 3)).should('have.attr', 'color', Color.Highlight.Completion);
                cy.get(block(2, 2)).should('have.attr', 'color', Color.Highlight.Completion);
                cy.get(block(2, 1)).should('have.attr', 'color', Color.Highlight.Completion);
                cy.get(block(1, 1)).should('have.attr', 'color', Color.Normal.Z);
            }

            // 補完ボタン // リセット
            operations.mode.block.Completion();

            // 補完が消えている
            {
                cy.get(block(2, 3)).should('have.attr', 'color', Color.Empty.Field);
                cy.get(block(2, 2)).should('have.attr', 'color', Color.Empty.Field);
                cy.get(block(2, 1)).should('have.attr', 'color', Color.Empty.Field);
                cy.get(block(1, 1)).should('have.attr', 'color', Color.Normal.Z);
            }
        }

        {
            // 補完ボタン
            operations.mode.block.Completion();

            operations.mode.block.click(2, 2);

            // 補完ミノの確認
            {
                cy.get(block(2, 2)).should('have.attr', 'color', Color.Highlight.Completion);
            }

            // 次のボタン
            operations.mode.editor.nextPage();

            // 補完が消えている
            {
                cy.get(block(2, 2)).should('have.attr', 'color', Color.Empty.Field);
            }
        }

        {
            // 補完ボタン
            operations.mode.block.Completion();

            operations.mode.block.click(2, 2);

            // 補完ミノの確認
            {
                cy.get(block(2, 2)).should('have.attr', 'color', Color.Highlight.Completion);
            }

            // 戻るボタン
            operations.mode.editor.backPage();

            // 補完が消えている
            {
                cy.get(block(2, 2)).should('have.attr', 'color', Color.Empty.Field);
            }
        }

        {
            // 補完ボタン
            operations.mode.block.Completion();

            operations.mode.block.click(2, 3);
            operations.mode.block.click(2, 2);
            operations.mode.block.click(2, 1);
            operations.mode.block.click(1, 1);

            // 補完ミノの確認
            {
                cy.get(block(2, 3)).should('have.attr', 'color', Color.Highlight.Completion);
                cy.get(block(2, 2)).should('have.attr', 'color', Color.Highlight.Completion);
                cy.get(block(2, 1)).should('have.attr', 'color', Color.Highlight.Completion);
                cy.get(block(1, 1)).should('have.attr', 'color', Color.Normal.Z);
            }

            // 補完ボタン
            operations.screen.readonly();

            // 補完が消えている
            {
                cy.get(block(2, 3)).should('have.attr', 'color', Color.Empty.Field);
                cy.get(block(2, 2)).should('have.attr', 'color', Color.Empty.Field);
                cy.get(block(2, 1)).should('have.attr', 'color', Color.Empty.Field);
                cy.get(block(1, 1)).should('have.attr', 'color', Color.Normal.Z);
            }
        }

        expectFumen('v115@AhG8CeG8BtAeH8BtG8JeAgHvhAAgH');
    });

    it('Completion blocks 3', () => {
        visit({
            fumen: 'v115@vhAAgH',
        });

        operations.screen.writable();

        operations.mode.block.open();

        // 次のページ
        operations.mode.editor.nextPage();
        operations.mode.editor.toRef();

        operations.mode.block.O();

        // Oミノを置く
        minoPosition(Piece.O, Rotation.Spawn)(5, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // Oミノを消す
        minoPosition(Piece.O, Rotation.Spawn)(5, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        operations.mode.block.T();

        operations.mode.block.click(7, 0);
        operations.mode.block.click(7, 1);

        operations.mode.block.Empty();

        operations.mode.block.click(7, 0);
        operations.mode.block.click(7, 1);

        // 前のページ
        operations.mode.editor.backPage();

        operations.mode.block.I();

        // Iミノを置く
        minoPosition(Piece.I, Rotation.Spawn)(4, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 次のページ
        operations.mode.editor.nextPage();

        // Iミノの確認
        mino(Piece.I, Rotation.Spawn)(4, 0).forEach((block) => {
            cy.get(block).should('have.attr', 'color', Color.Normal.I);
        });
    });

    it('Inference without lock flag', () => {
        // 接着なしオンのテト譜
        visit({
            fumen: 'v115@HhE8CeG8CeH8BeB8JeAgl',
        });

        operations.screen.writable();

        operations.mode.block.open();

        // inference
        operations.mode.block.Inference();

        operations.mode.block.click(9, 3);
        operations.mode.block.click(8, 3);
        operations.mode.block.click(7, 3);
        operations.mode.block.click(6, 3);

        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');
        cy.get(block(9, 3)).should('not.have.attr', 'color', Color.Highlight.Completion);
        cy.get(block(8, 3)).should('not.have.attr', 'color', Color.Highlight.Completion);
        cy.get(block(7, 3)).should('not.have.attr', 'color', Color.Highlight.Completion);
        cy.get(block(6, 3)).should('not.have.attr', 'color', Color.Highlight.Completion);
    });

    it('Sent block', () => {
        // sentBlockを置くかどうかの判定に、フィールドのブロックを参照してしまう問題に対するテスト
        visit({});

        operations.menu.newPage();

        operations.mode.block.open();

        operations.mode.block.Gray();

        operations.mode.block.dragToRight({ from: 3, to: 6 }, 0);

        operations.mode.editor.nextPage();

        operations.mode.block.dragToRight({ from: 0, to: 9 }, -1);

        for (let x = 0; x < 9; x++) {
            cy.get(sentBlock(x)).should('have.attr', 'color', Color.Gray.Field);
        }
    });

    it('Reset completion when create new page', () => {
        visit({});

        operations.screen.writable();

        operations.mode.block.open();

        operations.mode.block.click(0, 0);
        operations.mode.block.click(0, 1);

        cy.get(block(0, 0)).should('have.attr', 'color', Color.Highlight.Completion);
        cy.get(block(0, 1)).should('have.attr', 'color', Color.Highlight.Completion);

        operations.menu.newPage();

        cy.get(block(0, 0)).should('have.attr', 'color', Color.Empty.Field);
        cy.get(block(0, 1)).should('have.attr', 'color', Color.Empty.Field);
    });
});
