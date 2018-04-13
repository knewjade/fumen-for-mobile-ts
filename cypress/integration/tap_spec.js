import { DEF_HIGHLIGHT, DEF_NORMAL } from './common.js';

const datatest = value => `[datatest="${value}"]`;
const block = (x, y) => datatest(`block-${x}-${y}`);

describe('Tap', () => {
    // タップのテスト
    it('Next / Prev', () => {
        cy.visit('./public/index.html?d=v115@vhCRQJUmBKpB');

        cy.viewport(375, 667);  // Like iPhone7

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 3');

        // Iブロックの確認
        [block(3, 0), block(4, 0), block(5, 0), block(6, 0)].forEach((block) => {
            cy.get(block).should('have.attr', 'color', DEF_HIGHLIGHT.I);
        });

        // 右半分をクリック
        cy.get('body').click(300, 300);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 3');

        // Iブロックの確認
        [block(3, 0), block(4, 0), block(5, 0), block(6, 0)].forEach((block) => {
            cy.get(block).should('have.attr', 'color', DEF_NORMAL.I);
        });

        // Zブロックの確認
        [block(3, 2), block(4, 2), block(4, 1), block(5, 1)].forEach((block) => {
            cy.get(block).should('have.attr', 'color', DEF_HIGHLIGHT.Z);
        });

        // 右半分をクリック
        cy.get('body').click(300, 300);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '3 / 3');

        // Zブロックの確認
        [block(3, 2), block(4, 2), block(4, 1), block(5, 1)].forEach((block) => {
            cy.get(block).should('have.attr', 'color', DEF_NORMAL.Z);
        });

        // Lブロックの確認
        [block(0, 2), block(0, 1), block(0, 0), block(1, 0)].forEach((block) => {
            cy.get(block).should('have.attr', 'color', DEF_HIGHLIGHT.L);
        });

        // 左半分をクリック
        cy.get('body').click(100, 300);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 3');

        // Lブロックの確認
        [block(0, 2), block(0, 1), block(0, 0), block(1, 0)].forEach((block) => {
            cy.get(block).should('have.attr', 'color', DEF_NORMAL.EMPTY);
        });

        // 左半分をクリック
        cy.get('body').click(100, 300);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 3');

        // Zブロックの確認
        [block(3, 2), block(4, 2), block(4, 1), block(5, 1)].forEach((block) => {
            cy.get(block).should('have.attr', 'color', DEF_NORMAL.EMPTY);
        });
    });
});
