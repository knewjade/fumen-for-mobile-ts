import {
    block,
    Color,
    datatest,
    holdBox,
    leftTap,
    mino,
    nextBox,
    pages,
    Piece,
    rightTap,
    Rotation,
    visit
} from '../support/common';
import { operations } from '../support/operations';

// テト譜を開く
describe('Open fumen', () => {
    const dragNDrop = (val) => {
        cy.get(datatest('range-page-slider')).as('range')
            .trigger('mousedown')
            .invoke('val', val)
            .trigger('input')
            .trigger('mouseleave');
    };

    const inputData = (data, maxPage) => {
        // モーダルを開く
        operations.menu.openPage();

        // 入力に成功するパターン
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type(data);
                cy.get(datatest('btn-open')).click();
            });

        // Assertion: モーダルが閉じられている
        cy.get(datatest('mdl-open-fumen')).should('not.exist');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / ' + maxPage);
    };

    const open = (data) => {
        inputData('v115@vhAAgH', 1);
        inputData(data, 5);
    };

    const openError = (data) => {
        // 入力に失敗するパターン
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type(data);
                cy.get(datatest('btn-open')).click();

                // Assertion: エラーメッセージ
                cy.get(datatest('text-message')).should('contain', 'Failed to load');

                cy.get(datatest('btn-open')).should('have.class', 'disabled');
            });
    };

    // 空の5ページ
    it('Open modal', () => {
        visit({});

        // 入力前
        operations.menu.openPage();
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                cy.get(datatest('btn-open')).should('have.class', 'disabled');
                cy.get(datatest('btn-cancel')).click();
            });

        open('v115@vhEAgHAAAAAAAAAAAA');
        open('http://fumen.zui.jp/?v115@vhEAgHAAAAAAAAAAAA');

        open('m115@vhEAgHAAAAAAAAAAAA');
        open('http://fumen.zui.jp/?m115@vhEAgHAAAAAAAAAAAA');

        open('d115@vhEAgHAAAAAAAAAAAA');
        open('http://fumen.zui.jp/?d115@vhEAgHAAAAAAAAAAAA');

        open('http://fumen.zui.jp/old/115/?v115@vhEAgHAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/115/?m115@vhEAgHAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/115/?d115@vhEAgHAAAAAAAAAAAA');

        open('v110@7eEA4GAAAAAAAAAAAA');
        open('m110@7eEA4GAAAAAAAAAAAA');

        open('http://fumen.zui.jp/old/110/?v110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110a/?v110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110b/?v110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110c/?v110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110d/?v110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110e/?v110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110f/?v110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110g/?v110@7eEA4GAAAAAAAAAAAA');

        open('http://fumen.zui.jp/old/110/?m110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110a/?m110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110b/?m110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110c/?m110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110d/?m110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110e/?m110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110f/?m110@7eEA4GAAAAAAAAAAAA');
        open('http://fumen.zui.jp/old/110g/?m110@7eEA4GAAAAAAAAAAAA');

        open('http://harddrop.com/fumen/?v115@vhEAgHAAAAAAAAAAAA');
        open('http://harddrop.com/fumen/?m115@vhEAgHAAAAAAAAAAAA');
        open('http://harddrop.com/fumen/?d115@vhEAgHAAAAAAAAAAAA');
    });

    it('Open modal: Unsupported', () => {
        visit({});

        // モーダルを開く
        operations.menu.openPage();

        openError('v105@7eEAAAAAAAAAAAAAAA');
        openError('m105@7eEAAAAAAAAAAAAAAA');

        openError('http://fumen.zui.jp/old/105/?v105@7eEAAAAAAAAAAAAAAA');
        openError('http://fumen.zui.jp/old/105a/?v105@7eEAAAAAAAAAAAAAAA');
        openError('http://fumen.zui.jp/old/105b/?v105@7eEAAAAAAAAAAAAAAA');

        openError('http://fumen.zui.jp/old/105/?m105@7eEAAAAAAAAAAAAAAA');
        openError('http://fumen.zui.jp/old/105a/?m105@7eEAAAAAAAAAAAAAAA');
        openError('http://fumen.zui.jp/old/105b/?m105@7eEAAAAAAAAAAAAAAA');
    });

    it('Error -> success', () => {
        visit({ lng: 'ja' });

        // モーダルを開く
        operations.menu.openPage();

        // 入力に失敗するパターン
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                cy.get(datatest('btn-open')).should('have.class', 'disabled');

                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('hello world');

                cy.get(datatest('btn-open')).should('not.have.class', 'disabled');
                cy.get(datatest('btn-open')).click();

                // Assertion: エラーメッセージ
                cy.get(datatest('text-message')).should('contain', 'テト譜を読み込めませんでした');

                cy.get(datatest('btn-open')).should('have.class', 'disabled');
            });

        // 入力に成功するパターン
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('v115@9gi0EeR4Rpg0DeR4wwRpglCeBtxwilDeBtwwJeAgHv?hERmBuqBMrBXsBAAA');

                cy.get(datatest('btn-open')).should('not.have.class', 'disabled');
                cy.get(datatest('btn-open')).click();
            });

        // Assertion: モーダルが閉じられている
        cy.get(datatest('mdl-open-fumen')).should('not.exist');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 6');
    });

    it('Cancel', () => {
        visit({ lng: 'ja' });

        // モーダルを開く
        operations.menu.openPage();

        // 入力に失敗するパターン
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('hello world');
                cy.get(datatest('btn-open')).click();

                // Assertion: エラーメッセージ
                cy.get(datatest('text-message')).should('contain', 'テト譜を読み込めませんでした');

                cy.get(datatest('btn-open')).should('have.class', 'disabled');
            });

        // キャンセル
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                cy.get(datatest('btn-cancel')).click();
            });

        // Assertion: モーダルが閉じられている
        cy.get(datatest('mdl-open-fumen')).should('not.exist');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');

        // モーダルを開く
        operations.menu.openPage();

        // 全てが消えている
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                cy.get(datatest('btn-open')).should('have.class', 'disabled');
                cy.get(datatest('input-fumen')).should('have.text', '');
                cy.get(datatest('text-message')).should('have.text', '');
            });
    });

    it('First page/Last page', () => {
        visit({ fumen: 'v115@vhG2OYaAFLDmClcJSAVDEHBEooRBKoAVBU3TWCpXBA?AVqBTfBSwBJnBMmBAAPAA' });

        operations.menu.lastPage();

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '7 / 7');
        cy.get(datatest('text-comment')).should('not.have.class', 'green darken-1');

        operations.menu.firstPage();

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 7');
        cy.get(datatest('text-comment')).should('have.class', 'green darken-1');
    });

    it('Empty v110', () => {
        visit({});

        // モーダルを開く
        operations.menu.openPage();

        // 入力に成功するパターン
        cy.get(datatest('mdl-open-fumen')).should('be.visible')
            .within(() => {
                // テト譜を開く
                cy.get(datatest('input-fumen')).clear().type('v110@7eAA4G');
                cy.get(datatest('btn-open')).click();
            });

        // Assertion: モーダルが閉じられている
        cy.get(datatest('mdl-open-fumen')).should('not.exist');

        // Assertion: ページ番号の確認
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 1');
    });

    it('Long', () => {
        const page = pages(1826);

        visit({
            fumen: 'v115@vh/xOY7cFLDmClcJSAVDEHBEooRBJoAVBzuHgCsn9V?Cq+ytCan/wCauTWCqSFgC0HUWCKtrgCpOmFDzyCMCKdFgCs?XmPCJHUPCaNmFDPe/VCUNstCPezPCUeLuCKHWWC6/VWCPdF?gC6OUPCTejxCpintCvSFgCKNmFDzeFgCsfjWCzXmPCP+lPC?J9KWCaujFDMn/wCpirgCKNWxCsnltCvPNFDKHWWCzOstCpf?rgC0PltC6ySgC6vLMCs+CMCz3/VCUXNFD0intCvXExCKd9w?CvPltC6izPCv+LMCMubgC6/VWCUNUFDpvSgCadNPC0yTxCq?nFgCMezPC0yytCa+rtCUn3LCsXegCKdNFDMt/wCvXExCJ3j?PCz3/wCvSNFDp/9tCvCmPCauTWCvnNPCv+TWCT+dgCqXExC?s33LCPNmFDM3jPCJ3jFDqCOMCM3jFD0PNFDU9CMCsvaFD0i?3LCTubgCqXWWCauytCsuPPCMNegCa+dgCpfjWCTujPCs+aF?DPNmPCa+DWC6+jPCJ3aPCpX+tCMnzPCUuTWCpfrgC0yTxCz?PNFDvybgC6i/wCpvTxCP+TFDMtrgCp/NMCv+jFDqi3LCsXe?gCTn/VCT+lFDMeHgCzujWCpHcgC0/NMCz3/VCvXWWCvvLMC?an/wCMujFDzeFgCqyjPCpurgCM9KxC6P9VC0frgCMdFgC0S?ltC6fjxCMn3LCzSNFDzuHgCKX9wCMtLuC6e9VCvf3LCsHUx?CvXMgCKd9wCPt/wCpXstCqX8LCv+TWCvnNPC0vCMCs+jFDp?uHgCaN8LCa3TxCsvTxCs3HgCpSNFDKH+tCp3ntCUHExCadF?gCqyjFDvSNPC0XegCJNUPCvuPFDzSltCaHmPCM+VWCPtbMC?K9KWC0fbMCUd9VCvfzPCpHLxCMt/VCUdFgCan/VCa+9tCzX?UPCP+lPCPNWWCaONFDU3jPCsu/VCJ9aFD6vLMCs+ytC0fbM?CMn/VCz+aFDpvaFDJNWWCv3/VCUujFDPe/wCM9KxCKdNFDs?XMgCK+9tCzeFgCsfzPCM9CMC03LuCseFgCq3/wCPuTWCzu/?VCaXltCvXExCK+LgCp/9tC6uHgCpHUWCvOstCKebMCTHmPC?sXstCJnzPC0/dgCpyjFDKuaFDMNmFDUdNPCMXltCsuzPCv+?bgCpfjWCM9aFDqeNPCaHExCJ9jFDvCOMCKX9VCKtjxC03Hg?CT+TFD0intCJHMgCKtjxCp/NMCPNUFDJtjWCUnPFD0SNPCP?9KWC0HkPCp+aFDMt3LCpXmPCzyKWCKNegCaejxCMuytCK+r?tCUnzPCpvKxCMtjxCvi3LCzX8LCzXegCqvytCUejWCMNmFD?PentCs/NMCa3aFD0P9VCTnLuCqCOMC6OstCJnPFDqybgCU+?dgC6vLMCsiLuCKX9wCM3TxCae3LCzXWWCKHOMCPtjWCKePF?DMNegC0vCMCMtLuCvfjxCM+TPCvubMCzHLxCKd9VCMdNFDq?+KWCqHDMCzeNFDvyTxCq3ntCMX9wCvHUWCUe/wCan3LCzC8?LCvHkPCUnbMC0intCPNmFDp/rtC0P9VCv3bMC0ybgCKNMgC?puPFDM+9tCqHLxCv/rtCae/wCPdNFDMeHgCzijxCpyKxCKt?jxCa9KWCKuLMCs/dgCaujFDUn/VCaXltCqC+tCK+VWCvnNP?CviLuC0X8LCz/dgCqXegCT+TFDTHOMCsf3LCM3jFD0fbMC0?ybgCpHcgC0intCqSFgC6eNFDq+ytCsvTWCUergCqXWWCTuC?MCaNmPCMn/wCJHUFDz/dgCT+TFDzyCMCqXWxCvSNPCzXWWC?KuytCaHExCzfbMCPNExCae3LCaHUPCUdNPCU9aFDsHMMCsu?HgCMe/wCa3TxCvHUWCKO9VCK9aFDUHmFDMujPCsvjFDp+aP?CM+dgCz3jWCKubgC0O8LCvfLuCqHcgCU+7LCzvaFDsuLuCP?+VWCqCmPCPujFD6vTWCUuaFDM3jPCp+TWCK+lFDPtjWCpvK?xCqOstCpHbFDJtHgC0C8LCa3TxCq+jPC6yCMCJHstC0fjWC?J3jPC6eNPCMNegC6/VWCTergCzvKxCMeLuCvizPCp+KWCzf?bMCUuTxCqHLWCJ3jFDsuntCpCmPCvX+tCJHUPC6eFgCsvjF?Dv33LCs+LMCv/lFDzyCMCs3ntC0CegCpvjFDJNWWCv3/VCJ?tPFDvOUPCU9CMC6OUPCaXltCznNPCs+ytCpHLxCqyytCpij?xCK9aPC6e9VCvPltCsubMCUHUPCa9TWCv3/wCpvaFDp+TWC?sXmPCPd9wCKdFgCsXMgCqndBAXsB+tBFiB6eBMrBxpBykBz?gBWcBTaBPWBUSBdoBGcBlsB8sBZkBPlB6oBuiBShBTVBTLB?NbBMXB/RBpUBeUBfNB0IByGBT8A9FBlJB0HBfDB5JByBBpD?BT3Am4AJnBTDBKBBMZBXPBFOB+MBzGBSUBJnBMXBXeB2VBF?dBzdBpZB0VB6bBOXB3MBKLBXHBvh/lBBJPBT3AWOBMDBpFB?FYB/MBuYBMKBTJBK8AU9AFIB+IBqJBTFB/8AJnBzWBNRBUN?BSUBlGBXKBJnBGcB8YBxWB6UB+MBNNBTQByLB3BBTFBZ3AG?DBVTBcJBXEBXDBNCBTFBSAB58AWIBMABf+A6+AM8ANyAzuA?J4Au/A9oAZ/AuOBPTBiMBzOBpPBPTBURBvh/MUBTTBWMBKC?BZLBFSBMUBTGBuTB3SBK8A9CBFNBSPBJnBXZBTcB8TBpKBU?SBGNBzQBtJByLB3BBWIBi8AX5AJnBmXBMZBFdBzdB2fBpUB?PdBsVBlbBzdBqbBTXBcaBXUBOQBCPBRSBTFBRNB/CBdRB2Q?BMNBFTBCUBzMBJnBUeBibBGZB/kB9aBcQByWBTMBvh/WUBF?iBpcBfSBTUBWPBZHBfIBcQBFTBcQB6SBTPB+FBNGB5EBSIB?PCBX+AJnBTMBOUBUIBCKBNLBXCBSFB9DBJnB2RBTQBMPBTG?B0HBvIBuOBJnBaUB1RB/CBWWB9NBpPBMDBa/Az4AMzAOQBp?7AFYBT5Aa6AXvA8pAZuAPrAKfAzaAmQBNdBqdBJUB8JBTVB?vh/+VBNLBpKB8OB/LBvKB6GBlOBWTBTJBSIB9KBMDBzGB/C?B2JBZLBXNB+UBMKBTQBKGBlTBURBRSBWKB9YBRdBTPBybB/?RBlVBUSB+QBZGBSPBPHBMFBzHBuEBT3AFTBpSBKHBfIBvDB?JnBVZBGPB8MByQBFTBTQBSUBUMBpNBzHBOGBHCBMKBy8AT+?At4AuJBvh/JnBzOBvIBsGBOGB6PBtEBvABJnBzSB3LBiGBl?RBMSBuRBpPBFYBXNB8YBzQBZLBWMBT8AKCBFTBMZB+NBqHB?Z+AX9A3zAZ3Au3A8TBtJB6KBT7AJnBTFBPYBcdBCdB2aBeX?BSZBFdBXZBTPB0aBpXB9bBzQB5OBOQBdSBUHBvIBiBB59A+?FBfABy8AFEBTDBvh/TAB38AM5Au4AM3AZoAazAF/ASFBM0A?X7AuzAF6Az3Az6A2yAp2A0oAJnBfFBqCBFJBTIBmBB09Ap5?A3qAd5AJnB+ZBqTBMPBTLBFHBiBB33AXFBWABl9AZyAT7A0?4ACzAT0AE/ACABX0A+2AJnBNHB/GBFOBzOBWNBSKBUDBJnB?/aBMUBSSBJRBzHB9QBZBBvhdzBBFYBGNB8YBvPBSIBeCB5J?Bq9A+8A9FBT5AX7A81AO3A6xAToAJnBNHBUDB34Ay3A+/AT?2A3tA9+AM0A6zAJnBM+AofAtHeAtGehlGeQ4wwGeQ4AeQLB?eAPBeRpRLAewwQpwwAeg0BexhwwAegWCeRaRphWRaAegWgl?DewSRaBeQpwwBewhDeQpAegWDeRaAegHgWAeQLGeglAeQah?HiWAeQawDQLJe3zAvhFTABZ3Au3AFJBZiB9dBfgwhh0R4At?FewhAewSBewwCewhAeQLDeRpglAPAewwxhAewhRaRphWRaA?egWglAehHRLBPAeBPgWTeUUBvhEvPByLBTBBMIBuHB3fRpA?eh0AtFeglAegWCeQ4AeRaCeAPCeQ4QaBtwhQpAtAeAtwSCe?whAewSBewhAewSAewhAeQLDeRaglAPAewwxhAewhRaRphWR?aAegWglAehHRLBPAeBPgWdeFJBvhFiCBT8AW+AvKB5EBTyA?ZfRpKeg0Jeh0AewhDeglBPgHBeQ4DeCtCeQ4DegWEegWQpw?wwhCeAtxSAewhAeQLDeRaglAPAewwxhAewhRaRphWRaAegW?glAehHRLBPAeBPgWneOzAvhE97AKvAJTBXFB84AdfAtHeAt?JegWEeRpg0glDeR4EeglAeQ4AegWDeBtAegHgWCeCPgHBeg?lDeCtCeglDegWEexSgWgHBPAeQaxDxec/AvhDt+AZ3ATABe?9AjfwhKeg0AeAtHeAtAewwBeRpglQpAehlwhAewhhlBeCPg?HBeglDeCtCeglDegWEexSgWgHBPAeQaxD7e36AvhDv2Au3A?JJB6HB5fhlDeQ4Aewhg0AtFeQ4DeAtBeQ4BeglwSAPAegWA?ewhgHAegWxSiWAeRawDQLFfcEBvhET3AN+Av7AKzATtAPfR?pglOeQ4DeglwwDeQ4EewwAeAtBegWQpAtBeQLAtGeQaBeQp?BeglwSAPAegWAewSgHAegWxSiWAeRawDQLPfc1AvhEtuAGx?ASsAl0AO1AVfh0AeglCewwCeAPglAeRpglAewwBeCtgWQpA?twSBehWxhDeQaBeQpBeglwSAPAegWAewSgHAegWxSiWAeRa?wDQLZfMnAvhFzoAZjAfqAqeAp5AzuAQfglAeRpEewhHeAtB?eglAtwSCeAtBexhAeQ4Aeh0AegWCegWCeAPgWAeQaxSQLwD?AegHiWjfapAvhDZeA/fAcwAtqAnewhAeQ4JeQ4GeglQLBew?wGeAPQpAewwAtHeQaBeAtCeAtwSQLAeAPAtBexhAeQ4Aegl?g0AegWCegWCeAPgWAeQaxSQLwDAegHiWtfMnAvhC+iAalAl?rA6eg0whAeQ4hlHewwDeg0BeglQLAegWAeAtwwhWAexhAeQ?4AeglwhAegWCegWCeAPgWAeQaxSQLwDAegHiW3fThAvhEpq?AmmA6oA3kAxmA+eR4AezhhlQ4AewDAezwQaBeQLglAexSDe?QLwwgWxhglhWQahWwDAeQaAPQLBPBgUXAvhFfYA2eA9lAek?ATeARgAxeRpg0zhQ4EeRaRpAeQ4AeRpCeAPAewSBeQLBPQ4?AewhAewhwSAtQahWwDAeQaAPQLBPLgTPAvhD6iAFlA0kAXm?A7eRpDeR4DeBtAeQ4AewDBexSBPAexDYgPaAvh/MgAVnA6f?AZUAGiAOgATdASaA0PA3XAFhApdAUgAihAzcAmeA3VABgAT?ZAlgATiA+hAPfAZUA8aAlgA/UA+iAqgAyhAUXApOAFfAzcA?XbACOATPARXA2kAlfAcfATbAJcA2ZACXAFdAUYARfA/aAGY?AleAMgATeAXbAKUAUVAzXAJcA3bA6iAlZAGcAlfAXgAvh/K?ZAUaAmhAzXARbAyWA0PApdAWiATYAvbAlfAxjAWdA3aAUTA?TZAFhAiZA0gAPcApTAzVAFfAKeA2mAUbAzcAXXApOAmSAFf?A0eASlANZARcA/PAzSAmaAzWAFfAGdAUaAykASiARlAXhAM?dA3XAzeAOeANgA6fAlgAxjASnATeAMdAXhAubAnXATUAZaA?tfAvh/agA2jA0fApdA/ZA9gAJdAThA+hAUfA2ZARgASaATd?AccAFgA3gA+iAyhAyjA3ZAZPAzWA8XAFgAGfA6dATXAMVAF?bA5UA3bA0cAvdAOgAafATXA9YAuWAzPAXOAtaAZZAiZAxbA?xXAsPA9VATWAUSAOUAfYA6YAdgAGfAieAXhAxZATdAUWAUX?A2ZARXASdAvh/FgAXgAXfATeA+iA8hAxfASYATUA2aAFcAX?YASgATUA1aAURAmPATOApNAJcA0gA3fAKeAzZAUdAGYA9bA?lVAKPAJcAXfAThApdAsZANUAaiAXTAugAzRAdbAufA/cA0Z?AKdAcaA6YATUAmPApSAFgA3gAPcAFgAxjATiACdAxeA2ZAO?cA0PA/QATTAxRAFbAvh/MgASnA0fAXdACYAZZATOAmgAtZA?0aAOcA9bATXA/aAabA5OAleAugAKeAseAzaAvcAvWATUAUQ?AJdAiZAGdARbAlbAyZA5VATRAlhA+iAMYA3ZAlhAuhAZZAz?ZAXbA0SA6VAdhATgAviAGYAKZApOAZKAXfA8ZANhAGgAzcA?CaAMgAahAZWAzcAXXAGfA0eAvh/9fA2eATiARaACdAlgAMh?A2eA/UATdA0aAxXASTAlbAUaAfbANXAXQApbAagAWiAZZAT?YA6bAtZAMcA3aAzbANiA2jA/eApdATfA8hAigASmA/eATfA?MdAecAOgAthAWkAUfA5YATgAFcAadAvaAfWA0RAZZAzXAyV?AlZAGYAJXATVA6bAWYA/eAUYA9eARlAvh/MeAGdAzbAXWAZ?PA6KAVYAMSAFVAifAviA2kAzaAiVATPAGYAHcAxXA1VApbA?UdA2eAZWAFhA/eATfAscAqgApdA0ZA/aASYATPAFcAUQAFb?AahAOiAGhAZUAfgAzeASnAzcAUgA9bAGYA3VAlUAJcATiAK?eAUfAfgAmVApbAkUAZcAuhA9iA3bAyeAKUAzPAvh/uaAlhA?TiA0bAvYA8VAlcAyeA5cAzbAvdAuZAZUApOAXXAlaAzXAsb?AGaAyUARSATKAFWAagA+iA3hAsgAzXAKZAGTARaA3QAsPAl?WAZPAXXAifAMgATdAuZA+XATTAlaAtfAXaA0gAihApYA3bA?tZAUQAzXAiSAZZAHgAieAWlA+iAxeA8hAzgATUAUXAFbAvh?/OaARcASiA3UATTAUSAFWAOUACYAVaAZbAXcAUYAKUAvWAl?aAzZAGdA5aA2ZASdAvbA0PAzSAJcA9dAzUAsgAOUAlfA/hA?6fAZbAMdA/XAKPATQApbAFiACfATgA+iA3hA1jA0fAZUAOh?AHdARaAUSA9gAWlATiA6eAlcATPAvYAMbAZaA6fApYAuhAM?gAKUAvh/PTA2aAzQAtPAFXAGWATTACOAZKAfQAPSA0QATOA?mQAlKASSAJcAylAsbATZAWiAMWAlfAPfAUiAZUAzPAGdAPX?AlaASiAZWAycAvTA5aA2jA0ZAThACcAGYAcSAzPAlaAZUAv?gAlbA5aAzZAUWAaiAvYA2UA8NAFXA/UAaVAzWAeWApdA9dA?TcAvbAyZA1XAvh/UOA+PAlRA5aATfAOeAUgAviAiaApTAKU?AzPARWAsXA2PAFhAXhAzfA0cARaACRA+YAtgAXdAXWAzeAM?VAZZAuUAiKAFcAXiANhAugAagAzhAxZAUWAUXAdYAyUA5dA?TeAviA+hA3gAyZApTAlfAWlAMbATZAJYAFhA3fA2eAahA0U?AzVA9YAzRAmPAXOA0LAvh/pcA2lAKeAzZAvdApWA8aAlhAp?YAuhAzSA3aAKZA6UANVAURAJcASiATZA9gA3aAmUA0QAUXA?FYATUASdAXTA+WAxPAJcAykA3hA2jAzgA0fAlZAfbA0cA9W?ATPAmXAiQApdATZApdAXbAeiAcaAdhA3WA2ZARVAlcACiAS?nATeARhA2lATfASnAMdAXhAMgAvh/dfAiWApaA3UA8XANPA?mWAGXAUVAzQA9YAXYAZZAzbAseACiAXgATYAxaAleAucAah?AGTAKZAzZAPXAJKAtfA+aAUXAUYAtZAZbAvdATXAiaApbA0?aAvdAleAThAGdA3eAiZAWgAigAxjAUgATiAdhAUWA5cA+dA?zWAfYAKeAFfA/eAebAKPApTAdYAzWAOfAvh/UaA0aAyVA3c?AlbAxcATTAsWA/ZA5XAVfAueATdAOeAqfApOAzSAKPAcVAv?gAdhA2cAzZAngAxZAFgA0hAfgAyeATUAKdApTAuXAsbAFVA?FbAiZAzXA2UA/KAsgApTAiXAuWAFgAzXA/fA0PAzRA6VAZb?AXaAWnAUdAJXAFgATbACaA9dA8XA3RAZZA2eAsfAvh/pYAz?WAucACfAXWA1ZAmcANfAxhATYA3bA8aAsZAvXAZZA6gASiA?9eA2cASYAZPATRAlfA+fAzeAXiA0ZATYAMbA/aAKPAFhAuh?ApTA6UAeTAXbATVAURAJcAVmATZANfACiAxZAEgAvgASiA2?ZAGVAMYAxWAXTAFcA2eACYATbA9aATRA/UAJcAcfASnAmgA?vh/0cAxaATYAleA3cACfA9YATbAWaAMXA3RAZZAmeAMdA3X?ANbAzRAyZApJA3PA5aAzhA0fAicA+bAtZA0VAXTAZZATZAS?dAmfAFhASlAmeAzaAZPAXdAFcAcaAuZAMbA/PAKdAFhAThA?pdAUcAKfAfdATTAZKAFgAXgACfAWfAmaARVAMhATdAtgAUh?ASnAXdAvh/xjATZA+aAmUANgASdAFhAXhAMdAZUAzZA8XA3?bA5VAzUAOgAqXA6dAxZANhATTA3bAEgA2jAleA1kA3cAkgA?GiAzgARkAxcAieATZA/fAtbAGVASdAyXAcPAZbAviAThA2k?A0aApTANZA6gA3hA2lAzcA0eAmZA1UASYAXOA5aAlgATbAc?UAOcATaA3bASiAvh/ZUAUaAfbAzUAFdAUWA+TAxQAFXATUA?ycAShAmgAUfAxmA3gAZZAtZA/cA+dAlfA0fAyZATPApTAvg?AzWA8VAaiAthA3fAOiAChARaA2eAFhATiA1jA0fAXVATYAp?cAOZAkgAVgAahATeASnAOhAHdA0fAxXATUAUbAOfA6gApdA?XfANeAJdAegAlVAkUAzgAvh/KKAzWA5cAPfASnAmUAXhAMd?AlXAlbACWAzfA2jA/ZA0fApdAvgAthAJcAaiAUfAGgASnAz?gAXdAWcAxXA0fAdbATeA2eAFfASnAXhAxjAzZAMdA6aAOZA?8XATbAdcApTAXVAsXAZPA3NACQAFbATbAOcAXaAUYATUAFg?AGdAigATaA3ZAxcAiUAxXAlgA0aAvhwvXATUA+YAOTAlbA0?fAxZAabA2UATOAvXApbA6hA1kAseAZUATYACVAlgAegA3cA?vYAMXASaATPAGOAURAZLAubATZA8aAlgARmAVhAfdACbAye?AsUAOUAVWAvYAzNAFXAGVAhQAJNADKASMAAAA',
            sleepInMill: 1000,
        });

        {
            // ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1));

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.Empty);
            [Piece.S, Piece.T, Piece.J, Piece.O, Piece.L].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
        }

        operations.menu.lastPage();

        {
            // ページ番号の確認
            cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', page(1826));

            // コメントの確認
            cy.get(datatest('text-comment')).should('have.value', '#Q=[S](Z)LOJZI');

            // Hold & Nextの確認
            cy.get(holdBox()).should('have.attr', 'type', Piece.S);
            [Piece.Z, Piece.L, Piece.O, Piece.J, Piece.Z].forEach((piece, index) => {
                cy.get(nextBox(index)).should('have.attr', 'type', piece);
            });
        }
    });

    it('Highlight when lock is on/off', () => {
        visit({ fumen: 'v115@pgI8AeI8AeI8AeI8AeI8AeJ8Jep5mvhApjB' });

        cy.get(block(0, 0)).should('have.attr', 'color', Color.Gray.Normal);
        cy.get(block(0, 1)).should('have.attr', 'color', Color.Gray.Normal);
        cy.get(block(0, 4)).should('have.attr', 'color', Color.Gray.Normal);
        cy.get(block(0, 5)).should('have.attr', 'color', Color.Gray.Normal);

        rightTap();

        cy.get(block(0, 0)).should('have.attr', 'color', Color.Gray.Highlight1);
        cy.get(block(0, 1)).should('have.attr', 'color', Color.Gray.Highlight1);
        cy.get(block(0, 4)).should('have.attr', 'color', Color.Gray.Highlight1);
        cy.get(block(0, 5)).should('have.attr', 'color', Color.Gray.Normal);
    });

    it('Page Slider: Readonly', () => {
        visit({ fumen: 'v115@vhJTJJ+NJ3MJVQJ0GJXDJFCJuFJT/IJFJ' });

        operations.menu.pageSlider();

        dragNDrop(2);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 10');

        dragNDrop(5);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '5 / 10');

        dragNDrop(10);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '10 / 10');

        dragNDrop(8);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '8 / 10');

        leftTap();
        cy.get(datatest('range-page-slider')).should('have.value', '7');

        rightTap();
        cy.get(datatest('range-page-slider')).should('have.value', '8');

        dragNDrop(1);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 10');
    });

    it('Page Slider: Writable', () => {
        visit({ fumen: 'v115@vhJTJJ+NJ3MJVQJ0GJXDJFCJuFJT/IJFJ', mode: 'writable' });

        operations.menu.pageSlider();

        dragNDrop(2);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '2 / 10');

        dragNDrop(5);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '5 / 10');

        dragNDrop(10);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '10 / 10');

        dragNDrop(8);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '8 / 10');

        operations.mode.tools.backPage();
        cy.get(datatest('range-page-slider')).should('have.value', '7');

        operations.mode.tools.nextPage();
        cy.get(datatest('range-page-slider')).should('have.value', '8');

        dragNDrop(1);
        cy.get(datatest('tools')).find(datatest('text-pages')).should('have.text', '1 / 10');
    });

    it('Ghost: readonly', () => {
        visit({ fumen: 'v115@RhD8FeE8OeRsHWeTaUhSsHOegWGeiWVhTnHNexSHex?SVhUnHMeBPIeBPVhVsHNeQLHeSLVhWsHMegHIeiHVhXnH' });

        operations.menu.ghostToggle();

        {
            operations.menu.firstPage();

            mino(Piece.I, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.I.Lighter);
            });

            rightTap();

            mino(Piece.L, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.L.Lighter);
            });

            rightTap();

            mino(Piece.O, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.O.Lighter);
            });

            rightTap();

            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.Z.Lighter);
            });

            rightTap();

            mino(Piece.T, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.T.Lighter);
            });

            rightTap();

            mino(Piece.J, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.J.Lighter);
            });

            rightTap();

            mino(Piece.S, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.S.Lighter);
            });
        }

        operations.menu.ghostToggle();

        {
            operations.menu.firstPage();

            mino(Piece.I, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.I.Lighter);
            });

            rightTap();

            mino(Piece.L, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.L.Lighter);
            });

            rightTap();

            mino(Piece.O, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.O.Lighter);
            });

            rightTap();

            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Z.Lighter);
            });

            rightTap();

            mino(Piece.T, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.T.Lighter);
            });

            rightTap();

            mino(Piece.J, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.J.Lighter);
            });

            rightTap();

            mino(Piece.S, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.S.Lighter);
            });
        }
    });

    it('Ghost: writable', () => {
        visit({
            fumen: 'v115@RhD8FeE8OeRsHWeTaUhSsHOegWGeiWVhTnHNexSHex?SVhUnHMeBPIeBPVhVsHNeQLHeSLVhWsHMegHIeiHVhXnH',
            mode: 'writable',
        });

        operations.menu.ghostToggle();

        {
            operations.menu.firstPage();

            mino(Piece.I, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.I.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.L, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.L.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.O, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.O.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.Z.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.T, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.T.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.J, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.J.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.S, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('not.have.attr', 'color', Color.S.Lighter);
            });
        }

        operations.menu.ghostToggle();

        {
            operations.menu.firstPage();

            mino(Piece.I, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.I.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.L, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.L.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.O, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.O.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.Z, Rotation.Spawn)(4, 1).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.Z.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.T, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.T.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.J, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.J.Lighter);
            });

            operations.mode.tools.nextPage();

            mino(Piece.S, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.S.Lighter);
            });
        }
    });

    it('Ghost: draw', () => {
        visit({
            fumen: 'v115@RhD8FeE8OeRsHWeTaUhSsHOegWGeiWVhTnHNexSHex?SVhUnHMeBPIeBPVhVsHNeQLHeSLVhWsHMegHIeiHVhXnH',
            mode: 'writable',
        });

        operations.mode.block.open();
        operations.mode.block.Gray();

        {
            operations.menu.firstPage();

            mino(Piece.I, Rotation.Spawn)(4, 2).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.I.Lighter);
            });

            operations.mode.block.click(3, 2);

            mino(Piece.I, Rotation.Spawn)(4, 3).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.I.Lighter);
            });

            operations.mode.block.click(4, 10);

            mino(Piece.I, Rotation.Spawn)(4, 11).forEach((block) => {
                cy.get(block).should('have.attr', 'color', Color.I.Lighter);
            });
        }

        operations.mode.tools.home();
        operations.mode.piece.open();

        operations.mode.block.click(5, 11);

        mino(Piece.I, Rotation.Spawn)(4, 11).forEach((block) => {
            cy.get(block).should('not.have.attr', 'color', Color.I.Lighter);
        });

        operations.mode.block.click(6, 11);
        operations.mode.block.click(5, 12);
        operations.mode.block.click(6, 12);

        mino(Piece.O, Rotation.Spawn)(5, 0).forEach((block) => {
            cy.get(block).should('have.attr', 'color', Color.O.Lighter);
        });

        operations.mode.piece.spawn.Z();

        operations.mode.block.click(4, 18);

        mino(Piece.Z, Rotation.Spawn)(4, 11).forEach((block) => {
            cy.get(block).should('have.attr', 'color', Color.Z.Lighter);
        });

        operations.mode.block.click(4, 12);

        cy.get(block(3, 12)).should('have.attr', 'color', Color.Z.Lighter);
        cy.get(block(4, 12)).should('have.attr', 'color', Color.Z.Highlight2);
        cy.get(block(4, 11)).should('have.attr', 'color', Color.Z.Lighter);
        cy.get(block(5, 11)).should('have.attr', 'color', Color.Z.Lighter);

        operations.mode.piece.resetPiece();

        mino(Piece.Z, Rotation.Spawn)(4, 11).forEach((block) => {
            cy.get(block).should('not.have.attr', 'color', Color.Z.Lighter);
        });
    });
});

