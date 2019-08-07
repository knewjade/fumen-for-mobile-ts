import { datatest, expectFumen, visit } from '../support/common';
import { operations } from '../support/operations';

// テト譜を追加
describe('Append fumen', () => {
    it('To Next: Error -> success', () => {
        visit({ fumen: 'v115@vhBzKJCsB', lng: 'ja' });

        // モーダルを開く
        operations.menu.append();

        // 入力に失敗するパターン
        cy.get(datatest('mdl-append-fumen')).should('visible')
            .within(() => {
                cy.get(datatest('btn-append-to-next')).should('have.class', 'disabled');

                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('hello world');

                cy.get(datatest('btn-append-to-next')).should('not.have.class', 'disabled');
                cy.get(datatest('btn-append-to-next')).click();

                // Assertion: エラーメッセージ
                cy.get(datatest('text-message')).should('contain', 'テト譜を読み込めませんでした');

                cy.get(datatest('btn-append-to-next')).should('have.class', 'disabled');
            });

        // 入力に成功するパターン
        cy.get(datatest('mdl-append-fumen')).should('visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('v115@9gi0EeR4Rpg0DeR4wwRpglCeBtxwilDeBtwwJeAgHv?hERmBuqBMrBXsBAAA');
                cy.get(datatest('btn-append-to-next')).click();
            });

        // Assertion: モーダルが閉じられている
        cy.get(datatest('mdl-append-fumen')).should('not.exist');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 8');

        expectFumen('v115@vhAzKJ9gi0EeR4Rpg0DeR4wwRpglxSAeBtxwilxSBe?BtwwJeAAAvhERmBuqBMrBXsBAAAUhRpHeRpOeCsB');
    });

    it('To End: Error -> success', () => {
        visit({ fumen: 'v115@vhBzKJCsB', lng: 'ja' });

        // モーダルを開く
        operations.menu.append();

        // 入力に失敗するパターン
        cy.get(datatest('mdl-append-fumen')).should('visible')
            .within(() => {
                cy.get(datatest('btn-append-to-end')).should('have.class', 'disabled');

                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('hello world');
                cy.get(datatest('btn-append-to-end')).should('not.have.class', 'disabled');
                cy.get(datatest('btn-append-to-end')).click();

                // Assertion: エラーメッセージ
                cy.get(datatest('text-message')).should('contain', 'テト譜を読み込めませんでした');

                cy.get(datatest('btn-append-to-end')).should('have.class', 'disabled');
            });

        // 入力に成功するパターン
        cy.get(datatest('mdl-append-fumen')).should('visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('v115@9gi0EeR4Rpg0DeR4wwRpglCeBtxwilDeBtwwJeAgHv?hERmBuqBMrBXsBAAA');
                cy.get(datatest('btn-append-to-end')).click();
            });

        // Assertion: モーダルが閉じられている
        cy.get(datatest('mdl-append-fumen')).should('not.exist');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '3 / 8');

        expectFumen('v115@vhBzKJCsB9gi0EeR4Rpg0DeR4wwRpglxSgWhlxwilx?SgWAeBtwwJeAAAvhERmBuqBMrBXsBAAA');
    });

    it('Cancel', () => {
        visit({ lng: 'ja' });

        // モーダルを開く
        operations.menu.append();

        // 入力に失敗するパターン
        cy.get(datatest('mdl-append-fumen')).should('visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('hello world');
                cy.get(datatest('btn-append-to-end')).click();

                // Assertion: エラーメッセージ
                cy.get(datatest('text-message')).should('contain', 'テト譜を読み込めませんでした');

                cy.get(datatest('btn-append-to-end')).should('have.class', 'disabled');
            });

        // キャンセル
        cy.get(datatest('mdl-append-fumen')).should('visible')
            .within(() => {
                cy.get(datatest('btn-cancel')).click();
            });

        // Assertion: モーダルが閉じられている
        cy.get(datatest('mdl-append-fumen')).should('not.exist');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');

        // モーダルを開く
        operations.menu.append();

        // 全てが消えている
        cy.get(datatest('mdl-append-fumen')).should('visible')
            .within(() => {
                cy.get(datatest('btn-append-to-next')).should('have.class', 'disabled');
                cy.get(datatest('btn-append-to-end')).should('have.class', 'disabled');
                cy.get(datatest('input-fumen')).should('have.text', '');
                cy.get(datatest('text-message')).should('have.text', '');
            });
    });
});

