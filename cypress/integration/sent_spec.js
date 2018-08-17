import { block, Color, datatest, leftTap, mino, pages, Piece, rightTap, Rotation, sentBlock, visit } from './common';

// テト譜を開く
describe('Sent line', () => {
    it('Highlight pieces', () => {
        const page = pages(23);

       visit('v115@vhMSwQaAFLDmClcJSAVDEHBEooRBMoAVBqHDMCzOBA?AWyBUoBTpBXmBJnBVhBpeQaAFLDmClcJSAVDEHBEooRBJoA?VBvHUxCqCBAAzdB0XBPTBOfB6WBlhA8AeH8AoFvhDliBtnB?elBFdFlhC8Q4g0wwAtQpglwhAAAvhDA4BAAeAAAAAA');

        {
            // ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            // Lミノの確認
            mino(Piece.L, Rotation.Spawn)(4, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.L);
            });
        }

        rightTap(() => {
            // Jミノの確認
            mino(Piece.J, Rotation.Spawn)(8, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.J);
            });
        });

        rightTap(() => {
            // Zミノの確認
            mino(Piece.Z, Rotation.Spawn)(8, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.Z);
            });
        });

        rightTap(() => {
            // Oミノの確認
            mino(Piece.O, Rotation.Spawn)(0, 0).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.O);
            });
        });

        rightTap(() => {
            // Sミノの確認
            mino(Piece.S, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.S);
            });
        });

        rightTap(() => {
            // Iミノの確認
            mino(Piece.I, Rotation.Left)(6, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.I);
            });
        });

        rightTap(() => {
            // Tミノの確認
            mino(Piece.T, Rotation.Spawn)(4, 3).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Highlight.T);
            });
        });
    });

    it('Sent line', () => {
        const page = pages(23);

       visit('v115@vhMSwQaAFLDmClcJSAVDEHBEooRBMoAVBqHDMCzOBA?AWyBUoBTpBXmBJnBVhBpeQaAFLDmClcJSAVDEHBEooRBJoA?VBvHUxCqCBAAzdB0XBPTBOfB6WBlhA8AeH8AoFvhDliBtnB?elBFdFlhC8Q4g0wwAtQpglwhAAAvhDA4BAAeAAAAAA');

        {
            // ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));
        }

        // フィールド下の確認
        rightTap(13, () => {
            cy.get(sentBlock(1)).should('have.attr', 'color', Color.Empty.Field);
            [0, 2, 3, 4, 5, 6, 7, 8, 9].forEach((x) => {
                cy.get(sentBlock(x)).should('have.attr', 'color', Color.Gray.Field);
            });

            // フィールド左下
            cy.get(block(0, 0)).should('have.attr', 'color', Color.Normal.O);
            cy.get(block(0, 1)).should('have.attr', 'color', Color.Normal.O);
        });

        // せり上がり＆反転後の確認
        rightTap(() => {
            cy.get(block(8, 0)).should('have.attr', 'color', Color.Empty.Field);
            [0, 1, 2, 3, 4, 5, 6, 7, 9].forEach((x) => {
                cy.get(block(x, 0)).should('have.attr', 'color', Color.Gray.Field);
            });

            // フィールド右下
            cy.get(block(9, 1)).should('have.attr', 'color', Color.Normal.O);
            cy.get(block(9, 2)).should('have.attr', 'color', Color.Highlight.O);
        });

        // Tスピンx2後の確認
        rightTap(2, () => {
            // フィールド右下
            cy.get(block(9, 1)).should('have.attr', 'color', Color.Empty.Field);
            cy.get(block(9, 2)).should('have.attr', 'color', Color.Empty.Field);
        });

        // Tスピン後の確認・Hightlightなしの確認
        rightTap(2, () => {
            // 残っている全てのブロック
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(5, 1)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Normal.J);
            cy.get(block(7, 1)).should('have.attr', 'color', Color.Normal.J);

            // フィールド下の確認
            cy.get(sentBlock(2)).should('have.attr', 'color', Color.Gray.Field);
            cy.get(sentBlock(3)).should('have.attr', 'color', Color.Normal.S);
            cy.get(sentBlock(4)).should('have.attr', 'color', Color.Normal.J);
            cy.get(sentBlock(5)).should('have.attr', 'color', Color.Normal.T);
            cy.get(sentBlock(6)).should('have.attr', 'color', Color.Normal.Z);
            cy.get(sentBlock(7)).should('have.attr', 'color', Color.Normal.O);
            cy.get(sentBlock(8)).should('have.attr', 'color', Color.Normal.L);
            cy.get(sentBlock(9)).should('have.attr', 'color', Color.Normal.I);
        });

        // せり上がりしない・ライン削除されないことの確認
        rightTap(() => {
            // 残っている全てのブロック
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(5, 1)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Normal.J);
            cy.get(block(7, 1)).should('have.attr', 'color', Color.Normal.J);

            // フィールド下の確認
            cy.get(sentBlock(2)).should('have.attr', 'color', Color.Gray.Field);
            cy.get(sentBlock(3)).should('have.attr', 'color', Color.Normal.S);
            cy.get(sentBlock(4)).should('have.attr', 'color', Color.Normal.J);
            cy.get(sentBlock(5)).should('have.attr', 'color', Color.Normal.T);
            cy.get(sentBlock(6)).should('have.attr', 'color', Color.Normal.Z);
            cy.get(sentBlock(7)).should('have.attr', 'color', Color.Normal.O);
            cy.get(sentBlock(8)).should('have.attr', 'color', Color.Normal.L);
            cy.get(sentBlock(9)).should('have.attr', 'color', Color.Normal.I);
        });

        // せり上がり・Highlightなし・ライン削除されないことの確認
        rightTap(() => {
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Gray.Field);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(4, 0)).should('have.attr', 'color', Color.Normal.J);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Normal.T);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Normal.Z);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Normal.O);
            cy.get(block(8, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(9, 0)).should('have.attr', 'color', Color.Normal.I);

            // フィールド下の確認
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((x) => {
                cy.get(sentBlock(x)).should('have.attr', 'color', Color.Empty.Field);
            });
        });

        // Highlightされることの確認
        rightTap(() => {
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Gray.Highlight);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Highlight.S);
            cy.get(block(4, 0)).should('have.attr', 'color', Color.Highlight.J);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Highlight.T);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Highlight.Z);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Highlight.O);
            cy.get(block(8, 0)).should('have.attr', 'color', Color.Highlight.L);
            cy.get(block(9, 0)).should('have.attr', 'color', Color.Highlight.I);
        });

        // ライン削除されることの確認
        rightTap(() => {
            // 残っている全てのブロック
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(5, 1)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Normal.J);
            cy.get(block(7, 1)).should('have.attr', 'color', Color.Normal.J);
        });
    });

    it('Sent line / Reverse', () => {
        const page = pages(23);

        visit('v115@vhMSwQaAFLDmClcJSAVDEHBEooRBMoAVBqHDMCzOBA?AWyBUoBTpBXmBJnBVhBpeQaAFLDmClcJSAVDEHBEooRBJoA?VBvHUxCqCBAAzdB0XBPTBOfB6WBlhA8AeH8AoFvhDliBtnB?elBFdFlhC8Q4g0wwAtQpglwhAAAvhDA4BAAeAAAAAA');

        {
            // ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));
        }

        // 後ろから順に辿る
        leftTap(23);

        // フィールド下の確認
        rightTap(13, () => {
            cy.get(sentBlock(1)).should('have.attr', 'color', Color.Empty.Field);
            [0, 2, 3, 4, 5, 6, 7, 8, 9].forEach((x) => {
                cy.get(sentBlock(x)).should('have.attr', 'color', Color.Gray.Field);
            });

            // フィールド左下
            cy.get(block(0, 0)).should('have.attr', 'color', Color.Normal.O);
            cy.get(block(0, 1)).should('have.attr', 'color', Color.Normal.O);
        });

        // せり上がり＆反転後の確認
        rightTap(() => {
            cy.get(block(8, 0)).should('have.attr', 'color', Color.Empty.Field);
            [0, 1, 2, 3, 4, 5, 6, 7, 9].forEach((x) => {
                cy.get(block(x, 0)).should('have.attr', 'color', Color.Gray.Field);
            });

            // フィールド右下
            cy.get(block(9, 1)).should('have.attr', 'color', Color.Normal.O);
            cy.get(block(9, 2)).should('have.attr', 'color', Color.Highlight.O);
        });

        // Tスピンx2後の確認
        rightTap(2, () => {
            // フィールド右下
            cy.get(block(9, 1)).should('have.attr', 'color', Color.Empty.Field);
            cy.get(block(9, 2)).should('have.attr', 'color', Color.Empty.Field);
        });

        // Tスピン後の確認・Hightlightなしの確認
        rightTap(2, () => {
            // 残っている全てのブロック
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(5, 1)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Normal.J);
            cy.get(block(7, 1)).should('have.attr', 'color', Color.Normal.J);

            // フィールド下の確認
            cy.get(sentBlock(2)).should('have.attr', 'color', Color.Gray.Field);
            cy.get(sentBlock(3)).should('have.attr', 'color', Color.Normal.S);
            cy.get(sentBlock(4)).should('have.attr', 'color', Color.Normal.J);
            cy.get(sentBlock(5)).should('have.attr', 'color', Color.Normal.T);
            cy.get(sentBlock(6)).should('have.attr', 'color', Color.Normal.Z);
            cy.get(sentBlock(7)).should('have.attr', 'color', Color.Normal.O);
            cy.get(sentBlock(8)).should('have.attr', 'color', Color.Normal.L);
            cy.get(sentBlock(9)).should('have.attr', 'color', Color.Normal.I);
        });

        // せり上がりしない・ライン削除されないことの確認
        rightTap(() => {
            // 残っている全てのブロック
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(5, 1)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Normal.J);
            cy.get(block(7, 1)).should('have.attr', 'color', Color.Normal.J);

            // フィールド下の確認
            cy.get(sentBlock(2)).should('have.attr', 'color', Color.Gray.Field);
            cy.get(sentBlock(3)).should('have.attr', 'color', Color.Normal.S);
            cy.get(sentBlock(4)).should('have.attr', 'color', Color.Normal.J);
            cy.get(sentBlock(5)).should('have.attr', 'color', Color.Normal.T);
            cy.get(sentBlock(6)).should('have.attr', 'color', Color.Normal.Z);
            cy.get(sentBlock(7)).should('have.attr', 'color', Color.Normal.O);
            cy.get(sentBlock(8)).should('have.attr', 'color', Color.Normal.L);
            cy.get(sentBlock(9)).should('have.attr', 'color', Color.Normal.I);
        });

        // せり上がり・Highlightなし・ライン削除されないことの確認
        rightTap(() => {
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Gray.Field);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(4, 0)).should('have.attr', 'color', Color.Normal.J);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Normal.T);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Normal.Z);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Normal.O);
            cy.get(block(8, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(9, 0)).should('have.attr', 'color', Color.Normal.I);

            // フィールド下の確認
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((x) => {
                cy.get(sentBlock(x)).should('have.attr', 'color', Color.Empty.Field);
            });
        });

        // Highlightされることの確認
        rightTap(() => {
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Gray.Highlight);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Highlight.S);
            cy.get(block(4, 0)).should('have.attr', 'color', Color.Highlight.J);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Highlight.T);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Highlight.Z);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Highlight.O);
            cy.get(block(8, 0)).should('have.attr', 'color', Color.Highlight.L);
            cy.get(block(9, 0)).should('have.attr', 'color', Color.Highlight.I);
        });

        // ライン削除されることの確認
        rightTap(() => {
            // 残っている全てのブロック
            cy.get(block(2, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(3, 0)).should('have.attr', 'color', Color.Normal.L);
            cy.get(block(5, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(5, 1)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(6, 0)).should('have.attr', 'color', Color.Normal.S);
            cy.get(block(7, 0)).should('have.attr', 'color', Color.Normal.J);
            cy.get(block(7, 1)).should('have.attr', 'color', Color.Normal.J);
        });
    });

    it('Sent line / v110', () => {
        const page = pages(23);

        visit('v110@7eMSWPaAFLDmClcJSAVDEHBEooRBMoAVBqHDMCzOBA?AWoBUeBTfBXcBJdBVXBpEPaAFLDmClcJSAVDEHBEooRBJoA?VBvHUxCqCBAAzTB0NBPJBOVB6MBxeA3gbH3A6SUAFLDmClc?JSAVDEHBEooRBUoAVB7eDlIPUAFLDmClcJSAVDEHBEooRBU?oAVBtdBebBF/ExeC3kzIwssQp0lYi8eAAAteEYsbAuB7eCA?gbAAAAAA');

        // 設定を開く
        {
            cy.get(datatest('btn-open-settings')).click();
        }

        // テト譜をコピー
        {
            cy.get(datatest('btn-copy-fumen')).click();
        }

        cy.wait(500);

        leftTap();

        // v110のデータを取り出す
        {
            cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@vhMSwQaAFLDmClcJSAVDEHBEooRBMoAVBqHDMCzOBA?AWyBUoBTpBXmBJnBVhBpeQaAFLDmClcJSAVDEHBEooRBJoA?VBvHUxCqCBAAzdB0XBPTBOfB6WBlhA8AeH8AoUUAFLDmClc?JSAVDEHBEooRBUoAVBvhDliQUAFLDmClcJSAVDEHBEooRBU?oAVBtnBelBFdFlhC8Q4g0wwAtQpglwhAAAhhQaMeA4BvhCA?AeAAAAAA');
        }
    });
});
