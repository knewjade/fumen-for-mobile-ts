const datatest = value => `[datatest="${value}"]`;

describe('Tap', () => {
    // タップのテスト
    it('Next / Prev', () => {
        cy.visit('./public/index.html?d=v115@vhCRQJUmBKpB');

        cy.viewport(375, 667);  // Like iPhone7

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 3');

        // ブロックの存在確認
        // cy.get(`#ce-block-3-0}`).should('exist');

        // 右半分をクリック
        cy.get('body').click(300, 300);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 3');

        // 右半分をクリック
        cy.get('body').click(300, 300);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '3 / 3');

        // 左半分をクリック
        cy.get('body').click(100, 300);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 3');

        // 左半分をクリック
        cy.get('body').click(100, 300);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 3');
    });
});
