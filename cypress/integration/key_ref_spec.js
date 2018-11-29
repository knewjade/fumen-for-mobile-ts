import { datatest, minoPosition, Piece, rightTap, Rotation, visit } from '../support/common';
import { operations } from '../support/operations';

describe('Key/Ref', () => {
    it('key/ref undo/redo', () => {
        visit({ mode: 'writable' });

        operations.mode.block.open();

        minoPosition(Piece.I, Rotation.Spawn)(1, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 次ページ
        operations.mode.editor.nextPage();
        operations.mode.editor.nextPage();

        // 戻るページ
        operations.mode.editor.backPage();
        operations.mode.editor.backPage();

        minoPosition(Piece.O, Rotation.Spawn)(1, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.J, Rotation.Right)(0, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.L, Rotation.Left)(3, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 次ページ
        operations.mode.editor.nextPage();

        minoPosition(Piece.O, Rotation.Spawn)(1, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.J, Rotation.Left)(3, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.L, Rotation.Right)(0, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 次ページ
        operations.mode.editor.nextPage();

        minoPosition(Piece.J, Rotation.Reverse)(2, 3).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.Z, Rotation.Spawn)(2, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.L, Rotation.Right)(0, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        operations.mode.editor.toRef();

        // 戻るページ
        operations.mode.editor.backPage();
        operations.mode.editor.toRef();

        // 戻るページ
        operations.mode.editor.backPage();

        minoPosition(Piece.T, Rotation.Left)(9, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.Z, Rotation.Spawn)(7, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.S, Rotation.Spawn)(8, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // データを確認
        operations.menu.copyToClipboard();
        cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@9gh0hlDeR4g0RpglCeR4wwg0RpglBeBtxwzhCeBtww?JeAgH9gAPwSwhAtFeAPBeAtFeAPQaQpAtZeAgH+gRpHexhI?ehWZeAgH');
        rightTap();

        // Undo
        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();

        // データを確認
        operations.menu.copyToClipboard();
        cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@9gh0hlFeg0RpglFeg0RpglFezhPeAgH9gAPwSwhAtF?eAPBeAtFeAPQaQpAtZeAgH+gRpHexhIehWZeAgH');
        rightTap();

        // Undo
        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();

        // データを確認
        operations.menu.copyToClipboard();
        cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@9gh0hlFeg0RpglFeg0RpglFezhPeAgH9gAPwSwhAtF?eAPBeAtFeAPQaQpAtZeAgH9ggWxSgHFegWxSgHFehWhHZeA?gH');
        rightTap();

        // Redo
        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();

        // データを確認
        operations.menu.copyToClipboard();
        cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@9gh0hlFeg0RpglFeg0RpglFezhPeAgH9gAPwSwhAtF?eAPBeAtFeAPQaQpAtZeAgH+gRpHexhIehWZeAgH');
        rightTap();

        // Redo
        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();

        // データを確認
        operations.menu.copyToClipboard();
        cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@9gh0hlDeR4g0RpglCeR4wwg0RpglBeBtxwzhCeBtww?JeAgH9gAPwSwhAtFeAPBeAtFeAPQaQpAtZeAgH+gRpHexhI?ehWZeAgH');
        rightTap();

        // 次ページ
        operations.mode.editor.nextPage();
        operations.mode.editor.nextPage();
        operations.mode.editor.nextPage();

        // 戻るページ
        operations.mode.editor.backPage();

        minoPosition(Piece.I, Rotation.Left)(4, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // データを確認
        operations.menu.copyToClipboard();
        cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', 'v115@9gh0hlDeR4g0RpglCeR4wwg0RpglBeBtxwzhCeBtww?JeAgH9gAPwSwhAtFeAPBeAtFeAPQaQpAtZeAgH+gRpAewhF?exhAewhGehWwhIewhOeAgHvhAAgH');
        rightTap();
    });
});
