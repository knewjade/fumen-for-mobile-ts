import { datatest, visit, } from '../support/common';
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
});

