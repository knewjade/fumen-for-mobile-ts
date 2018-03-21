import { Piece } from './lib/enums';
import { app, View, VNode, VNodeChild } from 'hyperapp';
import { button, div, footer, main, span } from '@hyperapp/html';
import { action, Actions, actions } from './actions';
import { initState, State } from './states';
import { decode } from './lib/fumen';
import * as Konva from 'konva';

interface Component<Props> {
    (props: Props, children?: VNodeChild<object | null>[]): VNode<object>;
}

class HyperStage {
    private stageObj: Konva.Stage | undefined = undefined;
    private layerBuffer: Konva.Layer[] = [];

    addStage(stage: Konva.Stage) {
        this.stageObj = stage;
        while (0 < this.layerBuffer.length) {
            this.stageObj.add(this.layerBuffer.pop()!);
        }
    }

    addLayer(layer: Konva.Layer) {
        if (this.stageObj !== undefined) {
            this.stageObj.add(layer);
        } else {
            this.layerBuffer.push(layer);
        }
    }

    destroy() {
        if (this.stageObj !== undefined) {
            this.stageObj.destroy();
        }
    }

    resize({ width, height }: { width: number; height: number }) {
        if (this.stageObj !== undefined) {
            this.stageObj.setWidth(width);
            this.stageObj.setHeight(height);
        }
    }

    get stage(): Konva.Stage {
        if (this.stageObj === undefined) {
            throw new MyError();
        }
        return this.stageObj;
    }
}

// === メイン ===
export const view: () => View<State, Actions> = () => {
    const hyperStage = new HyperStage();
    const gameImpl = game(hyperStage);
    const fieldImpl = field(hyperStage);
    return (state, actions) => {
        return div({
            style: {
                display: 'flex',
                minHeight: '100%',
                flexDirection: 'column',
            },
        }, [
            gameImpl(state, actions),
            fieldImpl(state, actions),
            footer({
                style: {
                    flexBasis: '50px',
                    marginTop: 'auto',
                },
            }, [
                span(state.comment + state.count),
                div({
                    className: 'page-footer',
                }, [
                    button({ onclick: () => actions.up(1) }, 'up'),
                ]),
            ]),
        ]);
    };
};

export const game: (hyperStage: HyperStage) => View<State, Actions> = (hyperStage) => {
    const BOX_SIZE = 25;

    const width = window.innerWidth;
    const height = BOX_SIZE * 24;

    return (state, actions) => {
        return main({
            id: 'container',
            style: {
                flex: '1 0 auto',
            },
            oncreate: (container: HTMLMainElement) => {
                // この時点でcontainer内に新しい要素が作られるため、
                // この要素内には hyperapp 管理下の要素を作らないこと
                const stage = new Konva.Stage({
                    width,
                    height,
                    container,
                });

                hyperStage.addStage(stage);

                const hammer = new Hammer(container);
                hammer.get('pinch').set({ enable: true });
                hammer.on('tap pinch', (ev) => {
                    console.log(ev);
                    actions.up(1);
                    toggle();
                    // container.textContent = ev.type + ' gesture detected.';
                });
            },
        });
    };
};

export const field: (hyperStage: HyperStage) => View<State, Actions> = (hyperStage) => {
    const layer = new Konva.Layer();

    const BOX_SIZE = 20;

    const rects: Component<RectProps>[] = [];
    for (let ix = 0; ix < 10; ix += 1) {
        for (let iy = 23; 0 <= iy; iy -= 1) {
            const rectObj = rect(layer, { ix, iy, py: 23 - iy, size: BOX_SIZE });
            rects.push(rectObj);
        }
    }

    hyperStage.addLayer(layer);

    return (state, actions) => {
        return div({
            key: 'field',
            style: {
                display: 'none',
            },
        }, rects.map(value => value({ state, off: actions.off })));
    };
};

interface RectArgs {
    ix: number;
    iy: number;
    py: number;
    size: number;
}

interface RectProps {
    state: State;
    off: (data: { x: number, y: number }) => action;
}

