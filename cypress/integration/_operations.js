import { datatest } from './_common';

// 中央少し下クリックを想定
const px = (x) => 30 + 25.5 * x;
const py = (y) => 575 - 25.5 * y;

export const operations = {
    screen: {
        writable: () => {
            cy.get(datatest('btn-open-settings')).click();
            cy.get(datatest('btn-writable')).click();
            cy.wait(500);
        },
        readonly: () => {
            cy.get(datatest('btn-open-settings')).click();
            cy.get(datatest('btn-readonly')).click();
            cy.wait(500);
        },
    },
    mode: {
        editor: {
            nextPage: () => {
                cy.get(datatest('btn-next-page')).click();
            },
            backPage: () => {
                cy.get(datatest('btn-back-page')).click();
            },
        },
        block: {
            open: () => {
                cy.get(datatest('btn-block-mode')).click();
            },
            Completion: () => {
                cy.get(datatest('btn-piece-inference')).click();
            },
            J: () => {
                cy.get(datatest('btn-piece-j')).click();
            },
            L: () => {
                cy.get(datatest('btn-piece-l')).click();
            },
            O: () => {
                cy.get(datatest('btn-piece-o')).click();
            },
            I: () => {
                cy.get(datatest('btn-piece-i')).click();
            },
            T: () => {
                cy.get(datatest('btn-piece-t')).click();
            },
            S: () => {
                cy.get(datatest('btn-piece-s')).click();
            },
            Z: () => {
                cy.get(datatest('btn-piece-z')).click();
            },
            Gray: () => {
                cy.get(datatest('btn-piece-gray')).click();
            },
            Empty: () => {
                cy.get(datatest('btn-piece-empty')).click();
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
        },
    },
    settings: {
        open: () => {
            cy.get(datatest('btn-open-settings')).click();
        },
        newPage: () => {
            operations.settings.open();
            cy.get(datatest('btn-new-fumen')).click();
        },
        copyToClipboard: () => {
            operations.settings.open();
            cy.get(datatest('btn-copy-fumen')).click();
            cy.wait(100);
        },
        firstPage: () => {
            operations.settings.open();
            cy.get(datatest('btn-first-page')).click();
            cy.wait(100);
        },
        lastPage: () => {
            operations.settings.open();
            cy.get(datatest('btn-last-page')).click();
            cy.wait(100);
        },
    },
};