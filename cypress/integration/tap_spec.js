describe('Tap', () => {
    it('Next / Prev', () => {
        cy.visit('./public/index.html');

        cy.viewport(375, 667);  // Like iPhone7

        // テト譜を開く
        cy.get('#btn-open-fumen').click();

        // テト譜を入力 : 成功
        cy.get('#textarea-fumen-modal').clear();
        cy.get('#textarea-fumen-modal').type('v115@vhCRQJUmBKpB');
        cy.get('#btn-fumen-modal-open').click();

        cy.get('#text-pages').contains('1 / 3');
        cy.wait(200);

        cy.get(`#ce-block-3-0}`).contains();

        // 右半分をクリック
        cy.get('body').click(300, 300);
        cy.get('#text-pages').contains('2 / 3');

        // 右半分をクリック
        cy.get('body').click(300, 300);
        cy.get('#text-pages').contains('3 / 3');

        // 左半分をクリック
        cy.get('body').click(100, 300);
        cy.get('#text-pages').contains('2 / 3');

        // 左半分をクリック
        cy.get('body').click(100, 300);
        cy.get('#text-pages').contains('1 / 3');
    });
});

