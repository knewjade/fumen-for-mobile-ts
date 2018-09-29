import { datatest, holdBox, nextBox, pages, Piece, rightTap, visit } from './_common.js';
import { leftTap } from "./_common";

// Hold & Nextのテスト
describe('Box', () => {
    it('init', () => {
        visit({});

        // Hold & Nextの確認
        cy.get(holdBox()).should('not.exist');
        cy.get(nextBox(0)).should('not.exist');
        cy.get(nextBox(1)).should('not.exist');
        cy.get(nextBox(2)).should('not.exist');
        cy.get(nextBox(3)).should('not.exist');
        cy.get(nextBox(4)).should('not.exist');
        cy.get(nextBox(5)).should('not.exist');
    });

    it('without Quiz', () => {
        const page = pages(17);

        visit({
            fumen: 'v115@vhG0fm0Tf0sBvtB39e3qBTpfRhRpHeRpRemkBvhCpm?BNsfGofOhi0Ieg0TeAAevhExkBlcBdrfAAeNsf',
        });

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

        {
            // Hold & Nextの確認
            cy.get(holdBox()).should('not.exist');
            [Piece.S, Piece.S, Piece.O, Piece.J, Piece.I].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        }

        rightTap(3, () => {
            cy.get(holdBox()).should('not.exist');
            [Piece.S, Piece.O, Piece.J, Piece.I, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            // [CHANGE] テト譜では、NextはOJITIとなるが、Jが出力されない理由がわからないため出力する
            [Piece.O, Piece.J, Piece.I, Piece.T, Piece.J].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(2, () => {
            cy.get(holdBox()).should('not.exist');
            [Piece.J, Piece.I, Piece.T, Piece.J, Piece.I].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.I, Piece.T, Piece.J, Piece.I, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.T, Piece.J, Piece.I, Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.J, Piece.I, Piece.T, Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.I, Piece.T, Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(4)).should('not.exist');
        });

        rightTap(2, () => {
            cy.get(holdBox()).should('not.exist');
            [Piece.T, Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(3)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(2)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(1)).should('not.exist');
        });

        rightTap(2, () => {
            cy.get(holdBox()).should('not.exist');
            cy.get(nextBox(0)).should('not.exist');
        });
    });

    it('without Quiz / Reverse', () => {
        const page = pages(17);

        visit({
            fumen: 'v115@vhG0fm0Tf0sBvtB39e3qBTpfRhRpHeRpRemkBvhCpm?BNsfGofOhi0Ieg0TeAAevhExkBlcBdrfAAeNsf',
        });

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

        // 後ろから順に辿る
        leftTap(17);

        {
            // Hold & Nextの確認
            cy.get(holdBox()).should('not.exist');
            [Piece.S, Piece.S, Piece.O, Piece.J, Piece.I].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        }

        rightTap(3, () => {
            cy.get(holdBox()).should('not.exist');
            [Piece.S, Piece.O, Piece.J, Piece.I, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            // [CHANGE] テト譜では、NextはOJITIとなるが、Jが出力されない理由がわからないため出力する
            [Piece.O, Piece.J, Piece.I, Piece.T, Piece.J].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(2, () => {
            cy.get(holdBox()).should('not.exist');
            [Piece.J, Piece.I, Piece.T, Piece.J, Piece.I].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.I, Piece.T, Piece.J, Piece.I, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.T, Piece.J, Piece.I, Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.J, Piece.I, Piece.T, Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(5)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.I, Piece.T, Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(4)).should('not.exist');
        });

        rightTap(2, () => {
            cy.get(holdBox()).should('not.exist');
            [Piece.T, Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(3)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.T, Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(2)).should('not.exist');
        });

        rightTap(() => {
            cy.get(holdBox()).should('not.exist');
            [Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(1)).should('not.exist');
        });

        rightTap(2, () => {
            cy.get(holdBox()).should('not.exist');
            cy.get(nextBox(0)).should('not.exist');
        });
    });

    it('with Quiz', () => {
        const page = pages(14);

        visit({
            fumen: 'v115@vhN0KYaAFLDmClcJSAVDEHBEooRBaoAVBp/9tCvCBA?A2uBlkBxfBTtBSoBAAAXsBAAAUmB0mQaAFLDmClcJSAVDEH?BEooRBUoAVB6yaFDK+AAAAAAlsQaAFLDmClcJSAVDEHBEoo?RBJoAVBvyjPC0XBAAAAA',
        });

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
            // [CHANGE] テト譜では、NextにIが表示されない（現在のミノはスキップされてしまうため。次のページでは現れる）
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

    it('with Quiz / Reverse', () => {
        const page = pages(14);

        visit({
            fumen: 'v115@vhN0KYaAFLDmClcJSAVDEHBEooRBaoAVBp/9tCvCBA?A2uBlkBxfBTtBSoBAAAXsBAAAUmB0mQaAFLDmClcJSAVDEH?BEooRBUoAVB6yaFDK+AAAAAAlsQaAFLDmClcJSAVDEHBEoo?RBJoAVBvyjPC0XBAAAAA',
        });

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

        // 後ろから順に辿る
        leftTap(14);

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
            // [CHANGE] テト譜では、NextにIが表示されない（現在のミノはスキップされてしまうため。次のページでは現れる）
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

    it('Multi quiz', () => {
        visit({ fumen: 'v115@vhHyOY3AFLDmClcJSAVjiSAVG88AYS88AZPUABCowA?BR4K6Bl/UtClfJSASE7SAyltSATzarDMjzCATEJm/I3LJtK?JUBJAgHAgH' });

        {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](L)J;#Q=[S](Z)T;hello');

            cy.get(holdBox()).should('have.attr', 'type', Piece.O);

            [Piece.J].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });

            cy.get(nextBox(1)).should('not.exist');
        }

        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](J);#Q=[S](Z)T;hello');

            cy.get(holdBox()).should('have.attr', 'type', Piece.J);

            cy.get(nextBox(0)).should('not.exist');
        });

        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](J);#Q=[S](Z)T;hello');

            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);

            cy.get(nextBox(0)).should('not.exist');
        });

        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](Z)T;hello');

            cy.get(holdBox()).should('have.attr', 'type', Piece.Z);

            [Piece.T].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });

            cy.get(nextBox(1)).should('not.exist');
        });

        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[Z](T);hello');

            cy.get(holdBox()).should('have.attr', 'type', Piece.Z);

            cy.get(nextBox(0)).should('not.exist');
        });

        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](Z);hello');

            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);

            cy.get(nextBox(0)).should('not.exist');
        });

        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', 'hello');

            cy.get(holdBox()).should('not.exist');

            cy.get(nextBox(0)).should('not.exist');
        });
    });
});