export const rect: (layer: Konva.Layer, args: RectArgs) => Component<RectProps> = (layer, args) => {
    const box: Konva.Rect = new Konva.Rect({
        x: args.ix * args.size + (args.ix / 2),
        y: args.py * args.size + (args.py / 2),
        width: args.size,
        height: args.size,
        stroke: 'white',
    });

    layer.add(box);

    return (props) => {
        return div({
            key: `rect-${args.ix}:${args.iy}`,
            style: {
                display: 'none',
            },
            value: props.state.field[args.iy * 10 + args.ix],
            oncreate: (container: HTMLDivElement) => {
                console.log('rect: oncreate');
                box.on('touchmove', () => {
                    props.off({ x: args.ix, y: args.iy });
                });
                const value = props.state.field[args.iy * 10 + args.ix];
                box.fill(getHighlightColor(value));
                box.draw();
            },
            onupdate: (container: any, attr: any) => {
                if (props.state.field[args.iy * 10 + args.ix] === attr.value) {
                    return;
                }
                console.log('xx');
                const value = props.state.field[args.iy * 10 + args.ix];
                box.fill(getHighlightColor(value));
                box.draw();
            },
        });
    };
};

function getNormalColor(piece: Piece): string {
    switch (piece) {
    case Piece.Gray:
        return '#999999';
    case Piece.I:
        return '#009999';
    case Piece.T:
        return '#9B009B';
    case Piece.S:
        return '#009B00';
    case Piece.Z:
        return '#9B0000';
    case Piece.L:
        return '#9A6700';
    case Piece.J:
        return '#0000BE';
    case Piece.O:
        return '#999900';
    case Piece.Empty:
        return '#e7e7e7';
    }
    throw new MyError();
}

function getHighlightColor(piece: Piece): string {
    switch (piece) {
    case Piece.Gray:
        return '#CCCCCC';
    case Piece.I:
        return '#24CCCD';
    case Piece.T:
        return '#CE27CE';
    case Piece.S:
        return '#26CE22';
    case Piece.Z:
        return '#CE312D';
    case Piece.L:
        return '#CD9A24';
    case Piece.J:
        return '#3229CF';
    case Piece.O:
        return '#CCCE19';
    case Piece.Empty:
        return '#e7e7e7';
    }
    throw new MyError();
}


const main2 = app(initState, actions, view(), document.body);

