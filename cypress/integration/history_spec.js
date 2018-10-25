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
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.L, Rotation.Right)(0, 1).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhCRQJUGJKJJ',
                count: 1,
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
                count: 1,
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
                count: 1,
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
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.I, Rotation.Spawn)(1, 3).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhCzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/I',
                count: 1,
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
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.Z, Rotation.Spawn)(7, 0).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhEzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA9NJ0MJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.S, Rotation.Spawn)(8, 2).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhFzJYaAFLDmClcJSAVDEHBEooRBJoAVBv/rtC0XBA?AOJJx/XVAFLDmClcJSAVDEHBEooRBUoAVBzAAAA9NJ0MJXD?J',
                count: 1,
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

    it('Shift', () => {
        const testCases = [
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.I, Rotation.Spawn)(4, 0).forEach((block) => {
                        operations.mode.block.click(block[0], block[1]);
                    });
                },
                fumen: 'v115@hlFexhhlFexh9gRpFeBtRpFeBtg0HewwRQJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.shift.open();
                    operations.mode.shift.right();
                },
                fumen: 'v115@AehlFewhAehlFewh+gRpFeAtAeRpFeAtg0HewwxQJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.shift.open();
                    operations.mode.shift.up();
                },
                fumen: 'v115@AehlFewh+gRpFeAtAeRpFeAtJeg0HewwxLJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.shift.open();
                    operations.mode.shift.left();
                    operations.mode.shift.left();
                },
                fumen: 'v115@glFewh/gQpFeAtBeQpFeAtLeg0HewwxKJ',
                count: 2,
            },
            {
                callback: () => {
                    operations.mode.shift.open();
                    operations.mode.shift.down();
                    operations.mode.shift.down();
                },
                fumen: 'v115@TeglFewh/gQpFeAtBeg0HewwAgH',
                count: 2,
            },
        ];

        play('v115@hlFexhhlFexh9gRpFeBtRpFeBtg0HewwAgH', testCases);
    });

    it('Fill row', () => {
        const testCases = [
            {
                callback: () => {
                    operations.mode.fillRow.open();
                    operations.mode.block.click(0, 0);
                },
                fumen: 'v115@chI8JeAgH',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.fillRow.open();
                    operations.mode.fillRow.I();
                    operations.mode.block.dragToUp(1, { from: 1, to: 4 });
                },
                fumen: 'v115@zgwhAe4hAe4hAe4hAe3hAeI8JeAgH',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.fillRow.open();
                    operations.mode.fillRow.S();
                    operations.mode.block.dragToRight({ from: 5, to: 8 }, 0);
                },
                fumen: 'v115@zgwhAe4hAe4hAe4hAe3hX4AeQ4JeAgH',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.fillRow.open();
                    operations.mode.fillRow.T();
                    operations.mode.block.dragToRight({ from: 1, to: 4 }, -1);
                },
                fumen: 'v115@zgwhAe4hAe4hAe4hAe3hX4AeQ4zwAe0wAgH',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.fillRow.open();
                    operations.mode.fillRow.Empty();
                    operations.mode.block.dragToUp(9, { from: -1, to: 10 });
                },
                fumen: 'v115@vhAAgH',
                count: 1,
            },
        ];

        play('v115@vhAAgH', testCases);
    });

    it('Clear', () => {
        const testCases = [
            {
                callback: () => {
                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();
                    operations.menu.clearPast();
                },
                fumen: 'v115@HhglBeBtEeglCeBtDehlAezhMeWSYFAooMDEPBAAAv?hBToQFA3XaDEEBAAAPnB',
                count: 1,
            },
            {
                callback: () => {
                    operations.menu.clearToEnd();
                },
                fumen: 'v115@HhglBeBtEeglCeBtDehlAezhMeWSYFAooMDEPBAAA',
                count: 1,
            },
            {
                callback: () => {
                    operations.menu.firstPage();
                    cy.get(datatest('text-comment')).clear().type('#Q=[](O)TS');
                },
                fumen: 'v115@HhglBeBtEeglCeBtDehlAezhMeWSYWAFLDmClcJSAV?DEHBEooRBPoAVBUNBAA',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.O, Rotation.Spawn)(8, 1).forEach((block) => {
                        operations.mode.block.click(block[0], block[1]);
                    });
                },
                fumen: 'v115@HhglBeBtEeglCeBtDehlAezhMeWSYWAFLDmClcJSAV?DEHBEooRBPoAVBUNBAAvhATIJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.T, Rotation.Reverse)(2, 1).forEach((block) => {
                        operations.mode.block.click(block[0], block[1]);
                    });
                },
                fumen: 'v115@HhglBeBtEeglCeBtDehlAezhMeWSYWAFLDmClcJSAV?DEHBEooRBPoAVBUNBAAvhBTIJFKJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.piece.open();
                    minoPosition(Piece.S, Rotation.Right)(5, 1).forEach((block) => {
                        operations.mode.block.click(block[0], block[1]);
                    });
                },
                fumen: 'v115@HhglBeBtEeglCeBtDehlAezhMeWSYWAFLDmClcJSAV?DEHBEooRBPoAVBUNBAAvhCTIJFKJPMJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.editor.backPage();
                    operations.menu.clearToEnd();
                },
                fumen: 'v115@HhglBeBtEeglCeBtDehlAezhMeWSYWAFLDmClcJSAV?DEHBEooRBPoAVBUNBAAvhBTIJFKJ',
                count: 1,
            },
            {
                callback: () => {
                    operations.menu.clearPast();
                },
                fumen: 'v115@HhglBeBtCeRpglCeBtAeg0RphlAezhi0JeFKYVAFLD?mClcJSAVDEHBEooRBUoAVBzAAAA',
                count: 1,
            },
        ];

        play('v115@vhFRQYFAooMDEPBAAAKpBUmBWyBToQFA3XaDEEBAAA?PnB', testCases);
    });

    it('Append', () => {
        const testCases = [
            {
                callback: () => {
                    operations.menu.append();

                    cy.get(datatest('mdl-append-fumen')).should('visible')
                        .within(() => {
                            cy.get(datatest('input-fumen')).clear().type('v115@vhExOYZAFLDmClcJSAVjiSAVG88A4N88A5N1LCpAAA?AxpBTrBxxBxxB');
                            cy.get(datatest('btn-append-to-end')).click();
                        });

                    cy.wait(500);
                },
                fumen: 'v115@vhJ2OYYAFLDmClcJSAVzbSAVG88AYP88A5tSgCRqBT?sBTtBSwBxOYZAFLDmClcJSAVjiSAVG88A4N88A5N1LCpAAA?AxpBTrBxxBxxB',
                count: 1,
            },
            {
                callback: () => {
                    operations.menu.firstPage();
                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();

                    operations.menu.append();

                    cy.get(datatest('mdl-append-fumen')).should('visible')
                        .within(() => {
                            cy.get(datatest('input-fumen')).clear().type('v115@bhI8KeAgWFAooMDEPBAAARhI8UeAAAHhI8eeAAA');
                            cy.get(datatest('btn-append-to-next')).click();
                        });

                    cy.wait(500);
                },
                fumen: 'v115@vhC2OYYAFLDmClcJSAVzbSAVG88AYP88A5tSgCRqBT?sBRhgHTaAexSBeilC8xwA8KeAgWFAooMDEPBAAARhI8UeAA?AHhI8eeAAAHhIAAegWzDAARLAAAeiWCARLAAKeTNYVAFLDm?ClcJSAVzbSAVG88A4W88AZAAAAvhFSwBxOYZAFLDmClcJSA?VjiSAVG88A4N88A5N1LCpAAAAxpBTrBxxBxxB',
                count: 1,
            },
            {
                callback: () => {
                    operations.menu.firstPage();
                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();

                    operations.menu.append();

                    cy.get(datatest('mdl-append-fumen')).should('visible')
                        .within(() => {
                            cy.get(datatest('input-fumen')).clear().type('v115@zgwhIewhIewhIewhIewhSeAgH0gwhIewhIewhIewhI?ewhReAAA1gwhIewhIewhIewhIewhQeAAA');
                            cy.get(datatest('btn-append-to-next')).click();
                        });

                    cy.wait(500);
                },
                fumen: 'v115@vhC2OYYAFLDmClcJSAVzbSAVG88AYP88A5tSgCRqBT?sBRhgHTaAexSBeilC8xwA8KeAgWFAooMDEPBAAARhI8UeAA?AzgwhIewhIewhIewDHAAewDHAKeAgWAA0gwhIewhIewhIew?hIewhReAAA1gwhIewhIewhIewhIewhQeAAAzgSaGeSaGeS4?F8AeS4F8AeS4F8KeAgWFAooMDEPBAAAHhIAAegWzDAARLAA?AeiWCARLAAKeTNYVAFLDmClcJSAVzbSAVG88A4W88AZAAAA?vhFSwBxOYZAFLDmClcJSAVjiSAVG88A4N88A5N1LCpAAAAx?pBTrBxxBxxB',
                count: 1,
            },
        ];

        play('v115@vhE2OYYAFLDmClcJSAVzbSAVG88AYP88A5tSgCRqBT?sBTtBSwB', testCases);
    });

    it('Comment', () => {
        const testCases = [
            {
                callback: () => {
                    cy.get(datatest('text-comment')).clear().type('test1');

                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();

                    cy.get(datatest('text-comment')).clear().type('test2');

                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();
                    operations.mode.editor.nextPage();

                    cy.get(datatest('text-comment')).clear().type('test3');
                },
                fumen: 'v115@vhGAgWFA0YceERAAAAAgHAgWFA0YceESAAAAAgHAgH?AgHAgWFA0YceETAAAA',
                count: 9,
            },
            {
                callback: () => {
                    operations.mode.editor.backPage();
                    operations.mode.editor.backPage();
                    operations.mode.editor.backPage();
                    operations.mode.editor.backPage();

                    cy.get(datatest('text-comment')).clear().type('test1');

                    operations.mode.editor.backPage();

                    cy.get(datatest('text-comment')).clear().type('hello');
                },
                fumen: 'v115@vhGAgWFA0YceERAAAAAgWFAooMDEPBAAAAgHAgHAgH?AgHAgWFA0YceETAAAA',
                count: 2,
            },
            {
                callback: () => {
                    operations.mode.piece.open();

                    operations.mode.editor.nextPage();

                    cy.get(datatest('text-comment')).clear().type('#Q=[](O)LTS');

                    minoPosition(Piece.O, Rotation.Spawn)(0, 0).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });

                    operations.mode.editor.nextPage();

                    minoPosition(Piece.T, Rotation.Left)(9, 1).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });

                    operations.mode.editor.nextPage();

                    minoPosition(Piece.S, Rotation.Spawn)(8, 2).forEach(([x, y]) => {
                        operations.mode.block.click(x, y);
                    });
                },
                fumen: 'v115@vhCAgWFA0YceERAAAAAgWFAooMDEPBAAATJYXAFLDm?ClcJSAVDEHBEooRBPoAVBs+zBARhxSHexSRe9NJQhQLHeRL?IeQLJeXDJFhxDGexDeeAgHvhAAgWFA0YceETAAAA',
                count: 4,
            },
            {
                callback: () => {
                    cy.get(datatest('text-comment')).clear().type('#Q=[](I)SZO');
                },
                fumen: 'v115@vhCAgWFA0YceERAAAAAgWFAooMDEPBAAATJYXAFLDm?ClcJSAVDEHBEooRBPoAVBs+zBARhxSHexSRe9NJQhQLHeRL?IeQLJeXDYXAFLDmClcJSAVDEHBEooRBJoAVBzHrBAFhxDGe?xDeeAgHvhAAgWFA0YceETAAAA',
                count: 1,
            },
            {
                callback: () => {
                    cy.get(datatest('text-comment')).clear().type('#Q=[L](S)');
                },
                fumen: 'v115@vhCAgWFA0YceERAAAAAgWFAooMDEPBAAATJYXAFLDm?ClcJSAVDEHBEooRBPoAVBs+zBARhxSHexSRe9NJQhQLHeRL?IeQLJeXDJFhxDGexDeeAgHvhAAgWFA0YceETAAAA',
                count: 1,
            },
            {
                callback: () => {
                    operations.mode.editor.backPage();

                    cy.get(datatest('text-comment')).clear().type('world');
                },
                fumen: 'v115@vhCAgWFA0YceERAAAAAgWFAooMDEPBAAATJYXAFLDm?ClcJSAVDEHBEooRBPoAVBs+zBARhxSHexSRe9NYFA3XaDEE?BAAAQhQLHeRLIeQLJeXDJFhxDGexDeeAgHvhAAgWFA0YceE?TAAAA',
                count: 1,
            },
        ];

        play('v115@vhAAgH', testCases);
    });
});
