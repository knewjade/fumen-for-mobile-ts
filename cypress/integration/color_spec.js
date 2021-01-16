import { block, ClassicColor, Color, rightTap, visit } from '../support/common';

describe('Color', () => {
    it('Guide line color', () => {
        visit({
            fumen: 'v115@9gQ4g0wwAtQpglB8AewhQ4g0wwAtQpglB8AewhQ4g0?wwAtQpglB8AewhQ4g0wwAtQpglB8AewhJeJDnvhAJjB',
        });

        cy.wait(2000);

        // Lockなし
        {
            // 1段目
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Gray.Normal);
            cy.get(block(9, 0)).should('have.attr', 'color', Color.I.Normal);

            // 2段目
            cy.get(block(7, 1)).should('have.attr', 'color', Color.Gray.Normal);
            cy.get(block(8, 1)).should('have.attr', 'color', Color.I.Highlight2);
            cy.get(block(9, 1)).should('have.attr', 'color', Color.I.Normal);
        }

        cy.wait(2000);

        rightTap();

        cy.wait(2000);

        // Lockあり
        {
            // 1段目
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Gray.Normal);
            cy.get(block(9, 0)).should('have.attr', 'color', Color.I.Normal);

            // 2段目
            cy.get(block(7, 1)).should('have.attr', 'color', Color.Gray.Highlight1);
            cy.get(block(8, 1)).should('have.attr', 'color', Color.I.Highlight2);
            cy.get(block(9, 1)).should('have.attr', 'color', Color.I.Highlight1);
        }
    });

    it('Classic color', () => {
        visit({
            fumen: 'v115@9gQ4g0wwAtQpglB8AewhQ4g0wwAtQpglB8AewhQ4g0?wwAtQpglB8AewhQ4g0wwAtQpglB8AewhJeJjfvhAJjB',
        });

        cy.wait(2000);

        // Lockなし
        {
            // 1段目
            cy.get(block(7, 0)).should('have.attr', 'color', ClassicColor.Gray.Normal);
            cy.get(block(9, 0)).should('have.attr', 'color', ClassicColor.I.Normal);

            // 2段目
            cy.get(block(7, 1)).should('have.attr', 'color', ClassicColor.Gray.Normal);
            cy.get(block(8, 1)).should('have.attr', 'color', ClassicColor.I.Highlight2);
            cy.get(block(9, 1)).should('have.attr', 'color', ClassicColor.I.Normal);
        }

        cy.wait(2000);

        rightTap();

        cy.wait(2000);

        // Lockあり
        {
            // 1段目
            cy.get(block(7, 0)).should('have.attr', 'color', ClassicColor.Gray.Normal);
            cy.get(block(9, 0)).should('have.attr', 'color', ClassicColor.I.Normal);

            // 2段目
            cy.get(block(7, 1)).should('have.attr', 'color', ClassicColor.Gray.Highlight1);
            cy.get(block(8, 1)).should('have.attr', 'color', ClassicColor.I.Highlight2);
            cy.get(block(9, 1)).should('have.attr', 'color', ClassicColor.I.Highlight1);
        }
    });
});
