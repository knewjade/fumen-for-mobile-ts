import { datatest, leftTap, rightTap, visit } from '../support/common';
import { operations } from '../support/operations';

describe('User settings', () => {
    it('Ghost visible', () => {
        cy.clearLocalStorage();

        visit({});

        // visible -> hidden
        operations.menu.openUserSettings();
        cy.get(datatest('switch-ghost-visible')).should('be.checked');
        cy.get(datatest('switch-ghost-visible')).uncheck({ force: true });
        cy.get(datatest('btn-save')).click();

        // cancel
        operations.menu.openUserSettings();
        cy.get(datatest('switch-ghost-visible')).should('not.be.checked');
        cy.get(datatest('switch-ghost-visible')).check({ force: true });
        cy.get(datatest('btn-cancel')).click();

        // reload
        operations.menu.openUserSettings();
        cy.get(datatest('switch-ghost-visible')).should('not.be.checked');
        cy.get(datatest('switch-ghost-visible')).check({ force: true });

        visit({ reload: true });

        // hidden -> visible
        operations.menu.openUserSettings();
        cy.get(datatest('switch-ghost-visible')).should('not.be.checked');
        cy.get(datatest('switch-ghost-visible')).check({ force: true });
        cy.get(datatest('btn-save')).click();

        // verify
        operations.menu.openUserSettings();
        cy.get(datatest('switch-ghost-visible')).should('be.checked');
    });

    it('Loop: reader', () => {
        cy.clearLocalStorage();

        visit({ fumen: 'v115@vhF0MJ9NJXDJ2OJzEJi/I' });

        // 移動しないことの確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');
        leftTap();
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');
        operations.menu.lastPage();
        rightTap();
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '6 / 6');

        // disable -> enable
        operations.menu.openUserSettings();
        cy.get(datatest('switch-loop')).should('not.be.checked');
        cy.get(datatest('switch-loop')).check({ force: true });
        cy.get(datatest('btn-save')).click();

        // cancel
        operations.menu.openUserSettings();
        cy.get(datatest('switch-loop')).should('be.checked');
        cy.get(datatest('switch-loop')).uncheck({ force: true });
        cy.get(datatest('btn-cancel')).click();

        // reload
        operations.menu.openUserSettings();
        cy.get(datatest('switch-loop')).should('be.checked');
        cy.get(datatest('switch-loop')).uncheck({ force: true });

        visit({ reload: true });

        // 移動することの確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');
        leftTap();
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '6 / 6');
        rightTap();
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');

        // enable -> disable
        operations.menu.openUserSettings();
        cy.get(datatest('switch-loop')).should('be.checked');
        cy.get(datatest('switch-loop')).uncheck({ force: true });
        cy.get(datatest('btn-save')).click();

        // verify
        operations.menu.openUserSettings();
        cy.get(datatest('switch-loop')).should('not.be.checked');
    });

    it('Loop: editor', () => {
        cy.clearLocalStorage();

        visit({ fumen: 'v115@vhF0MJ9NJXDJ2OJzEJi/I', mode: 'edit' });

        // 移動しないことの確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');
        cy.get(datatest('btn-back-page')).click();
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');

        operations.menu.loopOn();

        // 移動しないことの確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');
        cy.get(datatest('btn-back-page')).click();
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');
    });
});

