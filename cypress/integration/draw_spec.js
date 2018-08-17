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
        cy.get('body').click(300, 480);

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
        cy.get('body').click(300, 310);

        // Go to next page
        cy.get(datatest('btn-next-page')).click();

        {
            cy.get('body').click(250, 450);
            cy.get('body').click(200, 500);
            cy.get('body').click(150, 550);
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
            cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@qeA8UeA8QeA8ceg0Jeg0Jeg0Jeg0Jeg0RfAgHygQpQ?eQpQeQpXeAgH');
        }
    });
});
