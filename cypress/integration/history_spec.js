import { datatest, expectFumen, minoPosition, Piece, Rotation, visit } from './_common';
import { operations } from './_operations';

describe('History', () => {
    const play = (fumen, history) => {
        const testCases = [
            {
                fumen,
                callback: () => {
                    visit({ fumen });
                    operations.screen.writable();
                },
                count: 0,
            },
        ].concat(history);


        visit({});
        operations.screen.writable();

        // 通常の操作
        for (const testCase of testCases) {
            operations.mode.tools.home();
            testCase.callback();
            expectFumen(testCase.fumen);
        }

        cy.log('undo');

        // Undo
        for (const testCase of testCases.concat().reverse()) {
            expectFumen(testCase.fumen);
            const count = testCase.count !== undefined ? testCase.count : 1;
            for (let i = 0; i < count; i++) {
                operations.mode.tools.undo();
            }
        }

        cy.log('redo');

        // Redo
        for (const testCase of testCases) {
            const count = testCase.count !== undefined ? testCase.count : 1;
            for (let i = 0; i < count; i++) {
                operations.mode.tools.redo();
            }
            expectFumen(testCase.fumen);
        }
    };

    it('Piece / Next Page / Lock', () => {
        const testCases = [
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.I, Rotation.Spawn)(4, 0).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhARQJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.Z, Rotation.Spawn)(4, 1).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhBRQJUGJ',
                count: 2,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.L, Rotation.Right)(0, 1).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhCRQJUGJKJJ',
                count: 2,
            },
            {
                callback: () => {
                    operations.mode.editor.nextPage();
                },
                fumen: 'v115@vhDRQJUGJKJJAgH',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.editor.nextPage();
                },
                fumen: 'v115@vhERQJUGJKJJAgHAgH',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.O, Rotation.Spawn)(8, 0).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhERQJUGJKJJAgHTNJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.flags.open();
                    operations.mode.flags.lockToOff();
                },
                fumen: 'v115@vhERQJUGJKJJAgHTNn',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.editor.nextPage();
                },
                fumen: 'v115@vhFRQJUGJKJJAgHTNnTNn',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.flags.open();
                    operations.mode.flags.lockToOn();
                },
                fumen: 'v115@vhFRQJUGJKJJAgHTNnTNJ',
                count: 1,
            },
        ];

        play('v115@vhAAgH', testCases);
    });

    it('Remove', () => {
        const testCases = [
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.I, Rotation.Left)(9, 3).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@3gwwHeywwhGeR4whBtAeRpAeR4glwhg0BtRpAeilwh?i0JeO/IvhBp+I6WB',
                count: 2,
            },
            {
                callback: () => {
                    operations.menu.lastPage();
                    operations.mode.piece.open();
                    minoPosition(Piece.T, Rotation.Reverse)(2, 2).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@3gwwHeywwhGeR4whBtAeRpAeR4glwhg0BtRpAeilwh?i0JeO/IvhCp+I6WBFlB',
                count: 2,
            },
            {
                callback: () => {
                    operations.menu.firstPage();
                    operations.mode.editor.nextPage();
                    operations.mode.tools.removePage();
                },
                fumen: 'v115@3gwwHeywwhGeR4whBtAeRpAeR4glwhg0BtRpAeilwh?i0JeO/IygwhIewhIewhIewhde6WQAAvhAFlB',
                count: 1,
            },
            {
                callback: () => {
                    operations.menu.firstPage();
                    operations.mode.tools.removePage();
                },
                fumen: 'v115@ygwhh0BewwDewhg0BeywwhBewhg0CeR4whBtwhRpAe?R4glwhg0BtRpAeilwhi0Je62IvhAFlB',
                count: 1,
            },
            {
                callback: () => {
                    operations.menu.lastPage();
                    operations.mode.tools.removePage();
                },
                fumen: 'v115@ygwhh0BewwDewhg0BeywwhBewhg0CeR4whBtwhRpAe?R4glwhg0BtRpAeilwhi0Je62I',
                count: 1,
            },
        ];

        play('v115@3gwwHeywwhGeR4whBtAeRpAeR4glwhg0BtRpAeilwh?i0JeO/IvhA6WB', testCases);
    });

    it('Quiz', () => {
        const testCases = [
            {
                callback: () => {
                    cy.get(datatest('text-comment')).type('#Q=[](I)OJLSTZ');
                },
                fumen: 'v115@vhAAgWaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?A',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.O, Rotation.Spawn)(1, 0).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhAzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?A',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.J, Rotation.Right)(0, 1).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhBzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJ',
                count: 2,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.I, Rotation.Spawn)(1, 3).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhCzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/I',
                count: 2,
            },
            {
                callback: () => {
                    cy.get(datatest('text-comment')).clear().type('#Q=[](T)S');
                },
                fumen: 'v115@vhCzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.T, Rotation.Left)(9, 1).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhDzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA9NJ',
                count: 2,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.Z, Rotation.Spawn)(7, 0).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhEzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA9NJ0MJ',
                count: 2,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.S, Rotation.Spawn)(8, 2).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhFzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA9NJ0MJXD?J',
                count: 2,
            },
            {
                callback: () => {
                    operations.mode.editor.nextPage();
                },
                fumen: 'v115@vhGzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA9NJ0MJXD?JAgH',
                count: 1,
            },
            {
                callback: () => {
                    cy.get(datatest('text-comment')).clear().type('hello world');
                },
                fumen: 'v115@vhGzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA9NJ0MJXD?JAgWNAooMDEvoo2A3XaDEEBAAA',
                count: 1,
            },
            {
                callback: () => {
                    operations.menu.firstPage();
                    operations.mode.editor.nextPage();
                    cy.get(datatest('text-comment')).clear().type('こんにちは');
                },
                fumen: 'v115@vhGzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJYeAlvs2A1sDfEToABBlvs2AWDEfET4J6Alvs2AW5AAAx?/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA9NJ0MJXDJAgWN?AooMDEvoo2A3XaDEEBAAA',
                count: 1,
            },
        ];

        play('v115@vhAAgH', testCases);
    });
});
