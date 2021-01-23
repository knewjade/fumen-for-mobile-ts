import { datatest, visit } from '../support/common.js';
import { operations } from '../support/operations';

// Hold & Nextのテスト
describe('Langauge', () => {
    it('ja', () => {
        visit({ lng: 'ja' });

        operations.menu.openPage();

        cy.get(datatest('open-fumen-label')).should('have.text', 'テト譜を開く');
    });

    it('en', () => {
        visit({ lng: 'en' });

        operations.menu.openPage();

        cy.get(datatest('open-fumen-label')).should('have.text', 'Open fumen');
    });
});
