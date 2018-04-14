import {datatest, holdBox, nextBox, pages, Piece, rightTap} from './common.js';

// Hold & Nextのテスト
describe('Quiz', () => {
    it('init', () => {
        cy.visit('./public/index.html');

        // Hold & Nextの確認
        cy.get(holdBox()).should('not.exist');
        cy.get(nextBox(0)).should('not.exist');
        cy.get(nextBox(1)).should('not.exist');
        cy.get(nextBox(2)).should('not.exist');
        cy.get(nextBox(3)).should('not.exist');
        cy.get(nextBox(4)).should('not.exist');
        cy.get(nextBox(5)).should('not.exist');
    });

    it('with Quiz', () => {
        const page = pages(2);

        cy.visit('./public/index.html?d=v115@vhB0KYaAFLDmClcJSAVDEHBEooRBaoAVBp/9tCvCBA?A2uB');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

        {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](Z)IJTSOL');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);
            [Piece.I, Piece.J, Piece.T, Piece.S, Piece.O].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        }

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)JTSOL');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.I);
            [Piece.T, Piece.S, Piece.O, Piece.L].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });
    });
});
