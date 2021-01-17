import { datatest } from './common';

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
        block: {
            open: ({ home = true } = {}) => {
                if (home) {
                    operations.mode.tools.home()
                }
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
            dragToUp: (x, { from, to }) => {
                let body = cy.get('body');
                body = body.trigger('mousedown', px(x), py(from));

                const maxCount = 10;
                const dy = (to - from) / maxCount;
                for (let count = 0; count <= maxCount; count++) {
                    body = body.trigger('mousemove', px(x), py(dy * count + from));
                }

                body.trigger('mouseup', px(x), py(to));
            },
        },
        fill: {
            open: ({ home = true } = {}) => {
                if (home) {
                    operations.mode.tools.home()
                    cy.get(datatest('btn-utils-mode')).click();
                }
                cy.get(datatest('btn-fill-mode')).click();
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
            dragToUp: (x, { from, to }) => {
                let body = cy.get('body');
                body = body.trigger('mousedown', px(x), py(from));

                const maxCount = 10;
                const dy = (to - from) / maxCount;
                for (let count = 0; count <= maxCount; count++) {
                    body = body.trigger('mousemove', px(x), py(dy * count + from));
                }

                body.trigger('mouseup', px(x), py(to));
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
            move: () => {
                cy.get(datatest('btn-move-piece')).click();
            },
            draw: () => {
                cy.get(datatest('btn-draw-piece')).click();
            },
            rotateToRight: () => {
                cy.get(datatest('btn-rotate-to-right')).click();
            },
            rotateToLeft: () => {
                cy.get(datatest('btn-rotate-to-left')).click();
            },
            moveToRight: () => {
                cy.get(datatest('btn-move-to-right')).click();
            },
            moveToRightEnd: () => {
                cy.get(datatest('btn-move-to-right-end')).click();
            },
            moveToLeft: () => {
                cy.get(datatest('btn-move-to-left')).click();
            },
            moveToLeftEnd: () => {
                cy.get(datatest('btn-move-to-left-end')).click();
            },
            harddrop: () => {
                cy.get(datatest('btn-harddrop')).click();
            },
            lockToOn: () => {
                cy.get(datatest('btn-lock-flag-off')).click();
            },
            lockToOff: () => {
                cy.get(datatest('btn-lock-flag-on')).click();
            },
            spawn: {
                T: () => {
                    cy.get(datatest('btn-piece-select-mode')).click();
                    cy.get(datatest('btn-piece-t')).click();
                },
                S: () => {
                    cy.get(datatest('btn-piece-select-mode')).click();
                    cy.get(datatest('btn-piece-s')).click();
                },
                Z: () => {
                    cy.get(datatest('btn-piece-select-mode')).click();
                    cy.get(datatest('btn-piece-z')).click();
                },
                O: () => {
                    cy.get(datatest('btn-piece-select-mode')).click();
                    cy.get(datatest('btn-piece-o')).click();
                },
                I: () => {
                    cy.get(datatest('btn-piece-select-mode')).click();
                    cy.get(datatest('btn-piece-i')).click();
                },
                L: () => {
                    cy.get(datatest('btn-piece-select-mode')).click();
                    cy.get(datatest('btn-piece-l')).click();
                },
                J: () => {
                    cy.get(datatest('btn-piece-select-mode')).click();
                    cy.get(datatest('btn-piece-j')).click();
                },
            },
        },
        tools: {
            open: () => {
                cy.get(datatest('btn-drawing-tool')).click();
            },
            duplicatePage: ({ home = true } = {}) => {
                if (home) {
                    operations.mode.tools.home()
                }
                cy.get(datatest('btn-duplicate-page')).click();
            },
            removePage: () => {
                cy.get(datatest('btn-remove-page')).click();
            },
            addNewPage: () => {
                cy.get(datatest('btn-insert-new-page')).click();
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
        slide: {
            open: ({ home = true } = {}) => {
                if (home) {
                    operations.mode.tools.home()
                    cy.get(datatest('btn-utils-mode')).click();
                }
                cy.get(datatest('btn-slide-mode')).click();
            },
            right: () => {
                cy.get(datatest('btn-slide-to-right')).click();
            },
            left: () => {
                cy.get(datatest('btn-slide-to-left')).click();
            },
            up: () => {
                cy.get(datatest('btn-slide-to-up')).click();
            },
            down: () => {
                cy.get(datatest('btn-slide-to-down')).click();
            },
        },
        fillRow: {
            open: ({ home = true } = {}) => {
                if (home) {
                    operations.mode.tools.home()
                    cy.get(datatest('btn-utils-mode')).click();
                }
                cy.get(datatest('btn-fill-row-mode')).click();
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
        append: () => {
            operations.menu.open();
            cy.get(datatest('btn-append-fumen')).click();
        },
        copyToClipboard: () => {
            operations.menu.open();
            cy.get(datatest('btn-copy-fumen')).click();
            cy.wait(150);
            cy.get(datatest('btn-raw-fumen')).click();
            cy.wait(10);

            {
                let body = cy.get('body');
                const from = 10;
                const to = 350;
                const y = 640;
                body = body.trigger('mousedown', from, y);

                const maxCount = 10;
                const dx = (to - from) / maxCount;
                for (let count = 0; count <= maxCount; count++) {
                    body = body.trigger('mousemove', dx * count + from, y);
                }

                body.trigger('mouseup', to, y);
            }

            cy.get(datatest('btn-clipboard-cancel')).click();
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
        clearToEnd: () => {
            operations.menu.open();
            cy.get(datatest('btn-clear-to-end')).click();
            cy.wait(100);
        },
        clearPast: () => {
            operations.menu.open();
            cy.get(datatest('btn-clear-past')).click();
            cy.wait(100);
        },
        pageSlider: () => {
            operations.menu.open();
            cy.get(datatest('btn-page-slider')).click();
        },
        ghostToggle: () => {
            operations.menu.open();
            cy.get(datatest('btn-ghost-toggle')).click();
        },
    },
};
