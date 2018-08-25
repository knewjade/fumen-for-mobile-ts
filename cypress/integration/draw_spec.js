import { datatest } from './common';

// テト譜を開く
describe('Sent line', () => {
    it('Draw blocks', () => {
        cy.visit('./public/index.html');

        // Writable mode
        cy.get(datatest('btn-open-settings')).click();
        cy.get(datatest('btn-writable')).click();

        cy.wait(500);

        {
            cy.get('body').click(100, 100);
            cy.get('body').click(150, 150);
            cy.get('body').click(100, 200);
        }

        // Select J color
        cy.get(datatest('btn-piece-j')).click();

        {
            cy.get('body')
                .trigger('mousedown', 100, 300)
                .trigger('mousemove', 125, 325)
                .trigger('mousemove', 150, 350)
                .trigger('mousemove', 175, 375)
                .trigger('mousemove', 200, 400)
                .trigger('mouseup', 200, 400);
        }

        // Select O color
        cy.get(datatest('btn-piece-o')).click();

        // Go to next page
        cy.get(datatest('btn-next-page')).click();

        {
            cy.get('body').click(250, 450);
            cy.get('body').click(200, 500);
            cy.get('body').click(150, 550);
        }

        // Select S color
        cy.get(datatest('btn-piece-s')).click();

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

        // 設定を開く
        {
            cy.get(datatest('btn-open-settings')).click();
        }

        // テト譜をコピー
        {
            cy.get(datatest('btn-copy-fumen')).click();
        }

        cy.wait(100);

        // データを取り出す
        {
            cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@qeA8UeA8QeA8ceg0Jeg0Jeg0Jeg0Jeg0RfAgHygQpQ?eQpQeQpEeY4AeY4AgH');
        }
    });
});
