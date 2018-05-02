import {Color, datatest, mino, pages, Piece, rightTap, Rotation, visit} from './common.js';

// 接着なしのテスト
describe('No lock', () => {
    const page = pages(52);

    it('S', () => {
        visit('v115@UeB8beB8beB8beB8beB8beB8beB8ke3Jnvhyvpfnpf?/pf3afvafnaf/af3LfvLfnLf/Lf38ev8en8e/8e3tevtent?e/te3eeveenee/ee3PevPenPevPe3Pe/eeneevee3ee/ten?tevte3te/8en8ev8e38e/LfnLfvLf3Lf/afnafvaf3af/pf?npfnpf');

        {
            // Assertion: ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            // Sミノの確認
            mino(Piece.S, Rotation.Spawn)(1, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        }

        rightTap(() => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(2));

            // 右向きの確認
            mino(Piece.S, Rotation.Right)(0, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(3, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(5));

            mino(Piece.S, Rotation.Spawn)(1, 3).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(9));

            mino(Piece.S, Rotation.Spawn)(1, 6).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(13));

            mino(Piece.S, Rotation.Spawn)(1, 9).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(17));

            mino(Piece.S, Rotation.Spawn)(1, 12).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(21));

            mino(Piece.S, Rotation.Spawn)(1, 15).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(25));

            mino(Piece.S, Rotation.Spawn)(1, 18).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        // 戻る
        rightTap(6, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(31));

            mino(Piece.S, Rotation.Spawn)(1, 15).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(35));

            mino(Piece.S, Rotation.Spawn)(1, 12).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(39));

            mino(Piece.S, Rotation.Spawn)(1, 9).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(43));

            mino(Piece.S, Rotation.Spawn)(1, 6).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(47));

            mino(Piece.S, Rotation.Spawn)(1, 3).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(51));

            mino(Piece.S, Rotation.Spawn)(1, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        // 最初に戻る
        rightTap(2, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            mino(Piece.S, Rotation.Spawn)(1, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        // 2週目
        rightTap(4, () => {
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(5));

            mino(Piece.S, Rotation.Spawn)(1, 3).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });
    });
});
