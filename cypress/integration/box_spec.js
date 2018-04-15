import {datatest, holdBox, nextBox, pages, Piece, rightTap} from './common.js';

// Hold & Nextのテスト
describe('Box', () => {
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
        const page = pages(14);

        cy.visit('./public/index.html?d=v115@vhN0KYaAFLDmClcJSAVDEHBEooRBaoAVBp/9tCvCBA?A2uBlkBxfBTtBSoBAAAXsBAAAUmB0mQaAFLDmClcJSAVDEH?BEooRBUoAVB6yaFDK+AAAAAAlsQaAFLDmClcJSAVDEHBEoo?RBJoAVBvyjPC0XBAAAAA');

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

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[I](T)SOL');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.I);
            [Piece.S, Piece.O, Piece.L].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(3)).should('not.have.attr', 'type');
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[I](S)OL');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.S);
            [Piece.O, Piece.L].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(2)).should('not.have.attr', 'type');
            cy.get(nextBox(3)).should('not.have.attr', 'type');
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](O)L');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.S);
            [Piece.L].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(1)).should('not.have.attr', 'type');
            cy.get(nextBox(2)).should('not.have.attr', 'type');
            cy.get(nextBox(3)).should('not.have.attr', 'type');
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](L)');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.S);
            cy.get(nextBox(0)).should('not.have.attr', 'type');
            cy.get(nextBox(1)).should('not.have.attr', 'type');
            cy.get(nextBox(2)).should('not.have.attr', 'type');
            cy.get(nextBox(3)).should('not.have.attr', 'type');
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](S)');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.S);
            cy.get(nextBox(0)).should('not.have.attr', 'type');
            cy.get(nextBox(1)).should('not.have.attr', 'type');
            cy.get(nextBox(2)).should('not.have.attr', 'type');
            cy.get(nextBox(3)).should('not.have.attr', 'type');
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](S)');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);
            cy.get(nextBox(0)).should('not.have.attr', 'type');
            cy.get(nextBox(1)).should('not.have.attr', 'type');
            cy.get(nextBox(2)).should('not.have.attr', 'type');
            cy.get(nextBox(3)).should('not.have.attr', 'type');
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '');

            // Hold & Nextの確認
            cy.get(holdBox()).should('not.have.attr', 'type');
            [Piece.Z, Piece.Z, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(3)).should('not.have.attr', 'type');
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '');

            // Hold & Nextの確認
            cy.get(holdBox()).should('not.have.attr', 'type');
            [Piece.Z, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(2)).should('not.have.attr', 'type');
            cy.get(nextBox(3)).should('not.have.attr', 'type');
            cy.get(nextBox(4)).should('not.have.attr', 'type');
            cy.get(nextBox(5)).should('not.exist');
        });

        // 2つめのQuiz (page11)
        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)ZLOZJI');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.T);
            [Piece.L, Piece.O, Piece.Z, Piece.J, Piece.I].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[T](L)OZJI');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.T);
            [Piece.L, Piece.O, Piece.Z, Piece.J, Piece.I].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)OLSJTZ');

            // Hold & Nextの確認
            // [CHANGE] テト譜では、NextにIが表示されない
            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);
            [Piece.I, Piece.O, Piece.L, Piece.S, Piece.J].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)OLSJTZ');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);
            [Piece.I, Piece.O, Piece.L, Piece.S, Piece.J].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });
    });
});
