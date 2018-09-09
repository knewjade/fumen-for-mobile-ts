import { datatest } from './_common';

// 中央少し下クリックを想定
const px = (x) => 35 + 24 * x;
const py = (y) => 540 - 24 * y;

export const operations = {
    screen: {
        writable: () => {
            cy.get(datatest('btn-open-menu')).click();
            cy.get(datatest('btn-writable')).click();
            cy.wait(500);
        },
        readonly: () => {
            cy.get(datatest('btn-open-menu')).click();
            cy.get(datatest('btn-readonly')).click();
            cy.wait(500);
        },
    },
    mode: {
        reader: {
            openPage: () => {
                cy.get(datatest('btn-open-fumen')).click();
            },
        },
        editor: {
            nextPage: () => {
                cy.get(datatest('btn-next-page')).click();
            },
            backPage: () => {
                cy.get(datatest('btn-back-page')).click();
            },
            toRef: () => {
                cy.get(datatest('btn-key-page-on')).click();
            },
            toKey: () => {
                cy.get(datatest('btn-key-page-off')).click();
            },
        },
        block: {
            open: () => {
                cy.get(datatest('btn-block-mode')).click();
            },
            Completion: () => {
                cy.get(datatest('btn-piece-inference')).click();
                cy.wait(100);
            },
            J: () => {
                cy.get(datatest('btn-piece-j')).click();
                cy.wait(100);
            },
            L: () => {
                cy.get(datatest('btn-piece-l')).click();
                cy.wait(100);
            },
            O: () => {
                cy.get(datatest('btn-piece-o')).click();
                cy.wait(100);
            },
            I: () => {
                cy.get(datatest('btn-piece-i')).click();
                cy.wait(100);
            },
            T: () => {
                cy.get(datatest('btn-piece-t')).click();
                cy.wait(100);
            },
            S: () => {
                cy.get(datatest('btn-piece-s')).click();
                cy.wait(100);
            },
            Z: () => {
                cy.get(datatest('btn-piece-z')).click();
                cy.wait(100);
            },
            Gray: () => {
                cy.get(datatest('btn-piece-gray')).click();
                cy.wait(100);
            },
            Empty: () => {
                cy.get(datatest('btn-piece-empty')).click();
                cy.wait(100);
            },
            click: (x, y) => {
                cy.get('body').click(px(x), py(y));
            },
            dragToRight: ({ from, to }, y) => {
                let body = cy.get('body');
                body = body.trigger('mousedown', px(from), py(y));

                const maxCount = 10;
                const dx = (to - from) / maxCount;
                for (let count = 0; count <= maxCount; count++) {
                    body = body.trigger('mousemove', px(dx * count + from), py(y));
                }

                body.trigger('mouseup', px(to), py(y));
            },
        },
        flags: {
            open: () => {
                cy.get(datatest('btn-flags-mode')).click();
            },
            lockToOn: () => {
                cy.get(datatest('btn-lock-flag-off')).click();
            },
            lockToOff: () => {
                cy.get(datatest('btn-lock-flag-on')).click();
            },
            riseToOn: () => {
                cy.get(datatest('btn-rise-flag-off')).click();
            },
            riseToOff: () => {
                cy.get(datatest('btn-rise-flag-on')).click();
            },
            mirrorToOn: () => {
                cy.get(datatest('btn-mirror-flag-off')).click();
            },
            mirrorToOff: () => {
                cy.get(datatest('btn-mirror-flag-on')).click();
            },
        },
        piece: {
            open: () => {
                cy.get(datatest('btn-piece-mode')).click();
            },
            resetPiece: () => {
                cy.get(datatest('btn-reset-piece')).click();
            },
            moveOn: () => {
                cy.get(datatest('btn-move-piece-off')).click();
            },
            drawOn: () => {
                cy.get(datatest('btn-draw-piece-off')).click();
            },
            rotateToRight: () => {
                cy.get(datatest('btn-rotate-to-right')).click();
            },
            rotateToLeft: () => {
                cy.get(datatest('btn-rotate-to-left')).click();
            },
            harddrop: () => {
                cy.get(datatest('btn-harddrop')).click();
            },
        },
        tools: {
            open: () => {
                cy.get(datatest('btn-drawing-tool')).click();
            },
            removePage: () => {
                cy.get(datatest('btn-remove-page')).click();
            },
            undo: () => {
                cy.get(datatest('btn-undo')).click();
            },
            redo: () => {
                cy.get(datatest('btn-redo')).click();
            },
            home: () => {
                cy.get(datatest('btn-drawing-tool')).click();
            },
        },
    },
    menu: {
        open: () => {
            cy.get(datatest('btn-open-menu')).click();
        },
        newPage: () => {
            operations.menu.open();
            cy.get(datatest('btn-new-fumen')).click();
        },
        copyToClipboard: () => {
            operations.menu.open();
            cy.get(datatest('btn-copy-fumen')).click();
            cy.wait(100);
        },
        firstPage: () => {
            operations.menu.open();
            cy.get(datatest('btn-first-page')).click();
            cy.wait(100);
        },
        lastPage: () => {
            operations.menu.open();
            cy.get(datatest('btn-last-page')).click();
            cy.wait(100);
        },
        commentReadonly: () => {
            operations.menu.open();
            cy.get(datatest('btn-comment-readonly')).click();
            cy.wait(100);
        },
        commentWritable: () => {
            operations.menu.open();
            cy.get(datatest('btn-comment-writable')).click();
            cy.wait(100);
        },
    },
};