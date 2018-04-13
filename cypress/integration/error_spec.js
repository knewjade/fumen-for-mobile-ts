const datatest = value => `[datatest="${value}"]`;

// テト譜を開く
describe('Open fumen', () => {
    it('error -> success', () => {
        cy.visit('./public/index.html');

        // モーダルを開く
        cy.get(datatest('btn-open-fumen')).click();

        // 入力に失敗するパターン
        cy.get(datatest('mdl-open-fumen')).should('visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('hello world');
                cy.get(datatest('btn-open')).click();

                // Assertion: エラーメッセージ
                cy.get(datatest('text-message')).should('contain', 'テト譜を読み込めませんでした');
            });

        // 入力に成功するパターン
        cy.get(datatest('mdl-open-fumen')).should('visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('v115@9gi0EeR4Rpg0DeR4wwRpglCeBtxwilDeBtwwJeAgHv?hERmBuqBMrBXsBAAA');
                cy.get(datatest('btn-open')).click();
            });

        // Assertion: モーダルが閉じられている
        cy.get(datatest('mdl-open-fumen')).should('hidden');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6')
    });
});

