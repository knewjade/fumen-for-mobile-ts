import { datatest } from './_common';
import { operations } from './_operations';

// テト譜を開く
describe('Drawing', () => {
    it('Draw blocks', () => {
        cy.visit('./public/index.html');

        operations.screen.writable();
        operations.mode.block.open();

        {
            cy.get('body').click(100, 100);
            cy.get('body').click(150, 150);
            cy.get('body').click(100, 200);
        }

        operations.mode.block.J();

        {
            cy.get('body')
                .trigger('mousedown', 100, 300)
                .trigger('mousemove', 125, 325)
                .trigger('mousemove', 150, 350)
                .trigger('mousemove', 175, 375)
                .trigger('mousemove', 200, 400)
                .trigger('mouseup', 200, 400);
        }

        operations.mode.block.O();

        // Go to next page
        cy.get(datatest('btn-next-page')).click();

        {
            cy.get('body').click(250, 450);
            cy.get('body').click(200, 500);
            cy.get('body').click(150, 550);
        }

        operations.mode.block.S();

        {
            cy.get('body')
                .trigger('mousedown', 50, 580)
                .trigger('mousemove', 75, 580)
                .trigger('mousemove', 100, 580)
                .trigger('mousemove', 125, 580)
                .trigger('mousemove', 150, 580)
                .trigger('mousemove', 175, 580)
                .trigger('mousemove', 200, 580)
                .trigger('mousemove', 225, 580)
                .trigger('mousemove', 250, 580)
                .trigger('mouseup', 250, 580);
        }

        {
            cy.get('body')
                .trigger('mousedown', 50, 600)
                .trigger('mousemove', 75, 600)
                .trigger('mousemove', 100, 600)
                .trigger('mousemove', 125, 600)
                .trigger('mousemove', 150, 600)
                .trigger('mousemove', 175, 600)
                .trigger('mousemove', 200, 600)
                .trigger('mousemove', 225, 600)
                .trigger('mousemove', 250, 600)
                .trigger('mouseup', 250, 600);
        }

        operations.settings.copyToClipboard();

        cy.wait(100);

        // データを取り出す
        {
            cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@qeA8UeA8QeA8ceg0Jeg0Jeg0Jeg0Jeg0RfAgHygQpQ?eQpQeQpEeY4AeY4AgH');
        }
    });

    it('Draw blocks 2', () => {
        cy.visit('./public/index.html');

        operations.screen.writable();

        operations.mode.block.open();
        operations.mode.block.I();

        {
            operations.mode.block.click(0, 0);
            operations.mode.block.click(2, 5);
            operations.mode.block.click(4, 10);
            operations.mode.block.click(6, 15);
            operations.mode.block.click(8, 20);
            operations.mode.block.click(9, 21);
            operations.mode.block.click(8, 22);
        }

        operations.mode.block.T();
        operations.mode.block.dragToRight({ from: 0, to: 9 }, 1);

        operations.mode.block.O();
        operations.mode.block.dragToRight({ from: 0, to: 9 }, -1);

        operations.settings.copyToClipboard();

        // データを取り出す
        {
            cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@HewhJewhHewhuewhuewhuewhke4wAewhIeYpAeAgH');
        }
    });
});