const data = 'vh/xOY7cFLDmClcJSAVDEHBEooRBJoAVBzuHgCsn9V?Cq+ytCan/wCauTWCqSFgC0HUWCKtrgCpOmFDzyCMCKdFgCs?XmPCJHUPCaNmFDPe/VCUNstCPezPCUeLuCKHWWC6/VWCPdF?gC6OUPCTejxCpintCvSFgCKNmFDzeFgCsfjWCzXmPCP+lPC?J9KWCaujFDMn/wCpirgCKNWxCsnltCvPNFDKHWWCzOstCpf?rgC0PltC6ySgC6vLMCs+CMCz3/VCUXNFD0intCvXExCKd9w?CvPltC6izPCv+LMCMubgC6/VWCUNUFDpvSgCadNPC0yTxCq?nFgCMezPC0yytCa+rtCUn3LCsXegCKdNFDMt/wCvXExCJ3j?PCz3/wCvSNFDp/9tCvCmPCauTWCvnNPCv+TWCT+dgCqXExC?s33LCPNmFDM3jPCJ3jFDqCOMCM3jFD0PNFDU9CMCsvaFD0i?3LCTubgCqXWWCauytCsuPPCMNegCa+dgCpfjWCTujPCs+aF?DPNmPCa+DWC6+jPCJ3aPCpX+tCMnzPCUuTWCpfrgC0yTxCz?PNFDvybgC6i/wCpvTxCP+TFDMtrgCp/NMCv+jFDqi3LCsXe?gCTn/VCT+lFDMeHgCzujWCpHcgC0/NMCz3/VCvXWWCvvLMC?an/wCMujFDzeFgCqyjPCpurgCM9KxC6P9VC0frgCMdFgC0S?ltC6fjxCMn3LCzSNFDzuHgCKX9wCMtLuC6e9VCvf3LCsHUx?CvXMgCKd9wCPt/wCpXstCqX8LCv+TWCvnNPC0vCMCs+jFDp?uHgCaN8LCa3TxCsvTxCs3HgCpSNFDKH+tCp3ntCUHExCadF?gCqyjFDvSNPC0XegCJNUPCvuPFDzSltCaHmPCM+VWCPtbMC?K9KWC0fbMCUd9VCvfzPCpHLxCMt/VCUdFgCan/VCa+9tCzX?UPCP+lPCPNWWCaONFDU3jPCsu/VCJ9aFD6vLMCs+ytC0fbM?CMn/VCz+aFDpvaFDJNWWCv3/VCUujFDPe/wCM9KxCKdNFDs?XMgCK+9tCzeFgCsfzPCM9CMC03LuCseFgCq3/wCPuTWCzu/?VCaXltCvXExCK+LgCp/9tC6uHgCpHUWCvOstCKebMCTHmPC?sXstCJnzPC0/dgCpyjFDKuaFDMNmFDUdNPCMXltCsuzPCv+?bgCpfjWCM9aFDqeNPCaHExCJ9jFDvCOMCKX9VCKtjxC03Hg?CT+TFD0intCJHMgCKtjxCp/NMCPNUFDJtjWCUnPFD0SNPCP?9KWC0HkPCp+aFDMt3LCpXmPCzyKWCKNegCaejxCMuytCK+r?tCUnzPCpvKxCMtjxCvi3LCzX8LCzXegCqvytCUejWCMNmFD?PentCs/NMCa3aFD0P9VCTnLuCqCOMC6OstCJnPFDqybgCU+?dgC6vLMCsiLuCKX9wCM3TxCae3LCzXWWCKHOMCPtjWCKePF?DMNegC0vCMCMtLuCvfjxCM+TPCvubMCzHLxCKd9VCMdNFDq?+KWCqHDMCzeNFDvyTxCq3ntCMX9wCvHUWCUe/wCan3LCzC8?LCvHkPCUnbMC0intCPNmFDp/rtC0P9VCv3bMC0ybgCKNMgC?puPFDM+9tCqHLxCv/rtCae/wCPdNFDMeHgCzijxCpyKxCKt?jxCa9KWCKuLMCs/dgCaujFDUn/VCaXltCqC+tCK+VWCvnNP?CviLuC0X8LCz/dgCqXegCT+TFDTHOMCsf3LCM3jFD0fbMC0?ybgCpHcgC0intCqSFgC6eNFDq+ytCsvTWCUergCqXWWCTuC?MCaNmPCMn/wCJHUFDz/dgCT+TFDzyCMCqXWxCvSNPCzXWWC?KuytCaHExCzfbMCPNExCae3LCaHUPCUdNPCU9aFDsHMMCsu?HgCMe/wCa3TxCvHUWCKO9VCK9aFDUHmFDMujPCsvjFDp+aP?CM+dgCz3jWCKubgC0O8LCvfLuCqHcgCU+7LCzvaFDsuLuCP?+VWCqCmPCPujFD6vTWCUuaFDM3jPCp+TWCK+lFDPtjWCpvK?xCqOstCpHbFDJtHgC0C8LCa3TxCq+jPC6yCMCJHstC0fjWC?J3jPC6eNPCMNegC6/VWCTergCzvKxCMeLuCvizPCp+KWCzf?bMCUuTxCqHLWCJ3jFDsuntCpCmPCvX+tCJHUPC6eFgCsvjF?Dv33LCs+LMCv/lFDzyCMCs3ntC0CegCpvjFDJNWWCv3/VCJ?tPFDvOUPCU9CMC6OUPCaXltCznNPCs+ytCpHLxCqyytCpij?xCK9aPC6e9VCvPltCsubMCUHUPCa9TWCv3/wCpvaFDp+TWC?sXmPCPd9wCKdFgCsXMgCqndBAXsB+tBFiB6eBMrBxpBykBz?gBWcBTaBPWBUSBdoBGcBlsB8sBZkBPlB6oBuiBShBTVBTLB?NbBMXB/RBpUBeUBfNB0IByGBT8A9FBlJB0HBfDB5JByBBpD?BT3Am4AJnBTDBKBBMZBXPBFOB+MBzGBSUBJnBMXBXeB2VBF?dBzdBpZB0VB6bBOXB3MBKLBXHBvh/lBBJPBT3AWOBMDBpFB?FYB/MBuYBMKBTJBK8AU9AFIB+IBqJBTFB/8AJnBzWBNRBUN?BSUBlGBXKBJnBGcB8YBxWB6UB+MBNNBTQByLB3BBTFBZ3AG?DBVTBcJBXEBXDBNCBTFBSAB58AWIBMABf+A6+AM8ANyAzuA?J4Au/A9oAZ/AuOBPTBiMBzOBpPBPTBURBvh/MUBTTBWMBKC?BZLBFSBMUBTGBuTB3SBK8A9CBFNBSPBJnBXZBTcB8TBpKBU?SBGNBzQBtJByLB3BBWIBi8AX5AJnBmXBMZBFdBzdB2fBpUB?PdBsVBlbBzdBqbBTXBcaBXUBOQBCPBRSBTFBRNB/CBdRB2Q?BMNBFTBCUBzMBJnBUeBibBGZB/kB9aBcQByWBTMBvh/WUBF?iBpcBfSBTUBWPBZHBfIBcQBFTBcQB6SBTPB+FBNGB5EBSIB?PCBX+AJnBTMBOUBUIBCKBNLBXCBSFB9DBJnB2RBTQBMPBTG?B0HBvIBuOBJnBaUB1RB/CBWWB9NBpPBMDBa/Az4AMzAOQBp?7AFYBT5Aa6AXvA8pAZuAPrAKfAzaAmQBNdBqdBJUB8JBTVB?vh/+VBNLBpKB8OB/LBvKB6GBlOBWTBTJBSIB9KBMDBzGB/C?B2JBZLBXNB+UBMKBTQBKGBlTBURBRSBWKB9YBRdBTPBybB/?RBlVBUSB+QBZGBSPBPHBMFBzHBuEBT3AFTBpSBKHBfIBvDB?JnBVZBGPB8MByQBFTBTQBSUBUMBpNBzHBOGBHCBMKBy8AT+?At4AuJBvh/JnBzOBvIBsGBOGB6PBtEBvABJnBzSB3LBiGBl?RBMSBuRBpPBFYBXNB8YBzQBZLBWMBT8AKCBFTBMZB+NBqHB?Z+AX9A3zAZ3Au3A8TBtJB6KBT7AJnBTFBPYBcdBCdB2aBeX?BSZBFdBXZBTPB0aBpXB9bBzQB5OBOQBdSBUHBvIBiBB59A+?FBfABy8AFEBTDBvh/TAB38AM5Au4AM3AZoAazAF/ASFBM0A?X7AuzAF6Az3Az6A2yAp2A0oAJnBfFBqCBFJBTIBmBB09Ap5?A3qAd5AJnB+ZBqTBMPBTLBFHBiBB33AXFBWABl9AZyAT7A0?4ACzAT0AE/ACABX0A+2AJnBNHB/GBFOBzOBWNBSKBUDBJnB?/aBMUBSSBJRBzHB9QBZBBvhdzBBFYBGNB8YBvPBSIBeCB5J?Bq9A+8A9FBT5AX7A81AO3A6xAToAJnBNHBUDB34Ay3A+/AT?2A3tA9+AM0A6zAJnBM+AofAtHeAtGehlGeQ4wwGeQ4AeQLB?eAPBeRpRLAewwQpwwAeg0BexhwwAegWCeRaRphWRaAegWgl?DewSRaBeQpwwBewhDeQpAegWDeRaAegHgWAeQLGeglAeQah?HiWAeQawDQLJe3zAvhFTABZ3Au3AFJBZiB9dBfgwhh0R4At?FewhAewSBewwCewhAeQLDeRpglAPAewwxhAewhRaRphWRaA?egWglAehHRLBPAeBPgWTeUUBvhEvPByLBTBBMIBuHB3fRpA?eh0AtFeglAegWCeQ4AeRaCeAPCeQ4QaBtwhQpAtAeAtwSCe?whAewSBewhAewSAewhAeQLDeRaglAPAewwxhAewhRaRphWR?aAegWglAehHRLBPAeBPgWdeFJBvhFiCBT8AW+AvKB5EBTyA?ZfRpKeg0Jeh0AewhDeglBPgHBeQ4DeCtCeQ4DegWEegWQpw?wwhCeAtxSAewhAeQLDeRaglAPAewwxhAewhRaRphWRaAegW?glAehHRLBPAeBPgWneOzAvhE97AKvAJTBXFB84AdfAtHeAt?JegWEeRpg0glDeR4EeglAeQ4AegWDeBtAegHgWCeCPgHBeg?lDeCtCeglDegWEexSgWgHBPAeQaxDxec/AvhDt+AZ3ATABe?9AjfwhKeg0AeAtHeAtAewwBeRpglQpAehlwhAewhhlBeCPg?HBeglDeCtCeglDegWEexSgWgHBPAeQaxD7e36AvhDv2Au3A?JJB6HB5fhlDeQ4Aewhg0AtFeQ4DeAtBeQ4BeglwSAPAegWA?ewhgHAegWxSiWAeRawDQLFfcEBvhET3AN+Av7AKzATtAPfR?pglOeQ4DeglwwDeQ4EewwAeAtBegWQpAtBeQLAtGeQaBeQp?BeglwSAPAegWAewSgHAegWxSiWAeRawDQLPfc1AvhEtuAGx?ASsAl0AO1AVfh0AeglCewwCeAPglAeRpglAewwBeCtgWQpA?twSBehWxhDeQaBeQpBeglwSAPAegWAewSgHAegWxSiWAeRa?wDQLZfMnAvhFzoAZjAfqAqeAp5AzuAQfglAeRpEewhHeAtB?eglAtwSCeAtBexhAeQ4Aeh0AegWCegWCeAPgWAeQaxSQLwD?AegHiWjfapAvhDZeA/fAcwAtqAnewhAeQ4JeQ4GeglQLBew?wGeAPQpAewwAtHeQaBeAtCeAtwSQLAeAPAtBexhAeQ4Aegl?g0AegWCegWCeAPgWAeQaxSQLwDAegHiWtfMnAvhC+iAalAl?rA6eg0whAeQ4hlHewwDeg0BeglQLAegWAeAtwwhWAexhAeQ?4AeglwhAegWCegWCeAPgWAeQaxSQLwDAegHiW3fThAvhEpq?AmmA6oA3kAxmA+eR4AezhhlQ4AewDAezwQaBeQLglAexSDe?QLwwgWxhglhWQahWwDAeQaAPQLBPBgUXAvhFfYA2eA9lAek?ATeARgAxeRpg0zhQ4EeRaRpAeQ4AeRpCeAPAewSBeQLBPQ4?AewhAewhwSAtQahWwDAeQaAPQLBPLgTPAvhD6iAFlA0kAXm?A7eRpDeR4DeBtAeQ4AewDBexSBPAexDYgPaAvh/MgAVnA6f?AZUAGiAOgATdASaA0PA3XAFhApdAUgAihAzcAmeA3VABgAT?ZAlgATiA+hAPfAZUA8aAlgA/UA+iAqgAyhAUXApOAFfAzcA?XbACOATPARXA2kAlfAcfATbAJcA2ZACXAFdAUYARfA/aAGY?AleAMgATeAXbAKUAUVAzXAJcA3bA6iAlZAGcAlfAXgAvh/K?ZAUaAmhAzXARbAyWA0PApdAWiATYAvbAlfAxjAWdA3aAUTA?TZAFhAiZA0gAPcApTAzVAFfAKeA2mAUbAzcAXXApOAmSAFf?A0eASlANZARcA/PAzSAmaAzWAFfAGdAUaAykASiARlAXhAM?dA3XAzeAOeANgA6fAlgAxjASnATeAMdAXhAubAnXATUAZaA?tfAvh/agA2jA0fApdA/ZA9gAJdAThA+hAUfA2ZARgASaATd?AccAFgA3gA+iAyhAyjA3ZAZPAzWA8XAFgAGfA6dATXAMVAF?bA5UA3bA0cAvdAOgAafATXA9YAuWAzPAXOAtaAZZAiZAxbA?xXAsPA9VATWAUSAOUAfYA6YAdgAGfAieAXhAxZATdAUWAUX?A2ZARXASdAvh/FgAXgAXfATeA+iA8hAxfASYATUA2aAFcAX?YASgATUA1aAURAmPATOApNAJcA0gA3fAKeAzZAUdAGYA9bA?lVAKPAJcAXfAThApdAsZANUAaiAXTAugAzRAdbAufA/cA0Z?AKdAcaA6YATUAmPApSAFgA3gAPcAFgAxjATiACdAxeA2ZAO?cA0PA/QATTAxRAFbAvh/MgASnA0fAXdACYAZZATOAmgAtZA?0aAOcA9bATXA/aAabA5OAleAugAKeAseAzaAvcAvWATUAUQ?AJdAiZAGdARbAlbAyZA5VATRAlhA+iAMYA3ZAlhAuhAZZAz?ZAXbA0SA6VAdhATgAviAGYAKZApOAZKAXfA8ZANhAGgAzcA?CaAMgAahAZWAzcAXXAGfA0eAvh/9fA2eATiARaACdAlgAMh?A2eA/UATdA0aAxXASTAlbAUaAfbANXAXQApbAagAWiAZZAT?YA6bAtZAMcA3aAzbANiA2jA/eApdATfA8hAigASmA/eATfA?MdAecAOgAthAWkAUfA5YATgAFcAadAvaAfWA0RAZZAzXAyV?AlZAGYAJXATVA6bAWYA/eAUYA9eARlAvh/MeAGdAzbAXWAZ?PA6KAVYAMSAFVAifAviA2kAzaAiVATPAGYAHcAxXA1VApbA?UdA2eAZWAFhA/eATfAscAqgApdA0ZA/aASYATPAFcAUQAFb?AahAOiAGhAZUAfgAzeASnAzcAUgA9bAGYA3VAlUAJcATiAK?eAUfAfgAmVApbAkUAZcAuhA9iA3bAyeAKUAzPAvh/uaAlhA?TiA0bAvYA8VAlcAyeA5cAzbAvdAuZAZUApOAXXAlaAzXAsb?AGaAyUARSATKAFWAagA+iA3hAsgAzXAKZAGTARaA3QAsPAl?WAZPAXXAifAMgATdAuZA+XATTAlaAtfAXaA0gAihApYA3bA?tZAUQAzXAiSAZZAHgAieAWlA+iAxeA8hAzgATUAUXAFbAvh?/OaARcASiA3UATTAUSAFWAOUACYAVaAZbAXcAUYAKUAvWAl?aAzZAGdA5aA2ZASdAvbA0PAzSAJcA9dAzUAsgAOUAlfA/hA?6fAZbAMdA/XAKPATQApbAFiACfATgA+iA3hA1jA0fAZUAOh?AHdARaAUSA9gAWlATiA6eAlcATPAvYAMbAZaA6fApYAuhAM?gAKUAvh/PTA2aAzQAtPAFXAGWATTACOAZKAfQAPSA0QATOA?mQAlKASSAJcAylAsbATZAWiAMWAlfAPfAUiAZUAzPAGdAPX?AlaASiAZWAycAvTA5aA2jA0ZAThACcAGYAcSAzPAlaAZUAv?gAlbA5aAzZAUWAaiAvYA2UA8NAFXA/UAaVAzWAeWApdA9dA?TcAvbAyZA1XAvh/UOA+PAlRA5aATfAOeAUgAviAiaApTAKU?AzPARWAsXA2PAFhAXhAzfA0cARaACRA+YAtgAXdAXWAzeAM?VAZZAuUAiKAFcAXiANhAugAagAzhAxZAUWAUXAdYAyUA5dA?TeAviA+hA3gAyZApTAlfAWlAMbATZAJYAFhA3fA2eAahA0U?AzVA9YAzRAmPAXOA0LAvh/pcA2lAKeAzZAvdApWA8aAlhAp?YAuhAzSA3aAKZA6UANVAURAJcASiATZA9gA3aAmUA0QAUXA?FYATUASdAXTA+WAxPAJcAykA3hA2jAzgA0fAlZAfbA0cA9W?ATPAmXAiQApdATZApdAXbAeiAcaAdhA3WA2ZARVAlcACiAS?nATeARhA2lATfASnAMdAXhAMgAvh/dfAiWApaA3UA8XANPA?mWAGXAUVAzQA9YAXYAZZAzbAseACiAXgATYAxaAleAucAah?AGTAKZAzZAPXAJKAtfA+aAUXAUYAtZAZbAvdATXAiaApbA0?aAvdAleAThAGdA3eAiZAWgAigAxjAUgATiAdhAUWA5cA+dA?zWAfYAKeAFfA/eAebAKPApTAdYAzWAOfAvh/UaA0aAyVA3c?AlbAxcATTAsWA/ZA5XAVfAueATdAOeAqfApOAzSAKPAcVAv?gAdhA2cAzZAngAxZAFgA0hAfgAyeATUAKdApTAuXAsbAFVA?FbAiZAzXA2UA/KAsgApTAiXAuWAFgAzXA/fA0PAzRA6VAZb?AXaAWnAUdAJXAFgATbACaA9dA8XA3RAZZA2eAsfAvh/pYAz?WAucACfAXWA1ZAmcANfAxhATYA3bA8aAsZAvXAZZA6gASiA?9eA2cASYAZPATRAlfA+fAzeAXiA0ZATYAMbA/aAKPAFhAuh?ApTA6UAeTAXbATVAURAJcAVmATZANfACiAxZAEgAvgASiA2?ZAGVAMYAxWAXTAFcA2eACYATbA9aATRA/UAJcAcfASnAmgA?vh/0cAxaATYAleA3cACfA9YATbAWaAMXA3RAZZAmeAMdA3X?ANbAzRAyZApJA3PA5aAzhA0fAicA+bAtZA0VAXTAZZATZAS?dAmfAFhASlAmeAzaAZPAXdAFcAcaAuZAMbA/PAKdAFhAThA?pdAUcAKfAfdATTAZKAFgAXgACfAWfAmaARVAMhATdAtgAUh?ASnAXdAvh/xjATZA+aAmUANgASdAFhAXhAMdAZUAzZA8XA3?bA5VAzUAOgAqXA6dAxZANhATTA3bAEgA2jAleA1kA3cAkgA?GiAzgARkAxcAieATZA/fAtbAGVASdAyXAcPAZbAviAThA2k?A0aApTANZA6gA3hA2lAzcA0eAmZA1UASYAXOA5aAlgATbAc?UAOcATaA3bASiAvh/ZUAUaAfbAzUAFdAUWA+TAxQAFXATUA?ycAShAmgAUfAxmA3gAZZAtZA/cA+dAlfA0fAyZATPApTAvg?AzWA8VAaiAthA3fAOiAChARaA2eAFhATiA1jA0fAXVATYAp?cAOZAkgAVgAahATeASnAOhAHdA0fAxXATUAUbAOfA6gApdA?XfANeAJdAegAlVAkUAzgAvh/KKAzWA5cAPfASnAmUAXhAMd?AlXAlbACWAzfA2jA/ZA0fApdAvgAthAJcAaiAUfAGgASnAz?gAXdAWcAxXA0fAdbATeA2eAFfASnAXhAxjAzZAMdA6aAOZA?8XATbAdcApTAXVAsXAZPA3NACQAFbATbAOcAXaAUYATUAFg?AGdAigATaA3ZAxcAiUAxXAlgA0aAvhwvXATUA+YAOTAlbA0?fAxZAabA2UATOAvXApbA6hA1kAseAZUATYACVAlgAegA3cA?vYAMXASaATPAGOAURAZLAubATZA8aAlgARmAVhAfdACbAye?AsUAOUAVWAvYAzNAFXAGVAhQAJNADKASMAAAA';
const data2 = data.replace(/\?/g, '');
const pages = decode(data2);

let page = 0;
let interval: number | undefined;
start();

function toggle() {
    if (interval !== undefined) {
        stop();
    } else {
        start();
    }
}

function start() {
    interval = setInterval(() => {
        page = (page + 1) % pages.length;
        main2.setField(pages[page]);
    }, 100);
}

function stop() {
    if (interval !== undefined) {
        clearInterval(interval);
        interval = undefined;
    }
}

// setTimeout(main.refresh as any, 1);
// window.onresize = () => {
//     console.log('event: resize [window]');
//     const canvas = document.getElementById('canvas');
//     (canvas as any).myonresize(canvas);
// };


// for unittest
export function hello(): string {
    return 'hello';
}
