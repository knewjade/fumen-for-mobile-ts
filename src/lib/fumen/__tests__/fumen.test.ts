import { decode, encode, extract, Page } from '../fumen';
import { Field, PlayField } from '../field';
import { Operation, Piece, Rotation } from '../../enums';
import { FumenError } from '../../errors';

describe('fumen', () => {
    describe('decode v115', () => {
        test('empty', async () => {
            const pages = await decode('v115@vhAAgH');

            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                index: 0,
                piece: undefined,
                comment: {
                    text: '',
                },
                quiz: undefined,
                flags: {
                    lock: true,
                    mirror: false,
                    colorize: true,
                    rise: false,
                },
                field: {
                    obj: new Field({}),
                },
            });
        });

        test('last page', async () => {
            const pages = await decode('v115@vhBAgHAAA');

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                index: 0,
            });

            expect(pages[1]).toMatchObject({
                index: 1,
            } as Page);
        });

        test('mirror', async () => {
            const pages = await decode('v115@RhA8IeB8HeC8GeAQLvhAAAA');

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                flags: {
                    mirror: true,
                },
                field: {
                    obj: new Field({
                        field: PlayField.load(
                            '',
                            'X_________',
                            'XX________',
                        ),
                        sentLine: PlayField.loadMinify('XXX_______'),
                    }),
                },
            });

            expect(pages[1]).toMatchObject({
                flags: {
                    mirror: false,
                },
                field: {
                    ref: 0,
                },
            });
        });

        test('send', async () => {
            const pages = await decode('v115@RhA8IeB8HeC8GeAYJvhAAAA');

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                flags: {
                    rise: true,
                },
                field: {
                    obj: new Field({
                        field: PlayField.load(
                            '',
                            'X_________',
                            'XX________',
                        ),
                        sentLine: PlayField.loadMinify('XXX_______'),
                    }),
                },
            });

            expect(pages[1]).toMatchObject({
                flags: {
                    rise: false,
                },
                field: {
                    ref: 0,
                },
            });
        });

        test('I-Spawn', async () => {
            const pages = await decode('v115@vhARQJ');

            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual({
                index: 0,
                piece: {
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
                    lock: true,
                    mirror: false,
                    colorize: true,
                    rise: false,
                },
                field: {
                    obj: new Field({}),
                },
            });
        });

        test('Comment', async () => {
            const pages = await decode('v115@vhDAgWFAooMDEPBAAAAAPFA3XaDEEBAAAAAAAAPDAFrmAA');

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
            const pages = await decode('v115@vhGSSYXAFLDmClcJSAVDEHBEooRBMoAVBUtfBAXsBAAANrBmnBAAAAAA');

            expect(pages).toHaveLength(7);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: '#Q=[](L)TSJ',
                },
                piece: {
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
                flags: {
                    lock: true,
                },
            } as Page);

            expect(pages[1]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
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
                flags: {
                    lock: true,
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
                flags: {
                    lock: true,
                },
            } as Page);

            expect(pages[4]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
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
                flags: {
                    lock: true,
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
                flags: {
                    lock: true,
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
                flags: {
                    lock: true,
                },
            } as Page);
        });

        test('No lock', async () => {
            const pages = await decode('v115@vhAAgl');

            expect(pages).toHaveLength(1);
            expect(pages[0]).toMatchObject({
                flags: {
                    lock: false,
                },
            } as Page);
        });

        test('Lock after quiz', async () => {
            const pages = await decode('v115@vhCWSYVAFLDmClcJSAVDEHBEooRBKoAVB6AAAAUoBT?pB');

            expect(pages).toHaveLength(3);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: '#Q=[](J)Z',
                },
                piece: {
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
                flags: {
                    lock: true,
                },
            } as Page);

            expect(pages[1]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
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
                flags: {
                    lock: true,
                },
            } as Page);

            expect(pages[2]).toMatchObject({
                comment: {
                    ref: 0,
                },
                piece: {
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
                flags: {
                    lock: true,
                },
            } as Page);
        });
    });

    test('illegal short fumen', async () => {
        // right: vhAyOJ
        await expect(decode('v115@vhAyO')).rejects.toBeInstanceOf(FumenError);
    });

    test('long data', async () => {
        const data = 'v115@' +
            'vh/xOY7cFLDmClcJSAVDEHBEooRBJoAVBzuHgCsn9VCq+ytCan/wCauTWCqSFgC0HUWCKtrgCpOmFDzyCMCKdFgCsXmPCJH' +
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

        const pages = await decode(data);

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
            field: {
                obj: new Field({}),
            },
        } as Page);

        expect(pages[478]).toMatchObject({
            piece: {
                type: Piece.S,
                rotation: Rotation.Spawn,
                coordinate: {
                    x: 3,
                    y: 11,
                },
            },
            comment: {
                ref: 0,
            },
            quiz: {
                operation: Operation.Direct,
            },
            field: {
                obj: new Field({
                    field: PlayField.load(
                        '_____Z____',
                        '____ZZ____',
                        '__LLZZ____',
                        '_SSLZZ____',
                        'SSLLZ___OO',
                        'LLLSST_JOO',
                        'OOSSTT_JLL',
                        'JJTTZZ_ZZL',
                        'JJTLOO_ZSS',
                        'JJJLOO_SST',
                        'JJJLLL_ITT',
                        'IJJLLL_IST',
                        '__________',
                    ),
                    sentLine: PlayField.loadMinify('__________'),
                }),
            },
        } as Page);

        expect(pages[1824]).toMatchObject({
            piece: {
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
            field: {
                ref: 560,
            },
        } as Page);

        expect(pages[1825]).toMatchObject({
            piece: undefined,
            comment: {
                ref: 0,
            },
            quiz: {
                operation: undefined,
            },
            field: {
                ref: 560,
            },
        } as Page);

        // Encode
        const encoded = await encode(pages);
        await expect(encoded.replace(/[?]/g, '')).toEqual(data.substr(5));
    });

    describe('decode v110', () => {
        test('case1', async () => {
            const pages = await decode('v110@7eAA4G');
            await expect(encode(pages)).resolves.toEqual('vhAAgH');
        });

        test('case2', async () => {
            const pages = await decode('v110@7eMSeIJdBWoBEeBHcBVXBDfB6MBOVBpUBjTBvNBMOB?');
            await expect(encode(pages)).resolves.toEqual('vhMSQJJnBWyBEoBHmBVhBDpB6WBOfBpeBjdBvXBMYB');
        });
    });

    describe('extract', () => {
        test('v115@', () => {
            const data = extract('v115@vhATLJ');
            expect(data).toEqual({ version: '115', data: 'vhATLJ' });
        });

        test('m115@', () => {
            const data = extract('m115@vhAJEJ');
            expect(data).toEqual({ version: '115', data: 'vhAJEJ' });
        });

        test('d115@', () => {
            const data = extract('d115@vhAMLJ');
            expect(data).toEqual({ version: '115', data: 'vhAMLJ' });
        });

        test('fumen.zui.jp', () => {
            const data = extract('http://fumen.zui.jp/?v115@vhANKJ');
            expect(data).toEqual({ version: '115', data: 'vhANKJ' });
        });

        test('knewjade.github.io with options', () => {
            const data = extract('https://knewjade.github.io/fumen-for-mobile/?d=v115@vhAmKJ&dummy=3');
            expect(data).toEqual({ version: '115', data: 'vhAmKJ' });
        });

        test('with spaces', () => {
            const data = extract('     v115@ehD 8 MeA gH   ');
            expect(data).toEqual({ version: '115', data: 'ehD8MeAgH' });
        });

        test('includes ?', () => {
            const data = extract('v115@vfA8HeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8He?A8JeA8ReAgH');
            expect(data).toEqual({ version: '115', data: 'vfA8HeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8ReAgH' });
        });

        test('v110@', () => {
            const data = extract('v110@7eAA4G?A8JeA8ReAgH');
            expect(data).toEqual({ version: '110', data: '7eAA4GA8JeA8ReAgH' });
        });

        test('data only', () => {
            expect(() => extract('7eAA4G')).toThrow(FumenError);
        });

        test('Quiz', async () => {
            const pages = await decode('v115@vhBSSYaAFLDmClcJSAVDEHBEooRBPoAVBTejWC0/AA?AAAA');

            expect(pages).toHaveLength(2);
            expect(pages[0]).toMatchObject({
                comment: {
                    text: '#Q=[](O)SIZLTJ',
                },
                piece: {
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

    describe('encode', async () => {
        test('empty', async () => {
            const pages = await decode('v115@vhAAgH');
            await expect(encode(pages)).resolves.toEqual('vhAAgH');
        });

        test('last page', async () => {
            const pages = await decode('v115@vhBAgHAAA');
            await expect(encode(pages)).resolves.toEqual('vhBAgHAAA');
        });

        test('mirror', async () => {
            const pages = await decode('v115@RhA8IeB8HeC8GeAQLvhAAAA');
            await expect(encode(pages)).resolves.toEqual('RhA8IeB8HeC8GeAQLvhAAAA');
        });

        test('send', async () => {
            const pages = await decode('v115@RhA8IeB8HeC8GeAYJvhAAAA');
            await expect(encode(pages)).resolves.toEqual('RhA8IeB8HeC8GeAYJvhAAAA');
        });

        test('I-Spawn', async () => {
            const pages = await decode('v115@vhARQJ');
            await expect(encode(pages)).resolves.toEqual('vhARQJ');
        });

        test('Comment', async () => {
            const pages = await decode('v115@vhDAgWFAooMDEPBAAAAAPFA3XaDEEBAAAAAAAAPDAF?rmAA');
            await expect(encode(pages)).resolves.toEqual('vhDAgWFAooMDEPBAAAAAPFA3XaDEEBAAAAAAAAPDAF?rmAA');
        });

        test('Quiz', async () => {
            const pages = await decode('v115@vhGSSYXAFLDmClcJSAVDEHBEooRBMoAVBUtfBAXsBA?AANrBmnBAAAAAA');
            await expect(encode(pages)).resolves.toEqual('vhGSSYXAFLDmClcJSAVDEHBEooRBMoAVBUtfBAXsBA?AANrBmnBAAAAAA');
        });

        test('No lock', async () => {
            const pages = await decode('v115@vhAAgl');
            await expect(encode(pages)).resolves.toEqual('vhAAgl');
        });

        test('Lock after quiz', async () => {
            const pages = await decode('v115@vhCWSYVAFLDmClcJSAVDEHBEooRBKoAVB6AAAAUoBT?pB');
            await expect(encode(pages)).resolves.toEqual('vhCWSYVAFLDmClcJSAVDEHBEooRBKoAVB6AAAAUoBT?pB');
        });

        test('Long', async () => {
            const fumen = 'v115@' +
                'vhHRQYfDFLDmClcJSAVDEHBEooRBaoAVBJt/wCMnbM?CKHExCTHmPCsnltCzHLxCqS9VCKHOMCz3/wC6ybgCpyLM' +
                'Cv?XmPCJt/wCMnzFDM9CMCqOstC6P9wCPnzPCp+TWCp3ntCUHE?xCK3jFDMOltCvOUFDqS9wCTnPFD6u3LCM3TxCJHUPCadNFD' +
                '?M3jPCUujPCvCmFDa3TWCK+lPC0nFgCzCOMCvXstCq+jPCvX?8LCsPNFDTHOMCM3jFD0vKxCzfjWCpn9wCMnntCMergCz/NM?C' +
                'zXMgC0vzBA3mB+tBcqBihBTpBlsBMtBogAtDeilAeBtCeA?tglR4AeAtg0C8AeI8AeE8AtC8Aei0A8BtC8APg0xhA8Atgl?Jeu' +
                'YBvhVRSBKVBFWB/VBTUBTTBeSBSPBMFBpNBNJB//AM7A?TGBFRB3RBaWB5lB+rBipBOmBliBPgh0ywAtDeh0Q4wwBtil?Aeh0R' +
                '4BtilAeh0wwQ4BtC8AeI8AehlSpAtC8AehlwhQpBti?0AehlxhBti0AehlQpwhBtJezGBvhHZBBs8A+AB3/As+AlCB?XABT8A';
            const pages = await decode(fumen);
            await expect(encode(pages)).resolves.toEqual(fumen.substr(5));
        });

        test('ほｗｙISO', async () => {
            const fumen = 'v115@' +
                'vhPAgWFBlvs2AXDEfEmJYOBlfnBC11ktCPooRBlvs2?AXDEfETo42Alvs2AVG88A5XHDBQxLSA1jxEB0XHDBwCO' +
                'SAV?yfzBZAAAASvQAAGgQ2Al/32ADFEfE5Ci9Al/X6B4vDfE4Cl?wBlfrHBjDEfET4p9Bl/PVB4pDfEZ0mRBlvs2A2iAAARxQ' +
                'AA?/tBMrBTnBNaQVBlfnBCxpDfEZk0KBlvFLBFIEfETYk2AJYH?DBQOHSAVyn9B5XHDBQ+NSA1d0KBBYHDBQelRA1d0KB4XnQ' +
                'B?kelRA1dkRBxXHDBQxCSA1dEEBUAAAAxQQAAAAPkAlP5ABGt?DfET4p9BlPZOBjDEfETYO6AlfrHBC2DfET4BBC+HBKGB/jB' +
                '?TdBchQRBzHjSA1d8UByX3JBm0nRA1d0KB0XHDBQxLSA1dEE?BDY3JBi0wRA1AlVBBYHDBwvwRA1dkRBCYPNBDKsRA1dEEBD?' +
                'YHDBwvwRA1dkRBiAAAAAAALggWBegHFegWBegHFehWhHFeA?tSaGewwIewhh0AeAPxSwDEeAPDewDdeAAPxAlfnBCRrDfEZ?k' +
                '0KBlvFLBFIEfET4p9BJYHDBQOHSA1m0KBwXHDBQelRAVCS?EBSAAAAvhG2QB/MBMhBbdBaeB5eBAAAXgwDGegHAexDFeQa?hH' +
                'wDGewwEehWQaAewhh0AeAPxSgWQaDeAPDeQadeAAP4Alf?nBCRrDfEZk0KBlvFLBFIEfET4p9BJYHDBQhmOClvs2A0EEf?EZ4' +
                'x2Alvs2AUuDfEWhd9AvhWAAPeAlvs2A0EEfEToABBlvs?2AXoDfET45ABlvs2AWhAAA6jQAAMhQoBlvs2A1sDfETY+2B?aYHD' +
                'BQ+sVClPBLBGCEfEVDRwBlvs2AQoDfE18dBBlvs2A2H?EfE3hUEBlvs2AW0DfEVekRBlvs2AYJEfETofzBlvs2AWxDf?EYYsA' +
                'Blvs2AU0DfET4BLBbUQAA/KQtBUYHDBQOHSA1QvEBC?YPNB4swRA1d0KBCY3JBGqnRA1d0KBzXHDBQ+ESA1dEEBCYH?DBQ0wR' +
                'A1d0KBBYHDBQelRA1dkRB4XHDBQ+pRA1d0KBCYXXB?QIjRA1dEEBDYHDBwPsRA1d0KBWAAAA2iQAAxVBVbeNbtGAl?P5ABGdA' +
                'AANcuGAlfC6A5cAAAFcuGAlP5ABGdAAAFbuIBlfC?6AZoDfETYk2AFbuRAVau6AyXXXBQLjRAVChHBzXHDBQ+ESA?1Qn6AxXH' +
                'DBwPsRA12XOB3XPNBSjHSA1dcHB3nAVBdluGAlP?5ABGdAAA1puMAlP5ABGtDfE18dBBNpQSAlP5ABGtDfE18dB?BlP5ABGdA' +
                'AAAAPAAV0eN0tGAlP5ABGdAAANhuGAlfC6A5cA?AAFhuGAlP5ABGdAAAFguGAlfC6AZYAAAdqQGAlP5ABGdAAA?AAAfgB8EeE' +
                '8EeA8AeD8DeA8BeD8BeC8GeB8HeB8IeA8LeAA?P8AlvNwBUGEfEToABBlvs2A2yDfETYd9Alvs2A2sDfETo/A?Clvs2A4BEfE' +
                'ToHVBlvs2AYDEfET4xRBvhAAAPFBlfzRBU0D?fE112KBSYgSA1dEEBDYHDBQhlRA1d0KBBYHDBQOHSA1d0KB?zXHDBw/NSA1d' +
                'kRBBYHDBwvwRA1dkRBiAAAAjfB8EeE8EeA8?Q4D8DeA8R4D8BeC8Q4zhBeB8RpwwEeB8RpxSwwBeAtg0Aeh?HCeD8AewhCeAA' +
                'D8AexhBeAAAeB8CewhR4QaQ4B8BexwQpA8?AeC8BexwSpB8AtgHAeh0JeAAthAFLDmClcJSAVDEHBEooRB?KoAVBzurgCMuTW' +
                'Cp3/wCvAAAAvhK3+AdDBuIBkMBTHBiNB/?LBZgBilBcsBWHtjBlvs2A1sDfETY+2Blvs2A2yDfEVuWzBl?vs2AYrDfETIkzBl' +
                'fnBC1yDfEmJIVBJ9iSA1dE6BFYHDBQDx?RA1dUzBGYHDBQpHSA1d0KBwXPDCmoeRAVaW3AxXPDCmomAA?egglzhCeilwwFei0' +
                'xwCeAtRpQ4g0wwi0BtRpR4Ceg0BtRpR?4wDBeglBtQpQaR4wDQLBeglwhxSwhQ4JeAAPSAlvs2A0BEf?ETIs9Blvs2A1ZAAAv' +
                'hgAAtAAecfmbfGbfOlu0AKYHDBQDxR?A1dE6B0XHDBQp7bCFXEfET45ABlvs2AXGEfETYNEBlvs2AY?uDfET4REBAAtAAUIfM' +
                'NuGAlP5ABGdAAAMcuGAlfC6A5cAAA?sbuGAlfC6AZYAAAkbuGAlP5ABGdAAAEbuGAlfC6AZYAAA8k?uGAlP5ABGdAAA0kuMAl' +
                'P5ABGtDfE18dBBMpuSAlP5ABGtDf?E18dBBlP5ABGdAAAMpuTAaYHDBQEhRA1w2KB1XHDBQENBAA?AtAAUIfMNuGAlP5ABGdA' +
                'AAMcuGAlfC6A5cAAAsbuGAlfC6A?ZYAAA0MuGAlPR6BlhAAAUNuGAlfC6AZbAAAMSuGAlP5ABGd?AAAMcuGAlfC6A5cAAAsbu' +
                'GAlfC6AZYAAA0MuGAlPR6BlhAA?AUNuGAlfC6AZbAAAUNueAl/m9BFwDfE03UzBlvs2AlDEfET?4d3Blvs2AEjAAAAAtAAUbf' +
                'UbBzXBZgB8IeA8JfAAAvhBdcQ?OBlvs2AUrDfETY+2Blvs2AwpDfETo3ABlvs2A2sDfET4J6A?lvs2A2HEfETIkzBlvs2AUxD' +
                'fETY12Blv12AWDEfEVrozBlP?J6AGyAAAAAPaBlvs2AU0DfEmJYOBlvs2A3vDfETY1ABlvs2?AU0DfETIk9Alvs2AUrDfETY1' +
                '2Blvs2A0EEfETY9KBlvs2A0?yDfETY12Blvs2AUxDfETYVOBlfnBCVbAAA';
            const pages = await decode(fumen);
            await expect(encode(pages)).resolves.toEqual(fumen.substr(5));
        });
    });
});
