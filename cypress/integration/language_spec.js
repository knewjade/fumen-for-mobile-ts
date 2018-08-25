import { datatest, visit } from './_common.js';

// Hold & Nextのテスト
describe('Langauge', () => {
    it('ja', () => {
        visit('./public/index.html&lng=ja');

        cy.get(datatest('open-fumen-label')).should('have.text', 'テト譜を開く');
    });

    it('en', () => {
        visit('./public/index.html&lng=en');

        cy.get(datatest('open-fumen-label')).should('have.text', 'Open Fumen');
    });
});
