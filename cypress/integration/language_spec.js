import {datatest, holdBox, nextBox, pages, Piece, rightTap, visit} from './common.js';
import {leftTap} from "./common";

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
