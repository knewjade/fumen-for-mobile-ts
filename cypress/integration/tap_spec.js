import { Color, datatest, leftTap, mino, pages, Piece, rightTap, Rotation, visit } from './_common.js';

// タップのテスト
describe('Tap', () => {
    const page = pages(3);

    it('Next / Prev', () => {
       visit('v115@vhCRQJUmBKpB');

        {
            // Assertion: ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            // Iミノの確認
            mino(Piece.I, Rotation.Spawn)(4, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.I);
            });
        }

        rightTap(() => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(2));

            // Iミノの確認
            mino(Piece.I, Rotation.Spawn)(4, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Normal.I);
            });

            // Zミノの確認
            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.Z);
            });
        });

        rightTap(() => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(3));

            // Zミノの確認
            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Normal.Z);
            });

            // Lミノの確認
            mino(Piece.L, Rotation.Right)(0, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.L);
            });
        });

        // 戻る
        leftTap(() => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(2));

            // Lミノの確認
            mino(Piece.L, Rotation.Right)(0, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Empty.Field);
            });
        });

        leftTap(() => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            // Zミノの確認
            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Empty.Field);
            });
        });

        // 最後にループする
        leftTap(() => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(3));

            // Zミノの確認
            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Normal.Z);
            });

            // Lミノの確認
            mino(Piece.L, Rotation.Right)(0, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.L);
            });
        });

        // 先頭にループする
        rightTap(() => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            // Zミノの確認
            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Empty.Field);
            });
        });
    });
});
