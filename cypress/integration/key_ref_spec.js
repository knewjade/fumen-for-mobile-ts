import {datatest, expectFumen, minoPosition, Piece, rightTap, Rotation, visit} from '../support/common';
import { operations } from '../support/operations';

describe('Key/Ref', () => {
    it('key/ref undo/redo', () => {
        visit({ mode: 'writable' });

        operations.mode.block.open();

        minoPosition(Piece.I, Rotation.Spawn)(1, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        // 次ページ
        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        // 戻るページ
        operations.mode.tools.backPage();
        operations.mode.tools.backPage();

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
        operations.mode.tools.nextPage();

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
        operations.mode.tools.nextPage();

        minoPosition(Piece.J, Rotation.Reverse)(2, 3).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.Z, Rotation.Spawn)(2, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.L, Rotation.Right)(0, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        operations.mode.tools.home();
        operations.mode.tools.toRef();

        // 戻るページ
        operations.mode.tools.backPage();
        operations.mode.tools.toRef();

        // 戻るページ
        operations.mode.tools.backPage();
        operations.mode.block.open();

        minoPosition(Piece.T, Rotation.Left)(9, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.Z, Rotation.Spawn)(7, 0).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        minoPosition(Piece.S, Rotation.Spawn)(8, 2).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        expectFumen('v115@9gh0hlDeR4g0RpglCeR4wwg0RpglBeBtxwzhCeBtww?JeAgH9gAPwSwhAtFeAPBeAtFeAPQaQpAtZeAAA+gRpHexhI?ehWZeAAA');

        // Undo
        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();

        expectFumen('v115@9gh0hlFeg0RpglFeg0RpglFezhPeAgH9gAPwSwhAtF?eAPBeAtFeAPQaQpAtZeAAA+gRpHexhIehWZeAAA');

        // Undo
        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();
        operations.mode.tools.undo();

        expectFumen('v115@9gh0hlFeg0RpglFeg0RpglFezhPeAgH9gAPwSwhAtF?eAPBeAtFeAPQaQpAtZeAAA9ggWxSgHFegWxSgHFehWhHZeA?AA');

        // Redo
        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();

        expectFumen('v115@9gh0hlFeg0RpglFeg0RpglFezhPeAgH9gAPwSwhAtF?eAPBeAtFeAPQaQpAtZeAAA+gRpHexhIehWZeAAA');

        // Redo
        operations.mode.tools.redo();
        operations.mode.tools.redo();
        operations.mode.tools.redo();

        expectFumen('v115@9gh0hlDeR4g0RpglCeR4wwg0RpglBeBtxwzhCeBtww?JeAgH9gAPwSwhAtFeAPBeAtFeAPQaQpAtZeAAA+gRpHexhI?ehWZeAAA');

        // 次ページ
        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();
        operations.mode.tools.nextPage();

        // 戻るページ
        operations.mode.tools.backPage();

        minoPosition(Piece.I, Rotation.Left)(4, 1).forEach(([x, y]) => {
            operations.mode.block.click(x, y);
        });

        expectFumen('v115@9gh0hlDeR4g0RpglCeR4wwg0RpglBeBtxwzhCeBtww?JeAgH9gAPwSwhAtFeAPBeAtFeAPQaQpAtZeAAA+gRpAewhF?exhAewhGehWwhIewhOeAAAvhAAAA');
    });
});
