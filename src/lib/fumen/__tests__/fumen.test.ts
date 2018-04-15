import { decode, extract, Page } from '../fumen';
import { Field, FieldLine } from '../field';
import { Operation, Piece, Rotation } from '../../enums';
import { FumenError } from '../../errors';

describe('fumen', () => {
    describe('decode', () => {
        test('empty', async () => {
            const pages: Page[] = [];
            await decode('vhAAgH', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                index: 0,
                lastPage: true,
                piece: undefined,
                comment: {
                    text: '',
                },
                quiz: undefined,
                flags: {
                    send: false,
                    mirrored: false,
                    colorize: true,
                },
                field: new Field({}),
                sentLine: new FieldLine({}),
            } as Page);
        });

        test('last page', async () => {
            const pages: Page[] = [];
            await decode('vhBAgHAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                index: 0,
                lastPage: false,
            });

            expect(pages[1]).toMatchObject({
                index: 1,
                lastPage: true,
            } as Page);
        });

        test('mirror', async () => {
            const pages: Page[] = [];
            await decode('RhA8IeB8HeC8GeAQLvhAAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                flags: {
                    mirrored: true,
                },
                field: Field.load(
                    '',
                    'X_________',
                    'XX________',
                ),
                sentLine: FieldLine.load('XXX_______'),
            } as Page);

            expect(pages[1]).toMatchObject({
                flags: {
                    mirrored: false,
                },
                field: Field.load(
                    '',
                    '_________X',
                    '________XX',
                ),
                sentLine: FieldLine.load('XXX_______'),
            } as Page);
        });

        test('send', async () => {
            const pages: Page[] = [];
            await decode('RhA8IeB8HeC8GeAYJvhAAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                flags: {
                    send: true,
                },
                field: Field.load(
                    '',
                    'X_________',
                    'XX________',
                ),
                sentLine: FieldLine.load('XXX_______'),
            } as Page);

            expect(pages[1]).toMatchObject({
                flags: {
                    send: false,
                },
                field: Field.load(
                    '',
                    'X_________',
                    'XX________',
                    'XXX_______',
                ),
                sentLine: new FieldLine({}),
            } as Page);
        });

        test('I-Spawn', async () => {
            const pages: Page[] = [];
            await decode('vhARQJ', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                index: 0,
                lastPage: true,
                piece: {
                    lock: true,
                    type: Piece.I,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 4,
                        y: 0,
                    },
                },
                comment: {
                    text: '',
                },
                quiz: undefined,
                flags: {
                    send: false,
                    mirrored: false,
                    colorize: true,
                },
                field: new Field({}),
                sentLine: new FieldLine({}),
            } as Page);
        });

        test('Comment', async () => {
            const pages: Page[] = [];
            await decode('vhDAgWFAooMDEPBAAAAAPFA3XaDEEBAAAAAAAAPDAFrmAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(4);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: 'hello',
                },
            } as Page);

            expect(pages[1]).toMatchObject({
                comment: {
                    text: 'world',
                },
            } as Page);

            expect(pages[2]).toMatchObject({
                comment: {
                    ref: 1,
                },
            } as Page);

            expect(pages[3]).toMatchObject({
                comment: {
                    text: '!',
                },
            } as Page);
        });

        test('Quiz', async () => {
            const pages: Page[] = [];
            await decode('vhGSSYXAFLDmClcJSAVDEHBEooRBMoAVBUtfBAXsBAAANrBmnBAAAAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(7);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: '#Q=[](L)TSJ',
                },
                piece: {
                    lock: true,
                    type: Piece.L,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 8,
                        y: 0,
                    },
                },
                quiz: {
                    operation: Operation.Direct,
                },
            } as Page);

            expect(pages[1]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
                    lock: true,
                    type: Piece.S,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 6,
                        y: 0,
                    },
                },
                quiz: {
                    operation: Operation.Stock,
                },
            } as Page);

            expect(pages[2]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: undefined,
                quiz: {
                    operation: undefined,
                },
            } as Page);

            expect(pages[3]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
                    lock: true,
                    type: Piece.T,
                    rotation: Rotation.Right,
                    coordinate: {
                        x: 4,
                        y: 1,
                    },
                },
                quiz: {
                    operation: Operation.Swap,
                },
            } as Page);

            expect(pages[4]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
                    lock: true,
                    type: Piece.J,
                    rotation: Rotation.Reverse,
                    coordinate: {
                        x: 7,
                        y: 2,
                    },
                },
                quiz: {
                    operation: Operation.Swap,
                },
            } as Page);

            expect(pages[5]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: undefined,
                quiz: {
                    operation: undefined,
                },
            } as Page);

            expect(pages[6]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: undefined,
                quiz: {
                    operation: undefined,
                },
            } as Page);
        });

        test('Lock after quiz', async () => {
            const pages: Page[] = [];
            await decode('vhCWSYVAFLDmClcJSAVDEHBEooRBKoAVB6AAAAUoBT?pB', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(3);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: '#Q=[](J)Z',
                },
                piece: {
                    lock: true,
                    type: Piece.J,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 8,
                        y: 0,
                    },
                },
                quiz: {
                    operation: Operation.Direct,
                },
            } as Page);

            expect(pages[1]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
                    lock: true,
                    type: Piece.Z,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 8,
                        y: 1,
                    },
                },
                quiz: {
                    operation: Operation.Direct,
                },
            } as Page);

            expect(pages[2]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
                    lock: true,
                    type: Piece.O,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 0,
                        y: 0,
                    },
                },
                quiz: {
                    operation: undefined,
                },
            } as Page);
        });
    });

    test('illegal short fumen', async () => {
        // right: vhAyOJ
        try {
            await decode('vhAyO', () => {
            });
            fail();
        } catch (e) {
            expect(e).toBeInstanceOf(FumenError);
        }
    });

    test('long data', async () => {
        const data = 'vh/xOY7cFLDmClcJSAVDEHBEooRBJoAVBzuHgCsn9VCq+ytCan/wCauTWCqSFgC0HUWCKtrgCpOmFDzyCMCKdFgCsXmPCJH' +
            'UPCaNmFDPe/VCUNstCPezPCUeLuCKHWWC6/VWCPdFgC6OUPCTejxCpintCvSFgCKNmFDzeFgCsfjWCzXmPCP+lPCJ9KWCaujFDMn/wCp' +
            'irgCKNWxCsnltCvPNFDKHWWCzOstCpfrgC0PltC6ySgC6vLMCs+CMCz3/VCUXNFD0intCvXExCKd9wCvPltC6izPCv+LMCMubgC6/VWC' +
            'UNUFDpvSgCadNPC0yTxCqnFgCMezPC0yytCa+rtCUn3LCsXegCKdNFDMt/wCvXExCJ3jPCz3/wCvSNFDp/9tCvCmPCauTWCvnNPCv+TW' +
            'CT+dgCqXExCs33LCPNmFDM3jPCJ3jFDqCOMCM3jFD0PNFDU9CMCsvaFD0i3LCTubgCqXWWCauytCsuPPCMNegCa+dgCpfjWCTujPCs+' +
            'aFDPNmPCa+DWC6+jPCJ3aPCpX+tCMnzPCUuTWCpfrgC0yTxCzPNFDvybgC6i/wCpvTxCP+TFDMtrgCp/NMCv+jFDqi3LCsXegCTn/VC' +
            'T+lFDMeHgCzujWCpHcgC0/NMCz3/VCvXWWCvvLMCan/wCMujFDzeFgCqyjPCpurgCM9KxC6P9VC0frgCMdFgC0SltC6fjxCMn3LCzSN' +
            'FDzuHgCKX9wCMtLuC6e9VCvf3LCsHUxCvXMgCKd9wCPt/wCpXstCqX8LCv+TWCvnNPC0vCMCs+jFDpuHgCaN8LCa3TxCsvTxCs3HgCp' +
            'SNFDKH+tCp3ntCUHExCadFgCqyjFDvSNPC0XegCJNUPCvuPFDzSltCaHmPCM+VWCPtbMCK9KWC0fbMCUd9VCvfzPCpHLxCMt/VCUdFg' +
            'Can/VCa+9tCzXUPCP+lPCPNWWCaONFDU3jPCsu/VCJ9aFD6vLMCs+ytC0fbMCMn/VCz+aFDpvaFDJNWWCv3/VCUujFDPe/wCM9KxCKd' +
            'NFDsXMgCK+9tCzeFgCsfzPCM9CMC03LuCseFgCq3/wCPuTWCzu/VCaXltCvXExCK+LgCp/9tC6uHgCpHUWCvOstCKebMCTHmPCsXstC' +
            'JnzPC0/dgCpyjFDKuaFDMNmFDUdNPCMXltCsuzPCv+bgCpfjWCM9aFDqeNPCaHExCJ9jFDvCOMCKX9VCKtjxC03HgCT+TFD0intCJHM' +
            'gCKtjxCp/NMCPNUFDJtjWCUnPFD0SNPCP9KWC0HkPCp+aFDMt3LCpXmPCzyKWCKNegCaejxCMuytCK+rtCUnzPCpvKxCMtjxCvi3LCz' +
            'X8LCzXegCqvytCUejWCMNmFDPentCs/NMCa3aFD0P9VCTnLuCqCOMC6OstCJnPFDqybgCU+dgC6vLMCsiLuCKX9wCM3TxCae3LCzXWW' +
            'CKHOMCPtjWCKePFDMNegC0vCMCMtLuCvfjxCM+TPCvubMCzHLxCKd9VCMdNFDq+KWCqHDMCzeNFDvyTxCq3ntCMX9wCvHUWCUe/wCan' +
            '3LCzC8LCvHkPCUnbMC0intCPNmFDp/rtC0P9VCv3bMC0ybgCKNMgCpuPFDM+9tCqHLxCv/rtCae/wCPdNFDMeHgCzijxCpyKxCKtjxC' +
            'a9KWCKuLMCs/dgCaujFDUn/VCaXltCqC+tCK+VWCvnNPCviLuC0X8LCz/dgCqXegCT+TFDTHOMCsf3LCM3jFD0fbMC0ybgCpHcgC0in' +
            'tCqSFgC6eNFDq+ytCsvTWCUergCqXWWCTuCMCaNmPCMn/wCJHUFDz/dgCT+TFDzyCMCqXWxCvSNPCzXWWCKuytCaHExCzfbMCPNExCa' +
            'e3LCaHUPCUdNPCU9aFDsHMMCsuHgCMe/wCa3TxCvHUWCKO9VCK9aFDUHmFDMujPCsvjFDp+aPCM+dgCz3jWCKubgC0O8LCvfLuCqHcg' +
            'CU+7LCzvaFDsuLuCP+VWCqCmPCPujFD6vTWCUuaFDM3jPCp+TWCK+lFDPtjWCpvKxCqOstCpHbFDJtHgC0C8LCa3TxCq+jPC6yCMCJH' +
            'stC0fjWCJ3jPC6eNPCMNegC6/VWCTergCzvKxCMeLuCvizPCp+KWCzfbMCUuTxCqHLWCJ3jFDsuntCpCmPCvX+tCJHUPC6eFgCsvjFD' +
            'v33LCs+LMCv/lFDzyCMCs3ntC0CegCpvjFDJNWWCv3/VCJtPFDvOUPCU9CMC6OUPCaXltCznNPCs+ytCpHLxCqyytCpijxCK9aPC6e9' +
            'VCvPltCsubMCUHUPCa9TWCv3/wCpvaFDp+TWCsXmPCPd9wCKdFgCsXMgCqndBAXsB+tBFiB6eBMrBxpBykBzgBWcBTaBPWBUSBdoBGc' +
            'BlsB8sBZkBPlB6oBuiBShBTVBTLBNbBMXB/RBpUBeUBfNB0IByGBT8A9FBlJB0HBfDB5JByBBpDBT3Am4AJnBTDBKBBMZBXPBFOB+MB' +
            'zGBSUBJnBMXBXeB2VBFdBzdBpZB0VB6bBOXB3MBKLBXHBvh/lBBJPBT3AWOBMDBpFBFYB/MBuYBMKBTJBK8AU9AFIB+IBqJBTFB/8AJ' +
            'nBzWBNRBUNBSUBlGBXKBJnBGcB8YBxWB6UB+MBNNBTQByLB3BBTFBZ3AGDBVTBcJBXEBXDBNCBTFBSAB58AWIBMABf+A6+AM8ANyAzu' +
            'AJ4Au/A9oAZ/AuOBPTBiMBzOBpPBPTBURBvh/MUBTTBWMBKCBZLBFSBMUBTGBuTB3SBK8A9CBFNBSPBJnBXZBTcB8TBpKBUSBGNBzQB' +
            'tJByLB3BBWIBi8AX5AJnBmXBMZBFdBzdB2fBpUBPdBsVBlbBzdBqbBTXBcaBXUBOQBCPBRSBTFBRNB/CBdRB2QBMNBFTBCUBzMBJnBU' +
            'eBibBGZB/kB9aBcQByWBTMBvh/WUBFiBpcBfSBTUBWPBZHBfIBcQBFTBcQB6SBTPB+FBNGB5EBSIBPCBX+AJnBTMBOUBUIBCKBNLBXC' +
            'BSFB9DBJnB2RBTQBMPBTGB0HBvIBuOBJnBaUB1RB/CBWWB9NBpPBMDBa/Az4AMzAOQBp7AFYBT5Aa6AXvA8pAZuAPrAKfAzaAmQBNdB' +
            'qdBJUB8JBTVBvh/+VBNLBpKB8OB/LBvKB6GBlOBWTBTJBSIB9KBMDBzGB/CB2JBZLBXNB+UBMKBTQBKGBlTBURBRSBWKB9YBRdBTPBy' +
            'bB/RBlVBUSB+QBZGBSPBPHBMFBzHBuEBT3AFTBpSBKHBfIBvDBJnBVZBGPB8MByQBFTBTQBSUBUMBpNBzHBOGBHCBMKBy8AT+At4AuJ' +
            'Bvh/JnBzOBvIBsGBOGB6PBtEBvABJnBzSB3LBiGBlRBMSBuRBpPBFYBXNB8YBzQBZLBWMBT8AKCBFTBMZB+NBqHBZ+AX9A3zAZ3Au3A' +
            '8TBtJB6KBT7AJnBTFBPYBcdBCdB2aBeXBSZBFdBXZBTPB0aBpXB9bBzQB5OBOQBdSBUHBvIBiBB59A+FBfABy8AFEBTDBvh/TAB38AM' +
            '5Au4AM3AZoAazAF/ASFBM0AX7AuzAF6Az3Az6A2yAp2A0oAJnBfFBqCBFJBTIBmBB09Ap5A3qAd5AJnB+ZBqTBMPBTLBFHBiBB33AXF' +
            'BWABl9AZyAT7A04ACzAT0AE/ACABX0A+2AJnBNHB/GBFOBzOBWNBSKBUDBJnB/aBMUBSSBJRBzHB9QBZBBvhdzBBFYBGNB8YBvPBSIB' +
            'eCB5JBq9A+8A9FBT5AX7A81AO3A6xAToAJnBNHBUDB34Ay3A+/AT2A3tA9+AM0A6zAJnBM+AofAtHeAtGehlGeQ4wwGeQ4AeQLBeAPB' +
            'eRpRLAewwQpwwAeg0BexhwwAegWCeRaRphWRaAegWglDewSRaBeQpwwBewhDeQpAegWDeRaAegHgWAeQLGeglAeQahHiWAeQawDQLJe' +
            '3zAvhFTABZ3Au3AFJBZiB9dBfgwhh0R4AtFewhAewSBewwCewhAeQLDeRpglAPAewwxhAewhRaRphWRaAegWglAehHRLBPAeBPgWTeU' +
            'UBvhEvPByLBTBBMIBuHB3fRpAeh0AtFeglAegWCeQ4AeRaCeAPCeQ4QaBtwhQpAtAeAtwSCewhAewSBewhAewSAewhAeQLDeRaglAPA' +
            'ewwxhAewhRaRphWRaAegWglAehHRLBPAeBPgWdeFJBvhFiCBT8AW+AvKB5EBTyAZfRpKeg0Jeh0AewhDeglBPgHBeQ4DeCtCeQ4DegW' +
            'EegWQpwwwhCeAtxSAewhAeQLDeRaglAPAewwxhAewhRaRphWRaAegWglAehHRLBPAeBPgWneOzAvhE97AKvAJTBXFB84AdfAtHeAtJe' +
            'gWEeRpg0glDeR4EeglAeQ4AegWDeBtAegHgWCeCPgHBeglDeCtCeglDegWEexSgWgHBPAeQaxDxec/AvhDt+AZ3ATABe9AjfwhKeg0A' +
            'eAtHeAtAewwBeRpglQpAehlwhAewhhlBeCPgHBeglDeCtCeglDegWEexSgWgHBPAeQaxD7e36AvhDv2Au3AJJB6HB5fhlDeQ4Aewhg0' +
            'AtFeQ4DeAtBeQ4BeglwSAPAegWAewhgHAegWxSiWAeRawDQLFfcEBvhET3AN+Av7AKzATtAPfRpglOeQ4DeglwwDeQ4EewwAeAtBegW' +
            'QpAtBeQLAtGeQaBeQpBeglwSAPAegWAewSgHAegWxSiWAeRawDQLPfc1AvhEtuAGxASsAl0AO1AVfh0AeglCewwCeAPglAeRpglAeww' +
            'BeCtgWQpAtwSBehWxhDeQaBeQpBeglwSAPAegWAewSgHAegWxSiWAeRawDQLZfMnAvhFzoAZjAfqAqeAp5AzuAQfglAeRpEewhHeAtB' +
            'eglAtwSCeAtBexhAeQ4Aeh0AegWCegWCeAPgWAeQaxSQLwDAegHiWjfapAvhDZeA/fAcwAtqAnewhAeQ4JeQ4GeglQLBewwGeAPQpAe' +
            'wwAtHeQaBeAtCeAtwSQLAeAPAtBexhAeQ4Aeglg0AegWCegWCeAPgWAeQaxSQLwDAegHiWtfMnAvhC+iAalAlrA6eg0whAeQ4hlHeww' +
            'Deg0BeglQLAegWAeAtwwhWAexhAeQ4AeglwhAegWCegWCeAPgWAeQaxSQLwDAegHiW3fThAvhEpqAmmA6oA3kAxmA+eR4AezhhlQ4Ae' +
            'wDAezwQaBeQLglAexSDeQLwwgWxhglhWQahWwDAeQaAPQLBPBgUXAvhFfYA2eA9lAekATeARgAxeRpg0zhQ4EeRaRpAeQ4AeRpCeAPA' +
            'ewSBeQLBPQ4AewhAewhwSAtQahWwDAeQaAPQLBPLgTPAvhD6iAFlA0kAXmA7eRpDeR4DeBtAeQ4AewDBexSBPAexDYgPaAvh/MgAVnA' +
            '6fAZUAGiAOgATdASaA0PA3XAFhApdAUgAihAzcAmeA3VABgATZAlgATiA+hAPfAZUA8aAlgA/UA+iAqgAyhAUXApOAFfAzcAXbACOAT' +
            'PARXA2kAlfAcfATbAJcA2ZACXAFdAUYARfA/aAGYAleAMgATeAXbAKUAUVAzXAJcA3bA6iAlZAGcAlfAXgAvh/KZAUaAmhAzXARbAyW' +
            'A0PApdAWiATYAvbAlfAxjAWdA3aAUTATZAFhAiZA0gAPcApTAzVAFfAKeA2mAUbAzcAXXApOAmSAFfA0eASlANZARcA/PAzSAmaAzWA' +
            'FfAGdAUaAykASiARlAXhAMdA3XAzeAOeANgA6fAlgAxjASnATeAMdAXhAubAnXATUAZaAtfAvh/agA2jA0fApdA/ZA9gAJdAThA+hAU' +
            'fA2ZARgASaATdAccAFgA3gA+iAyhAyjA3ZAZPAzWA8XAFgAGfA6dATXAMVAFbA5UA3bA0cAvdAOgAafATXA9YAuWAzPAXOAtaAZZAiZ' +
            'AxbAxXAsPA9VATWAUSAOUAfYA6YAdgAGfAieAXhAxZATdAUWAUXA2ZARXASdAvh/FgAXgAXfATeA+iA8hAxfASYATUA2aAFcAXYASgA' +
            'TUA1aAURAmPATOApNAJcA0gA3fAKeAzZAUdAGYA9bAlVAKPAJcAXfAThApdAsZANUAaiAXTAugAzRAdbAufA/cA0ZAKdAcaA6YATUAm' +
            'PApSAFgA3gAPcAFgAxjATiACdAxeA2ZAOcA0PA/QATTAxRAFbAvh/MgASnA0fAXdACYAZZATOAmgAtZA0aAOcA9bATXA/aAabA5OAle' +
            'AugAKeAseAzaAvcAvWATUAUQAJdAiZAGdARbAlbAyZA5VATRAlhA+iAMYA3ZAlhAuhAZZAzZAXbA0SA6VAdhATgAviAGYAKZApOAZKA' +
            'XfA8ZANhAGgAzcACaAMgAahAZWAzcAXXAGfA0eAvh/9fA2eATiARaACdAlgAMhA2eA/UATdA0aAxXASTAlbAUaAfbANXAXQApbAagAW' +
            'iAZZATYA6bAtZAMcA3aAzbANiA2jA/eApdATfA8hAigASmA/eATfAMdAecAOgAthAWkAUfA5YATgAFcAadAvaAfWA0RAZZAzXAyVAlZ' +
            'AGYAJXATVA6bAWYA/eAUYA9eARlAvh/MeAGdAzbAXWAZPA6KAVYAMSAFVAifAviA2kAzaAiVATPAGYAHcAxXA1VApbAUdA2eAZWAFhA' +
            '/eATfAscAqgApdA0ZA/aASYATPAFcAUQAFbAahAOiAGhAZUAfgAzeASnAzcAUgA9bAGYA3VAlUAJcATiAKeAUfAfgAmVApbAkUAZcAu' +
            'hA9iA3bAyeAKUAzPAvh/uaAlhATiA0bAvYA8VAlcAyeA5cAzbAvdAuZAZUApOAXXAlaAzXAsbAGaAyUARSATKAFWAagA+iA3hAsgAzX' +
            'AKZAGTARaA3QAsPAlWAZPAXXAifAMgATdAuZA+XATTAlaAtfAXaA0gAihApYA3bAtZAUQAzXAiSAZZAHgAieAWlA+iAxeA8hAzgATUA' +
            'UXAFbAvh/OaARcASiA3UATTAUSAFWAOUACYAVaAZbAXcAUYAKUAvWAlaAzZAGdA5aA2ZASdAvbA0PAzSAJcA9dAzUAsgAOUAlfA/hA6' +
            'fAZbAMdA/XAKPATQApbAFiACfATgA+iA3hA1jA0fAZUAOhAHdARaAUSA9gAWlATiA6eAlcATPAvYAMbAZaA6fApYAuhAMgAKUAvh/PT' +
            'A2aAzQAtPAFXAGWATTACOAZKAfQAPSA0QATOAmQAlKASSAJcAylAsbATZAWiAMWAlfAPfAUiAZUAzPAGdAPXAlaASiAZWAycAvTA5aA' +
            '2jA0ZAThACcAGYAcSAzPAlaAZUAvgAlbA5aAzZAUWAaiAvYA2UA8NAFXA/UAaVAzWAeWApdA9dATcAvbAyZA1XAvh/UOA+PAlRA5aAT' +
            'fAOeAUgAviAiaApTAKUAzPARWAsXA2PAFhAXhAzfA0cARaACRA+YAtgAXdAXWAzeAMVAZZAuUAiKAFcAXiANhAugAagAzhAxZAUWAUX' +
            'AdYAyUA5dATeAviA+hA3gAyZApTAlfAWlAMbATZAJYAFhA3fA2eAahA0UAzVA9YAzRAmPAXOA0LAvh/pcA2lAKeAzZAvdApWA8aAlhA' +
            'pYAuhAzSA3aAKZA6UANVAURAJcASiATZA9gA3aAmUA0QAUXAFYATUASdAXTA+WAxPAJcAykA3hA2jAzgA0fAlZAfbA0cA9WATPAmXAi' +
            'QApdATZApdAXbAeiAcaAdhA3WA2ZARVAlcACiASnATeARhA2lATfASnAMdAXhAMgAvh/dfAiWApaA3UA8XANPAmWAGXAUVAzQA9YAXY' +
            'AZZAzbAseACiAXgATYAxaAleAucAahAGTAKZAzZAPXAJKAtfA+aAUXAUYAtZAZbAvdATXAiaApbA0aAvdAleAThAGdA3eAiZAWgAigA' +
            'xjAUgATiAdhAUWA5cA+dAzWAfYAKeAFfA/eAebAKPApTAdYAzWAOfAvh/UaA0aAyVA3cAlbAxcATTAsWA/ZA5XAVfAueATdAOeAqfAp' +
            'OAzSAKPAcVAvgAdhA2cAzZAngAxZAFgA0hAfgAyeATUAKdApTAuXAsbAFVAFbAiZAzXA2UA/KAsgApTAiXAuWAFgAzXA/fA0PAzRA6V' +
            'AZbAXaAWnAUdAJXAFgATbACaA9dA8XA3RAZZA2eAsfAvh/pYAzWAucACfAXWA1ZAmcANfAxhATYA3bA8aAsZAvXAZZA6gASiA9eA2cA' +
            'SYAZPATRAlfA+fAzeAXiA0ZATYAMbA/aAKPAFhAuhApTA6UAeTAXbATVAURAJcAVmATZANfACiAxZAEgAvgASiA2ZAGVAMYAxWAXTAF' +
            'cA2eACYATbA9aATRA/UAJcAcfASnAmgAvh/0cAxaATYAleA3cACfA9YATbAWaAMXA3RAZZAmeAMdA3XANbAzRAyZApJA3PA5aAzhA0f' +
            'AicA+bAtZA0VAXTAZZATZASdAmfAFhASlAmeAzaAZPAXdAFcAcaAuZAMbA/PAKdAFhAThApdAUcAKfAfdATTAZKAFgAXgACfAWfAmaA' +
            'RVAMhATdAtgAUhASnAXdAvh/xjATZA+aAmUANgASdAFhAXhAMdAZUAzZA8XA3bA5VAzUAOgAqXA6dAxZANhATTA3bAEgA2jAleA1kA3' +
            'cAkgAGiAzgARkAxcAieATZA/fAtbAGVASdAyXAcPAZbAviAThA2kA0aApTANZA6gA3hA2lAzcA0eAmZA1UASYAXOA5aAlgATbAcUAOc' +
            'ATaA3bASiAvh/ZUAUaAfbAzUAFdAUWA+TAxQAFXATUAycAShAmgAUfAxmA3gAZZAtZA/cA+dAlfA0fAyZATPApTAvgAzWA8VAaiAthA' +
            '3fAOiAChARaA2eAFhATiA1jA0fAXVATYApcAOZAkgAVgAahATeASnAOhAHdA0fAxXATUAUbAOfA6gApdAXfANeAJdAegAlVAkUAzgAv' +
            'h/KKAzWA5cAPfASnAmUAXhAMdAlXAlbACWAzfA2jA/ZA0fApdAvgAthAJcAaiAUfAGgASnAzgAXdAWcAxXA0fAdbATeA2eAFfASnAXh' +
            'AxjAzZAMdA6aAOZA8XATbAdcApTAXVAsXAZPA3NACQAFbATbAOcAXaAUYATUAFgAGdAigATaA3ZAxcAiUAxXAlgA0aAvhwvXATUA+YA' +
            'OTAlbA0fAxZAabA2UATOAvXApbA6hA1kAseAZUATYACVAlgAegA3cAvYAMXASaATPAGOAURAZLAubATZA8aAlgARmAVhAfdACbAyeAs' +
            'UAOUAVWAvYAzNAFXAGVAhQAJNADKASMAAAA';

        const pages: Page[] = [];
        await decode(data, (page) => {
            pages[page.index] = page;
        });

        const quiz = '#Q=[](I)STJOLZILJTOSZOJTZISLJLIOTZSLJSZOITTZSLOIJSIOLZTJIOLJZSTZOIJLTSLSOIZJTIZSJOTLZ' +
            'JTLOSIOZTLJSIZTILJSOLIOJSTZSTIOLJZLSZTJOITJISOLZISZLOJTILZOJSTTLZISOJIZJOTLSTLSIJZOTJISZLOO' +
            'ZJSILTOISZJLTOIZTLJSOZLTJSITOJISZLZJOTSILISOZJTLTSLZIJOOZSIJTLSTJZIOLIZJTLOSZILSTOJILZTOJSIZ' +
            'LSJTOZLTIOSJSZJTOLIZIJTSOLTJZISLOZIJOTSLSITOJZLTLZJIOSTZLOSJIOSZJLTILOSZTJIZTSOILJOZTLJISISO' +
            'JZTLZIOSLTJJLSTOZITOIJZLSISJLTOZOSTJZILLZTSJIOOJIZTSLOZJTISLIJZOTLSTSJIZOLSOZLJTIJSTOILZLSZO' +
            'IJTIOTSZJLJILZTOSOJLSITZLIJOSTZLIZSOTJTISZJLOZTLOJSIZOJTLISZSTIOJLSJITZOLSOTZJILTJZOLSIOTLIS' +
            'ZJZTLOJISLIZSTJOJOITLSZSZTILOJJILZSTOZLOJSITOSJTIZLSJZLIOTSLOZIJTJOILTSZITJOZSLIZOSTLJSTLZJO' +
            'ILIZJOTSIZJSTOLTZSIOJLSZOLIJTZTOISLJOTJZSLISZOTJLITLOSZIJSOLTJZITSILOJZJIZOTLSJLTSIOZOJLZITS' +
            'SZLJOITJOSTLZIIZTOSJLTJLISOZZJSILTOSTJZILOJLSTOZIJOZISTLOZJLTISZOIJTLSOTJSIZLZLOJITSSTIOLJZJ' +
            'LSOITZZSLTIOJZJTOISLSTJLZOISOZLTJILOIJTSZTJOIZSLOTLSJIZISOTJLZLSIOZJTJTOILSZJIOZLSTZTSIJLOIS' +
            'LTZJOTSOIJZLLSOZJTIJZOLTISSZOLTIJOILJSZTTZJOSILZTLJSIOLOJSZTIJTIOSLZISZLTOJZTLIJOSOLTZSJITOZ' +
            'LSJIIZTJSLOLJSTOZIZTLIOSJILSTOZJIJOTLSZTOLJISZLISZTOJJOSTIZLLSTZOIJSLJTIZOOZTJILSOZSJLTIZTLS' +
            'IOJZJLSOTITOZJSILLZSJOITLOSTZIJISZTLJOTIOSZLJIJZLSTOTJOILSZSOJZTLILJOTZISZOTJSILLSIZJTOLJZOI' +
            'STIZOLSTJZJSLOITOZSLTIJTZOJISLLIOZSJTOZITLJSOSTZIJLSTJILOZZITLSOJSLOITJZLITSJZOTOJLSZIJTOSIZ' +
            'LIJOSLZTILOTJSZTZSOLJISILJTOZISZTOJLZOISJLTSJITLOZIJOLZSTZLISJTOJZTOSILZSOTILJJILOSZTJZITLSO' +
            'IZSOTLJSJLIOZTIZJTOSLJSLTIZOJZTLSIOIZSTJLOJTIOLZSJTOSILZSLOIJZTTOLIJSZTLJIOSZOLTSJZIOSLTZIJI' +
            'ZOLJTSIJTSOZLZSILTJOLIJTZOSTOZSLJIILJSOZTOTZLISJLJSZITOJLITOSZZLJISOTTLIOJZSJZSOTILISJOZLTZS' +
            'OITLJLTJOISZZJSLTIOZLOSJITSLJITZOSZLIJOTJTLSIZOZISJOTLLIZOSTJTSJZLOIIOLSTJZLIOSJZTIJLSTOZJTL' +
            'SIZOSJOTLIZSOLZJITOLSJZITISTJZOLIOSZLTJSILTJOZTSIOLJZTIOLJSZOZJILTSIOJTZSLOILZJSTLTOIJSZISTL' +
            'OZJLISJZOTLJTSOIZTLJZOISSZIJLTOSIZOTJLOSILZTJSOJZTILOJISLTZITOLJZSSLOZJTIJOZITSLLZTJOSITJSIO' +
            'LZLOJZI';

        expect(pages).toHaveLength(1826);
        expect(pages[0]).toMatchObject({
            piece: {
                lock: true,
                type: Piece.I,
                rotation: Rotation.Spawn,
                coordinate: {
                    x: 1,
                    y: 0,
                },
            },
            comment: {
                text: quiz,
            },
            quiz: {
                operation: Operation.Direct,
            },
            field: new Field({}),
            sentLine: new FieldLine({}),
        } as Page);

        expect(pages[79]).toMatchObject({
            piece: {
                lock: true,
                type: Piece.L,
                rotation: Rotation.Right,
                coordinate: {
                    x: 7,
                    y: 8,
                },
            },
            comment: {
                ref: 0,
            },
            quiz: {
                operation: Operation.Direct,
            },
            field: Field.load('',
                'L____J____',
                'LZZ__J____',
                'LLZZJJ___Z',
                'TTTSZZ_JJI',
                'LTSSZJ_JII',
                'LLSSJJ_JII',
                'JJJLZZ_OOI',
                'LLJJOO_LLL',
                'LLLSSI_IZZ',
                'OOZZSI_IZT',
            ),
            sentLine: new FieldLine({}),
        } as Page);

        expect(pages[1824]).toMatchObject({
            piece: {
                lock: true,
                type: Piece.L,
                rotation: Rotation.Spawn,
                coordinate: {
                    x: 4,
                    y: 20,
                },
            },
            comment: {
                ref: 0,
            },
            quiz: {
                operation: Operation.Direct,
            },
            field: Field.load('',
                '______I___',
                'OO____I___',
                'OOIIIIIOO_',
                '_JJJ__IOO_',
                'JJZJTTTTS_',
                'LLLLZTTTS_',
                'OOIZZIIII_',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
            ),
            sentLine: new FieldLine({}),
        } as Page);

        expect(pages[1825]).toMatchObject({
            piece: undefined,
            comment: {
                ref: 0,
            },
            quiz: {
                operation: undefined,
            },
            field: Field.load('',
                '_____LI___',
                'OO_LLLI___',
                'OOIIIIIOO_',
                '_JJJ__IOO_',
                'JJZJTTTTS_',
                'LLLLZTTTS_',
                'OOIZZIIII_',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
                '__________',
            ),
            sentLine: new FieldLine({}),
        } as Page);
    });

    describe('extract', () => {
        test('pass', () => {
            const data = extract('vhAAgH');
            expect(data).toEqual('vhAAgH');
        });

        test('v115@', () => {
            const data = extract('v115@vhATLJ');
            expect(data).toEqual('vhATLJ');
        });

        test('m115@', () => {
            const data = extract('m115@vhAJEJ');
            expect(data).toEqual('vhAJEJ');
        });

        test('d115@', () => {
            const data = extract('d115@vhAMLJ');
            expect(data).toEqual('vhAMLJ');
        });

        test('fumen.zui.jp', () => {
            const data = extract('http://fumen.zui.jp/?v115@vhANKJ');
            expect(data).toEqual('vhANKJ');
        });

        test('knewjade.github.io with options', () => {
            const data = extract('https://knewjade.github.io/fumen-for-mobile/?d=v115@vhAmKJ&dummy=3');
            expect(data).toEqual('vhAmKJ');
        });

        test('with spaces', () => {
            const data = extract('     v115@ehD 8 MeA gH   ');
            expect(data).toEqual('ehD8MeAgH');
        });

        test('includes ?', () => {
            const data = extract('v115@vfA8HeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8He?A8JeA8ReAgH');
            expect(data).toEqual('vfA8HeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8ReAgH');
        });

        test('v110@', () => {
            expect(() => extract('v110@7eAA4G')).toThrow(FumenError);
        });

        test('Quiz', async () => {
            const pages: Page[] = [];
            await decode('vhBSSYaAFLDmClcJSAVDEHBEooRBPoAVBTejWC0/AA?AAAA', (page) => {
                pages[page.index] = page;
            });

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: '#Q=[](O)SIZLTJ',
                },
                piece: {
                    lock: true,
                    type: Piece.L,
                    rotation: Rotation.Spawn,
                    coordinate: {
                        x: 8,
                        y: 0,
                    },
                },
                quiz: {
                    operation: undefined,
                },
            } as Page);

            expect(pages[1]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: undefined,
                quiz: {
                    operation: undefined,
                },
            } as Page);
        });
    });
});
