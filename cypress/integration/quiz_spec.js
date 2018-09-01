import { Color, datatest, holdBox, leftTap, mino, nextBox, pages, Piece, rightTap, Rotation, visit } from './_common';

// Quizのテスト
describe('Quiz', () => {
    const changeColor = 'green darken-1';

    it('after quiz', () => {
        const page = pages(3);

        visit({
            fumen: 'v115@vhCWSYVAFLDmClcJSAVDEHBEooRBKoAVB6AAAAUoBT?pB',
        });

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

        {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](J)Z');
            cy.get(datatest('text-comment')).should('have.class', changeColor);

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);
            [Piece.Z].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
            cy.get(nextBox(1)).should('not.exist');

            // Jミノの確認
            mino(Piece.J, Rotation.Spawn)(8, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.J);
            });
        }

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](Z)');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);
            cy.get(nextBox(0)).should('not.exist');

            // Jミノの確認
            mino(Piece.Z, Rotation.Spawn)(8, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.Z);
            });
        });

        rightTap(() => {
            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '');

            // Hold & Nextの確認
            cy.get(holdBox()).should('not.exist');
            cy.get(nextBox(0)).should('not.exist');

            // Jミノの確認
            mino(Piece.O, Rotation.Spawn)(0, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.O);
            });
        });
    });

    it('10 PC', () => {
        const page = pages(102);

        visit({
            fumen: 'v115@vh/AgWaAFLDmClcJSAVDEHBEooRBJoAVBMHmPCzXBA?AxuBypBTfBetBXsQgAFLDmClcJSAVztSAVG88A4c88AZn88?AQXOMCv/rtCFrB0gB0hBliB5oBetQhAFLDmClcJSAVjiSAV?G88AYP88AZyrSAS4KuCqyCMC0AAAAyvBXsBTpBUlB3iBumB?ifBzgB5oB1xQlAFLDmClcJSAVDEHBEooRBUoAVB0yLMCqHj?SASIKWCpuPFDzAAAAdoBKqBfrBmgB8rBTpBTfBCiB5oBxuQ?iAFLDmClcJSAVDVSAVG88AYe88AZfLuCFbEwCKtbMCMHBAA?etBUrBFsB3iB2pB3hB0fBlgB5oBKpQpAFLDmClcJSAVzbSA?VG88A4W88A5no2AzOUFDKXVSASY9tCqyaFDpAAAAfqBzsBq?qB0rBmfBziBdnBFhB5oB2uQjAFLDmClcJSAVjrSAVG88AYP?88AZyaFDJoo2ApvTWCvuDCA/kBSwBcmBTlBRgB2xB/nBaoB?5oBVwQgAFLDmClcJSAVjiSAVG88AYe88AZn88AQ+KWCzfbM?CUsB1mBvhlTpBTfBftBmiBcqBigB5oBxuQkAFLDmClcJSAV?DEHBEooRBJoAVB0yaPCzn88AQubMCvintCypBTfBetBXsBF?rB0gB0hBliB5oBTpQhAFLDmClcJSAVjiSAVG88AYS88AZvr?SAS4aMCzvKWC0AAAAetBXsByvBUlB3iBumBzgBifB5oB1xQ?oAFLDmClcJSAVDEHBEooRBUoAVBFbUOCJNegCsn88AQyytC?pfjxC2uB/kBdoBzqBalB8rBCiBzgB5oBAAA',
        });

        {
            // Assertion: ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)LOTJSZ');
            cy.get(datatest('text-comment')).should('have.class', changeColor);
        }

        // パフェ1回目
        [
            {comment: '#Q=[](I)LOTJSZ', isChanged: false},
            {comment: '#Q=[](L)OTJSZ', isChanged: true},
            {comment: '#Q=[](O)TJSZ', isChanged: true},
            {comment: '#Q=[](T)JSZ', isChanged: true},
            {comment: '#Q=[T](S)Z ZTIOJLS', isChanged: true},
            {comment: '#Q=[T](Z)ZTIOJLS', isChanged: true},
            {comment: '#Q=[Z](Z)TIOJLS', isChanged: true},
            {comment: '#Q=[Z](T)IOJLS', isChanged: true},
            {comment: '#Q=[T](I)OJLS', isChanged: true},
            {comment: '#Q=[I](O)JLS', isChanged: true},
            {comment: '#Q=[O](J)LS ZSJLOIT', isChanged: true}
        ].forEach(({comment, isChanged}) => {
            rightTap();
            cy.get(datatest('text-comment')).should('have.value', comment);
            if (isChanged)
                cy.get(datatest('text-comment')).should('have.class', changeColor);
            else
                cy.get(datatest('text-comment')).should('not.have.class', changeColor);
        });

        // パフェ2回目
        rightTap(10, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)TLSIJZO OLITJZS');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)LSIJZOOLITJZS');
        });

        // パフェ3回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[I](T)JZS TJSZILO');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[T](J)ZSTJSZILO');
        });

        // パフェ4回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[L](O) STLZJOI TSJLOZI');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](S)TLZJOITSJLOZI');
        });

        // パフェ5回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](J)LOZI IJSLOTZ');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](L)OZIIJSLOTZ');
        });

        // パフェ6回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](T)Z TOLSJZI');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](Z)TOLSJZI');
        });

        // パフェ7回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)TLOJSZ TZIOLJS');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)LOJSZTZIOLJS');
        });

        // パフェ8回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](L)JS ZISJOLT');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[L](J)SZISJOLT');
        });

        // パフェ9回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T) JISTOLZ LOSIJZT');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](J)ISTOLZLOSIJZT');
        });

        // パフェ10回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](I)JZT');
        });

        // 最初に戻る
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)LOTJSZ');
            cy.get(datatest('text-comment')).should('have.class', changeColor);
        });
    });

    it('10 PC / Reverse', () => {
        const page = pages(102);

        visit({
            fumen: 'v115@vh/AgWaAFLDmClcJSAVDEHBEooRBJoAVBMHmPCzXBA?AxuBypBTfBetBXsQgAFLDmClcJSAVztSAVG88A4c88AZn88?AQXOMCv/rtCFrB0gB0hBliB5oBetQhAFLDmClcJSAVjiSAV?G88AYP88AZyrSAS4KuCqyCMC0AAAAyvBXsBTpBUlB3iBumB?ifBzgB5oB1xQlAFLDmClcJSAVDEHBEooRBUoAVB0yLMCqHj?SASIKWCpuPFDzAAAAdoBKqBfrBmgB8rBTpBTfBCiB5oBxuQ?iAFLDmClcJSAVDVSAVG88AYe88AZfLuCFbEwCKtbMCMHBAA?etBUrBFsB3iB2pB3hB0fBlgB5oBKpQpAFLDmClcJSAVzbSA?VG88A4W88A5no2AzOUFDKXVSASY9tCqyaFDpAAAAfqBzsBq?qB0rBmfBziBdnBFhB5oB2uQjAFLDmClcJSAVjrSAVG88AYP?88AZyaFDJoo2ApvTWCvuDCA/kBSwBcmBTlBRgB2xB/nBaoB?5oBVwQgAFLDmClcJSAVjiSAVG88AYe88AZn88AQ+KWCzfbM?CUsB1mBvhlTpBTfBftBmiBcqBigB5oBxuQkAFLDmClcJSAV?DEHBEooRBJoAVB0yaPCzn88AQubMCvintCypBTfBetBXsBF?rB0gB0hBliB5oBTpQhAFLDmClcJSAVjiSAVG88AYS88AZvr?SAS4aMCzvKWC0AAAAetBXsByvBUlB3iBumBzgBifB5oB1xQ?oAFLDmClcJSAVDEHBEooRBUoAVBFbUOCJNegCsn88AQyytC?pfjxC2uB/kBdoBzqBalB8rBCiBzgB5oBAAA',
        });

        {
            // Assertion: ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            // Quizの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)LOTJSZ');
            cy.get(datatest('text-comment')).should('have.class', changeColor);
        }

        // 後ろから順に辿る
        leftTap(102);

        // パフェ1回目
        [
            {comment: '#Q=[](I)LOTJSZ', isChanged: false},
            {comment: '#Q=[](L)OTJSZ', isChanged: true},
            {comment: '#Q=[](O)TJSZ', isChanged: true},
            {comment: '#Q=[](T)JSZ', isChanged: true},
            {comment: '#Q=[T](S)Z ZTIOJLS', isChanged: true},
            {comment: '#Q=[T](Z)ZTIOJLS', isChanged: true},
            {comment: '#Q=[Z](Z)TIOJLS', isChanged: true},
            {comment: '#Q=[Z](T)IOJLS', isChanged: true},
            {comment: '#Q=[T](I)OJLS', isChanged: true},
            {comment: '#Q=[I](O)JLS', isChanged: true},
            {comment: '#Q=[O](J)LS ZSJLOIT', isChanged: true}
        ].forEach(({comment, isChanged}) => {
            rightTap();
            cy.get(datatest('text-comment')).should('have.value', comment);
            if (isChanged)
                cy.get(datatest('text-comment')).should('have.class', changeColor);
            else
                cy.get(datatest('text-comment')).should('not.have.class', changeColor);
        });

        // パフェ2回目
        rightTap(10, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)TLSIJZO OLITJZS');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)LSIJZOOLITJZS');
        });

        // パフェ3回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[I](T)JZS TJSZILO');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[T](J)ZSTJSZILO');
        });

        // パフェ4回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[L](O) STLZJOI TSJLOZI');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](S)TLZJOITSJLOZI');
        });

        // パフェ5回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](J)LOZI IJSLOTZ');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](L)OZIIJSLOTZ');
        });

        // パフェ6回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](T)Z TOLSJZI');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](Z)TOLSJZI');
        });

        // パフェ7回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)TLOJSZ TZIOLJS');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T)LOJSZTZIOLJS');
        });

        // パフェ8回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[O](L)JS ZISJOLT');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[L](J)SZISJOLT');
        });

        // パフェ9回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](T) JISTOLZ LOSIJZT');
        });
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](J)ISTOLZLOSIJZT');
        });

        // パフェ10回目
        rightTap(9, () => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](I)JZT');
        });

        // 最初に戻る
        rightTap(() => {
            cy.get(datatest('text-comment')).should('have.value', '#Q=[](I)LOTJSZ');
            cy.get(datatest('text-comment')).should('have.class', changeColor);
        });
    });
});
