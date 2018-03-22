import { app, View, VNode } from 'hyperapp';
import { button, div, input, main, param, s, span } from '@hyperapp/html';
import { action, actions as originActions, Actions } from './actions';
import { Block, initState, State } from './states';
import { HyperStage } from './lib/stage';
import { Piece } from './lib/enums';
import { FumenError, ViewError } from './lib/error';
import { decode, getBlocks, isMino } from './lib/fumen';
import { CSSProperties } from 'typestyle/lib/types';
// Konvaは最後に読み込むこと！
// エラー対策：Uncaught ReferenceError: __importDefault is not define
import * as Konva from 'konva';

const style: (properties: CSSProperties) => CSSProperties = properties => properties;

export const view: () => View<State, Actions> = () => {
    // 初期化
    const hyperStage = new HyperStage();

    // ブロック
    const blocks = Array.from({ length: 24 * 10 }).map((ignore, index) => {
        const [ix, iy] = [index % 10, Math.floor(index / 10)];
        const py = 23 - iy;
        const box: Konva.Rect = new Konva.Rect({
            strokeWidth: 0,
            opacity: 1,
        });
        return {
            ix,
            iy,
            py,
            box,
        };
    });

    {
        const layer = new Konva.Layer();
        for (const block of blocks) {
            layer.add(block.box);
        }
        hyperStage.addLayer(layer);
    }

    // 背景
    const background: Konva.Rect = new Konva.Rect({
        fill: '#333333',
        strokeWidth: 0,
        opacity: 1,
    });
    {
        const layer = new Konva.Layer();
        layer.add(background);
        hyperStage.addLayer(layer);
    }

    const heights = {
        comment: 30,
        tools: 50,
    };

    // 全体の構成を1関数にまとめる
    return (state, actions) => {
        const canvas = {
            width: state.display.width,
            height: state.display.height - (heights.tools + heights.comment),
        };
        const size = Math.floor(Math.min(canvas.height / 24, canvas.width / 10)) - 1;

        const isHighlights = Array.from({ length: 24 }).map((ignore, lineIndex) => {
            return blocks.filter(value => value.iy === lineIndex)
                .every(value => state.field[value.ix + value.iy * 10].piece !== Piece.Empty);
        });

        const fieldSize = {
            width: (size + 1) * 10 + 1,
            height: (size + 1) * 24 + 1,
        };
        const top = {
            x: (canvas.width - fieldSize.width) / 2,
            y: (canvas.height - fieldSize.height) / 2,
        };

        return div({
            oncreate: () => {
                // Hyperappでは最上位のノードが最後に実行される
                hyperStage.batchDraw();
            },
            onupdate: () => {
                // Hyperappでは最上位のノードが最後に実行される
                hyperStage.batchDraw();
            },
        }, [
            game({
                canvas,
                stage: hyperStage,
                countUp: actions.up,
            }),  // canvas空間のみ
            field({
                background,
                position: top,
                size: fieldSize,
            }, blocks.map((value) => {
                const blockValue = state.field[value.ix + value.iy * 10];
                return block({
                    size,
                    position: {
                        x: top.x + value.ix * size + value.ix + 1,
                        y: top.y + value.py * size + value.py + 1,
                    },
                    piece: blockValue.piece,
                    key: `block-${value.ix}-${value.iy}`,
                    rect: value.box,
                    isHighlight: blockValue.isHighlight || isHighlights[value.iy],
                });
            })),   // canvas内とのマッピング用仮想DOM
            menu([
                comment({
                    textColor: state.comment.textColor,
                    backgroundColor: state.comment.backgroundColor,
                    height: heights.comment,
                    text: state.count + state.comment.text,
                }),
                tools({
                    height: heights.tools,
                }, [
                    button({ onclick: () => actions.up(1) }, 'countUp'),
                ]),
            ]),
        ]);
    };
};

type Children = string | number | (string | number | VNode<{}>)[];
type VNodeWithProps = (children?: Children) => VNode<any>;

export interface Component<Props = {}> {
    (props: Props, children?: Children): VNode<object>;
}

interface GameProps {
    canvas: {
        width: number;
        height: number;
    };
    stage: HyperStage;
    countUp: (value: number) => action;
}

const game: Component<GameProps> = (props, children) => {
    return main({
        id: 'container',
        style: style({
            width: props.canvas.width,
            height: props.canvas.height + 'px',
        }),
        oncreate: (container: HTMLMainElement) => {
            // この時点でcontainer内に新しい要素が作られるため、
            // この要素内には hyperapp 管理下の要素を作らないこと
            const stage = new Konva.Stage({
                container,
                width: props.canvas.width,
                height: props.canvas.height,
            });

            props.stage.addStage(stage);

            const hammer = new Hammer(container);
            hammer.get('pinch').set({ enable: true });
            hammer.on('tap pinch', (ev) => {
                console.log(ev);
                toggleAnimation();
            });
        },
        onupdate: () => {
            const canvasSize = props.stage.size;
            if (canvasSize.height !== props.canvas.height || canvasSize.width !== props.canvas.width) {
                props.stage.resize(props.canvas);
            }
        },
    }, children);
};

interface BlockProps {
    position: {
        x: number;
        y: number;
    };
    key: string;
    size: number;
    piece: Piece;
    rect: Konva.Rect;
    isHighlight: boolean;
}

const block: Component<BlockProps> = (props) => {
    function fill(block: Konva.Rect) {
        if (props.isHighlight) {
            block.fill(getHighlightColor(props.piece));
        } else {
            block.fill(getNormalColor(props.piece));
        }
    }

    function resize(block: Konva.Rect) {
        block.setSize({ width: props.size, height: props.size });
    }

    function move(block: Konva.Rect) {
        block.setAbsolutePosition(props.position);
    }

    return param({
        key: props.key,
        size: props.size,
        value: props.piece,
        highlight: props.isHighlight,
        position: props.position,
        oncreate: () => {
            move(props.rect);
            resize(props.rect);
            fill(props.rect);
        },
        onupdate: (container: any, attr: any) => {
            // console.log(container.attributes.x.value);
            if (props.piece !== attr.value || props.isHighlight !== attr.highlight) {
                fill(props.rect);
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                move(props.rect);
            }
            if (props.size !== attr.size) {
                resize(props.rect);
            }
        },
    });
};

interface FieldProps {
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    background: Konva.Rect;
}

const field: Component<FieldProps> = (props, children) => {
    return param({
        position: props.position,
        size: props.size,
        oncreate: () => {
            props.background.setSize(props.size);
            props.background.setAbsolutePosition(props.position);
        },
        onupdate: (ignore: any, attr: any) => {
            if (props.size.width !== attr.size.width || props.size.height !== attr.size.height) {
                props.background.setSize(props.size);
            }
            if (props.position.x !== attr.position.x || props.position.y !== attr.position.y) {
                props.background.setAbsolutePosition(props.position);
            }
        },
    }, children);
};

const menu: VNodeWithProps = (children) => {
    return div(children);
};

interface CommentProps {
    height: number;
    textColor: string;
    backgroundColor: string;
    text: string;
}

const comment: Component<CommentProps> = (props) => {
    return div({
        style: style({
            backgroundColor: props.backgroundColor,
            width: '100%',
            height: props.height + 'px',
            whiteSpace: 'nowrap',
        }),
    }, [
        input({
            type: 'text',
            style: style({
                color: props.textColor,
                width: '100%',
                height: props.height + 'px',
                lineHeight: props.height + 'px',
                boxSizing: 'border-box',
                textAlign: 'center',
                border: 'none',
            }),
            value: props.text,
            readonly: 'readonly',
        }),
    ]);
};

interface ToolsProps {
    height: number;
}

const tools: Component<ToolsProps> = (props, children) => {
    return div({
        className: 'page-footer',
        style: style({
            width: '100%',
            height: props.height + 'px',
        }),
    }, children);
};

const router = app(initState, originActions, view(), document.body);

window.onresize = () => {
    router.refresh({
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    });
};

const data = 'vh/xOY7cFLDmClcJSAVDEHBEooRBJoAVBzuHgCsn9V?Cq+ytCan/wCauTWCqSFgC0HUWCKtrgCpOmFDzyCMCKdFgCs?XmPCJHUPCaNmFDPe/VCUNstCPezPCUeLuCKHWWC6/VWCPdF?gC6OUPCTejxCpintCvSFgCKNmFDzeFgCsfjWCzXmPCP+lPC?J9KWCaujFDMn/wCpirgCKNWxCsnltCvPNFDKHWWCzOstCpf?rgC0PltC6ySgC6vLMCs+CMCz3/VCUXNFD0intCvXExCKd9w?CvPltC6izPCv+LMCMubgC6/VWCUNUFDpvSgCadNPC0yTxCq?nFgCMezPC0yytCa+rtCUn3LCsXegCKdNFDMt/wCvXExCJ3j?PCz3/wCvSNFDp/9tCvCmPCauTWCvnNPCv+TWCT+dgCqXExC?s33LCPNmFDM3jPCJ3jFDqCOMCM3jFD0PNFDU9CMCsvaFD0i?3LCTubgCqXWWCauytCsuPPCMNegCa+dgCpfjWCTujPCs+aF?DPNmPCa+DWC6+jPCJ3aPCpX+tCMnzPCUuTWCpfrgC0yTxCz?PNFDvybgC6i/wCpvTxCP+TFDMtrgCp/NMCv+jFDqi3LCsXe?gCTn/VCT+lFDMeHgCzujWCpHcgC0/NMCz3/VCvXWWCvvLMC?an/wCMujFDzeFgCqyjPCpurgCM9KxC6P9VC0frgCMdFgC0S?ltC6fjxCMn3LCzSNFDzuHgCKX9wCMtLuC6e9VCvf3LCsHUx?CvXMgCKd9wCPt/wCpXstCqX8LCv+TWCvnNPC0vCMCs+jFDp?uHgCaN8LCa3TxCsvTxCs3HgCpSNFDKH+tCp3ntCUHExCadF?gCqyjFDvSNPC0XegCJNUPCvuPFDzSltCaHmPCM+VWCPtbMC?K9KWC0fbMCUd9VCvfzPCpHLxCMt/VCUdFgCan/VCa+9tCzX?UPCP+lPCPNWWCaONFDU3jPCsu/VCJ9aFD6vLMCs+ytC0fbM?CMn/VCz+aFDpvaFDJNWWCv3/VCUujFDPe/wCM9KxCKdNFDs?XMgCK+9tCzeFgCsfzPCM9CMC03LuCseFgCq3/wCPuTWCzu/?VCaXltCvXExCK+LgCp/9tC6uHgCpHUWCvOstCKebMCTHmPC?sXstCJnzPC0/dgCpyjFDKuaFDMNmFDUdNPCMXltCsuzPCv+?bgCpfjWCM9aFDqeNPCaHExCJ9jFDvCOMCKX9VCKtjxC03Hg?CT+TFD0intCJHMgCKtjxCp/NMCPNUFDJtjWCUnPFD0SNPCP?9KWC0HkPCp+aFDMt3LCpXmPCzyKWCKNegCaejxCMuytCK+r?tCUnzPCpvKxCMtjxCvi3LCzX8LCzXegCqvytCUejWCMNmFD?PentCs/NMCa3aFD0P9VCTnLuCqCOMC6OstCJnPFDqybgCU+?dgC6vLMCsiLuCKX9wCM3TxCae3LCzXWWCKHOMCPtjWCKePF?DMNegC0vCMCMtLuCvfjxCM+TPCvubMCzHLxCKd9VCMdNFDq?+KWCqHDMCzeNFDvyTxCq3ntCMX9wCvHUWCUe/wCan3LCzC8?LCvHkPCUnbMC0intCPNmFDp/rtC0P9VCv3bMC0ybgCKNMgC?puPFDM+9tCqHLxCv/rtCae/wCPdNFDMeHgCzijxCpyKxCKt?jxCa9KWCKuLMCs/dgCaujFDUn/VCaXltCqC+tCK+VWCvnNP?CviLuC0X8LCz/dgCqXegCT+TFDTHOMCsf3LCM3jFD0fbMC0?ybgCpHcgC0intCqSFgC6eNFDq+ytCsvTWCUergCqXWWCTuC?MCaNmPCMn/wCJHUFDz/dgCT+TFDzyCMCqXWxCvSNPCzXWWC?KuytCaHExCzfbMCPNExCae3LCaHUPCUdNPCU9aFDsHMMCsu?HgCMe/wCa3TxCvHUWCKO9VCK9aFDUHmFDMujPCsvjFDp+aP?CM+dgCz3jWCKubgC0O8LCvfLuCqHcgCU+7LCzvaFDsuLuCP?+VWCqCmPCPujFD6vTWCUuaFDM3jPCp+TWCK+lFDPtjWCpvK?xCqOstCpHbFDJtHgC0C8LCa3TxCq+jPC6yCMCJHstC0fjWC?J3jPC6eNPCMNegC6/VWCTergCzvKxCMeLuCvizPCp+KWCzf?bMCUuTxCqHLWCJ3jFDsuntCpCmPCvX+tCJHUPC6eFgCsvjF?Dv33LCs+LMCv/lFDzyCMCs3ntC0CegCpvjFDJNWWCv3/VCJ?tPFDvOUPCU9CMC6OUPCaXltCznNPCs+ytCpHLxCqyytCpij?xCK9aPC6e9VCvPltCsubMCUHUPCa9TWCv3/wCpvaFDp+TWC?sXmPCPd9wCKdFgCsXMgCqndBAXsB+tBFiB6eBMrBxpBykBz?gBWcBTaBPWBUSBdoBGcBlsB8sBZkBPlB6oBuiBShBTVBTLB?NbBMXB/RBpUBeUBfNB0IByGBT8A9FBlJB0HBfDB5JByBBpD?BT3Am4AJnBTDBKBBMZBXPBFOB+MBzGBSUBJnBMXBXeB2VBF?dBzdBpZB0VB6bBOXB3MBKLBXHBvh/lBBJPBT3AWOBMDBpFB?FYB/MBuYBMKBTJBK8AU9AFIB+IBqJBTFB/8AJnBzWBNRBUN?BSUBlGBXKBJnBGcB8YBxWB6UB+MBNNBTQByLB3BBTFBZ3AG?DBVTBcJBXEBXDBNCBTFBSAB58AWIBMABf+A6+AM8ANyAzuA?J4Au/A9oAZ/AuOBPTBiMBzOBpPBPTBURBvh/MUBTTBWMBKC?BZLBFSBMUBTGBuTB3SBK8A9CBFNBSPBJnBXZBTcB8TBpKBU?SBGNBzQBtJByLB3BBWIBi8AX5AJnBmXBMZBFdBzdB2fBpUB?PdBsVBlbBzdBqbBTXBcaBXUBOQBCPBRSBTFBRNB/CBdRB2Q?BMNBFTBCUBzMBJnBUeBibBGZB/kB9aBcQByWBTMBvh/WUBF?iBpcBfSBTUBWPBZHBfIBcQBFTBcQB6SBTPB+FBNGB5EBSIB?PCBX+AJnBTMBOUBUIBCKBNLBXCBSFB9DBJnB2RBTQBMPBTG?B0HBvIBuOBJnBaUB1RB/CBWWB9NBpPBMDBa/Az4AMzAOQBp?7AFYBT5Aa6AXvA8pAZuAPrAKfAzaAmQBNdBqdBJUB8JBTVB?vh/+VBNLBpKB8OB/LBvKB6GBlOBWTBTJBSIB9KBMDBzGB/C?B2JBZLBXNB+UBMKBTQBKGBlTBURBRSBWKB9YBRdBTPBybB/?RBlVBUSB+QBZGBSPBPHBMFBzHBuEBT3AFTBpSBKHBfIBvDB?JnBVZBGPB8MByQBFTBTQBSUBUMBpNBzHBOGBHCBMKBy8AT+?At4AuJBvh/JnBzOBvIBsGBOGB6PBtEBvABJnBzSB3LBiGBl?RBMSBuRBpPBFYBXNB8YBzQBZLBWMBT8AKCBFTBMZB+NBqHB?Z+AX9A3zAZ3Au3A8TBtJB6KBT7AJnBTFBPYBcdBCdB2aBeX?BSZBFdBXZBTPB0aBpXB9bBzQB5OBOQBdSBUHBvIBiBB59A+?FBfABy8AFEBTDBvh/TAB38AM5Au4AM3AZoAazAF/ASFBM0A?X7AuzAF6Az3Az6A2yAp2A0oAJnBfFBqCBFJBTIBmBB09Ap5?A3qAd5AJnB+ZBqTBMPBTLBFHBiBB33AXFBWABl9AZyAT7A0?4ACzAT0AE/ACABX0A+2AJnBNHB/GBFOBzOBWNBSKBUDBJnB?/aBMUBSSBJRBzHB9QBZBBvhdzBBFYBGNB8YBvPBSIBeCB5J?Bq9A+8A9FBT5AX7A81AO3A6xAToAJnBNHBUDB34Ay3A+/AT?2A3tA9+AM0A6zAJnBM+AofAtHeAtGehlGeQ4wwGeQ4AeQLB?eAPBeRpRLAewwQpwwAeg0BexhwwAegWCeRaRphWRaAegWgl?DewSRaBeQpwwBewhDeQpAegWDeRaAegHgWAeQLGeglAeQah?HiWAeQawDQLJe3zAvhFTABZ3Au3AFJBZiB9dBfgwhh0R4At?FewhAewSBewwCewhAeQLDeRpglAPAewwxhAewhRaRphWRaA?egWglAehHRLBPAeBPgWTeUUBvhEvPByLBTBBMIBuHB3fRpA?eh0AtFeglAegWCeQ4AeRaCeAPCeQ4QaBtwhQpAtAeAtwSCe?whAewSBewhAewSAewhAeQLDeRaglAPAewwxhAewhRaRphWR?aAegWglAehHRLBPAeBPgWdeFJBvhFiCBT8AW+AvKB5EBTyA?ZfRpKeg0Jeh0AewhDeglBPgHBeQ4DeCtCeQ4DegWEegWQpw?wwhCeAtxSAewhAeQLDeRaglAPAewwxhAewhRaRphWRaAegW?glAehHRLBPAeBPgWneOzAvhE97AKvAJTBXFB84AdfAtHeAt?JegWEeRpg0glDeR4EeglAeQ4AegWDeBtAegHgWCeCPgHBeg?lDeCtCeglDegWEexSgWgHBPAeQaxDxec/AvhDt+AZ3ATABe?9AjfwhKeg0AeAtHeAtAewwBeRpglQpAehlwhAewhhlBeCPg?HBeglDeCtCeglDegWEexSgWgHBPAeQaxD7e36AvhDv2Au3A?JJB6HB5fhlDeQ4Aewhg0AtFeQ4DeAtBeQ4BeglwSAPAegWA?ewhgHAegWxSiWAeRawDQLFfcEBvhET3AN+Av7AKzATtAPfR?pglOeQ4DeglwwDeQ4EewwAeAtBegWQpAtBeQLAtGeQaBeQp?BeglwSAPAegWAewSgHAegWxSiWAeRawDQLPfc1AvhEtuAGx?ASsAl0AO1AVfh0AeglCewwCeAPglAeRpglAewwBeCtgWQpA?twSBehWxhDeQaBeQpBeglwSAPAegWAewSgHAegWxSiWAeRa?wDQLZfMnAvhFzoAZjAfqAqeAp5AzuAQfglAeRpEewhHeAtB?eglAtwSCeAtBexhAeQ4Aeh0AegWCegWCeAPgWAeQaxSQLwD?AegHiWjfapAvhDZeA/fAcwAtqAnewhAeQ4JeQ4GeglQLBew?wGeAPQpAewwAtHeQaBeAtCeAtwSQLAeAPAtBexhAeQ4Aegl?g0AegWCegWCeAPgWAeQaxSQLwDAegHiWtfMnAvhC+iAalAl?rA6eg0whAeQ4hlHewwDeg0BeglQLAegWAeAtwwhWAexhAeQ?4AeglwhAegWCegWCeAPgWAeQaxSQLwDAegHiW3fThAvhEpq?AmmA6oA3kAxmA+eR4AezhhlQ4AewDAezwQaBeQLglAexSDe?QLwwgWxhglhWQahWwDAeQaAPQLBPBgUXAvhFfYA2eA9lAek?ATeARgAxeRpg0zhQ4EeRaRpAeQ4AeRpCeAPAewSBeQLBPQ4?AewhAewhwSAtQahWwDAeQaAPQLBPLgTPAvhD6iAFlA0kAXm?A7eRpDeR4DeBtAeQ4AewDBexSBPAexDYgPaAvh/MgAVnA6f?AZUAGiAOgATdASaA0PA3XAFhApdAUgAihAzcAmeA3VABgAT?ZAlgATiA+hAPfAZUA8aAlgA/UA+iAqgAyhAUXApOAFfAzcA?XbACOATPARXA2kAlfAcfATbAJcA2ZACXAFdAUYARfA/aAGY?AleAMgATeAXbAKUAUVAzXAJcA3bA6iAlZAGcAlfAXgAvh/K?ZAUaAmhAzXARbAyWA0PApdAWiATYAvbAlfAxjAWdA3aAUTA?TZAFhAiZA0gAPcApTAzVAFfAKeA2mAUbAzcAXXApOAmSAFf?A0eASlANZARcA/PAzSAmaAzWAFfAGdAUaAykASiARlAXhAM?dA3XAzeAOeANgA6fAlgAxjASnATeAMdAXhAubAnXATUAZaA?tfAvh/agA2jA0fApdA/ZA9gAJdAThA+hAUfA2ZARgASaATd?AccAFgA3gA+iAyhAyjA3ZAZPAzWA8XAFgAGfA6dATXAMVAF?bA5UA3bA0cAvdAOgAafATXA9YAuWAzPAXOAtaAZZAiZAxbA?xXAsPA9VATWAUSAOUAfYA6YAdgAGfAieAXhAxZATdAUWAUX?A2ZARXASdAvh/FgAXgAXfATeA+iA8hAxfASYATUA2aAFcAX?YASgATUA1aAURAmPATOApNAJcA0gA3fAKeAzZAUdAGYA9bA?lVAKPAJcAXfAThApdAsZANUAaiAXTAugAzRAdbAufA/cA0Z?AKdAcaA6YATUAmPApSAFgA3gAPcAFgAxjATiACdAxeA2ZAO?cA0PA/QATTAxRAFbAvh/MgASnA0fAXdACYAZZATOAmgAtZA?0aAOcA9bATXA/aAabA5OAleAugAKeAseAzaAvcAvWATUAUQ?AJdAiZAGdARbAlbAyZA5VATRAlhA+iAMYA3ZAlhAuhAZZAz?ZAXbA0SA6VAdhATgAviAGYAKZApOAZKAXfA8ZANhAGgAzcA?CaAMgAahAZWAzcAXXAGfA0eAvh/9fA2eATiARaACdAlgAMh?A2eA/UATdA0aAxXASTAlbAUaAfbANXAXQApbAagAWiAZZAT?YA6bAtZAMcA3aAzbANiA2jA/eApdATfA8hAigASmA/eATfA?MdAecAOgAthAWkAUfA5YATgAFcAadAvaAfWA0RAZZAzXAyV?AlZAGYAJXATVA6bAWYA/eAUYA9eARlAvh/MeAGdAzbAXWAZ?PA6KAVYAMSAFVAifAviA2kAzaAiVATPAGYAHcAxXA1VApbA?UdA2eAZWAFhA/eATfAscAqgApdA0ZA/aASYATPAFcAUQAFb?AahAOiAGhAZUAfgAzeASnAzcAUgA9bAGYA3VAlUAJcATiAK?eAUfAfgAmVApbAkUAZcAuhA9iA3bAyeAKUAzPAvh/uaAlhA?TiA0bAvYA8VAlcAyeA5cAzbAvdAuZAZUApOAXXAlaAzXAsb?AGaAyUARSATKAFWAagA+iA3hAsgAzXAKZAGTARaA3QAsPAl?WAZPAXXAifAMgATdAuZA+XATTAlaAtfAXaA0gAihApYA3bA?tZAUQAzXAiSAZZAHgAieAWlA+iAxeA8hAzgATUAUXAFbAvh?/OaARcASiA3UATTAUSAFWAOUACYAVaAZbAXcAUYAKUAvWAl?aAzZAGdA5aA2ZASdAvbA0PAzSAJcA9dAzUAsgAOUAlfA/hA?6fAZbAMdA/XAKPATQApbAFiACfATgA+iA3hA1jA0fAZUAOh?AHdARaAUSA9gAWlATiA6eAlcATPAvYAMbAZaA6fApYAuhAM?gAKUAvh/PTA2aAzQAtPAFXAGWATTACOAZKAfQAPSA0QATOA?mQAlKASSAJcAylAsbATZAWiAMWAlfAPfAUiAZUAzPAGdAPX?AlaASiAZWAycAvTA5aA2jA0ZAThACcAGYAcSAzPAlaAZUAv?gAlbA5aAzZAUWAaiAvYA2UA8NAFXA/UAaVAzWAeWApdA9dA?TcAvbAyZA1XAvh/UOA+PAlRA5aATfAOeAUgAviAiaApTAKU?AzPARWAsXA2PAFhAXhAzfA0cARaACRA+YAtgAXdAXWAzeAM?VAZZAuUAiKAFcAXiANhAugAagAzhAxZAUWAUXAdYAyUA5dA?TeAviA+hA3gAyZApTAlfAWlAMbATZAJYAFhA3fA2eAahA0U?AzVA9YAzRAmPAXOA0LAvh/pcA2lAKeAzZAvdApWA8aAlhAp?YAuhAzSA3aAKZA6UANVAURAJcASiATZA9gA3aAmUA0QAUXA?FYATUASdAXTA+WAxPAJcAykA3hA2jAzgA0fAlZAfbA0cA9W?ATPAmXAiQApdATZApdAXbAeiAcaAdhA3WA2ZARVAlcACiAS?nATeARhA2lATfASnAMdAXhAMgAvh/dfAiWApaA3UA8XANPA?mWAGXAUVAzQA9YAXYAZZAzbAseACiAXgATYAxaAleAucAah?AGTAKZAzZAPXAJKAtfA+aAUXAUYAtZAZbAvdATXAiaApbA0?aAvdAleAThAGdA3eAiZAWgAigAxjAUgATiAdhAUWA5cA+dA?zWAfYAKeAFfA/eAebAKPApTAdYAzWAOfAvh/UaA0aAyVA3c?AlbAxcATTAsWA/ZA5XAVfAueATdAOeAqfApOAzSAKPAcVAv?gAdhA2cAzZAngAxZAFgA0hAfgAyeATUAKdApTAuXAsbAFVA?FbAiZAzXA2UA/KAsgApTAiXAuWAFgAzXA/fA0PAzRA6VAZb?AXaAWnAUdAJXAFgATbACaA9dA8XA3RAZZA2eAsfAvh/pYAz?WAucACfAXWA1ZAmcANfAxhATYA3bA8aAsZAvXAZZA6gASiA?9eA2cASYAZPATRAlfA+fAzeAXiA0ZATYAMbA/aAKPAFhAuh?ApTA6UAeTAXbATVAURAJcAVmATZANfACiAxZAEgAvgASiA2?ZAGVAMYAxWAXTAFcA2eACYATbA9aATRA/UAJcAcfASnAmgA?vh/0cAxaATYAleA3cACfA9YATbAWaAMXA3RAZZAmeAMdA3X?ANbAzRAyZApJA3PA5aAzhA0fAicA+bAtZA0VAXTAZZATZAS?dAmfAFhASlAmeAzaAZPAXdAFcAcaAuZAMbA/PAKdAFhAThA?pdAUcAKfAfdATTAZKAFgAXgACfAWfAmaARVAMhATdAtgAUh?ASnAXdAvh/xjATZA+aAmUANgASdAFhAXhAMdAZUAzZA8XA3?bA5VAzUAOgAqXA6dAxZANhATTA3bAEgA2jAleA1kA3cAkgA?GiAzgARkAxcAieATZA/fAtbAGVASdAyXAcPAZbAviAThA2k?A0aApTANZA6gA3hA2lAzcA0eAmZA1UASYAXOA5aAlgATbAc?UAOcATaA3bASiAvh/ZUAUaAfbAzUAFdAUWA+TAxQAFXATUA?ycAShAmgAUfAxmA3gAZZAtZA/cA+dAlfA0fAyZATPApTAvg?AzWA8VAaiAthA3fAOiAChARaA2eAFhATiA1jA0fAXVATYAp?cAOZAkgAVgAahATeASnAOhAHdA0fAxXATUAUbAOfA6gApdA?XfANeAJdAegAlVAkUAzgAvh/KKAzWA5cAPfASnAmUAXhAMd?AlXAlbACWAzfA2jA/ZA0fApdAvgAthAJcAaiAUfAGgASnAz?gAXdAWcAxXA0fAdbATeA2eAFfASnAXhAxjAzZAMdA6aAOZA?8XATbAdcApTAXVAsXAZPA3NACQAFbATbAOcAXaAUYATUAFg?AGdAigATaA3ZAxcAiUAxXAlgA0aAvhwvXATUA+YAOTAlbA0?fAxZAabA2UATOAvXApbA6hA1kAseAZUATYACVAlgAegA3cA?vYAMXASaATPAGOAURAZLAubATZA8aAlgARmAVhAfdACbAye?AsUAOUAVWAvYAzNAFXAGVAhQAJNADKASMAAAA';
const replaced = data.replace(/\?/g, '');
const pages = decode(replaced);
let interval: number | undefined;
let currentPage = 0;
let comment2 = '';

setTimeout(() => {
    start();
}, 0);

function toggleAnimation() {
    if (interval !== undefined) {
        stop();
    } else {
        start();
    }
}

function start() {
    interval = setInterval(() => {
        const page = pages[currentPage];
        const action = page.action;
        comment2 = action.isComment ? page.comment : comment2;

        const nextField: Block[] = page.field.map((value) => {
            return {
                piece: value,
            };
        });
        if (isMino(action.piece)) {
            const coordinate = action.coordinate;
            const blocks = getBlocks(action.piece, action.rotation);
            for (const block of blocks) {
                const [x, y] = [coordinate.x + block[0], coordinate.y + block[1]];
                nextField[x + y * 10] = {
                    piece: action.piece,
                    isHighlight: true,
                };
            }
        }

        router.setFieldAndComment({
            comment: comment2,
            field: nextField,
        });

        if (action.isLock && isMino(action.piece) && comment2.startsWith('#Q=')) {
            const nextQuiz = (quiz: string, use: Piece): string => {
                const name = parsePieceName(use);
                const indexHold = quiz.indexOf('[') + 1;
                const indexCurrent = quiz.indexOf('(') + 1;

                const get = (value?: string) => {
                    if (value === undefined || value === ']' || value === ')') {
                        return '';
                    }
                    return value;
                };

                const holdName = get(quiz[indexHold]);
                const currentName = get(quiz[indexCurrent]);
                const nextName = get(quiz[indexCurrent + 2]);
                const least = get(quiz.substring(indexCurrent + 3));

                // console.log(quiz);
                // console.log(name, holdName, currentName, nextName);

                if (holdName === name) {
                    return `#Q=[${currentName}](${nextName})` + least;
                }
                if (currentName === name) {
                    return `#Q=[${holdName}](${nextName})` + least;
                }
                if (holdName === '') {
                    return nextQuiz(`#Q=[${currentName}](${nextName})` + least, use);
                }

                throw new FumenError('Unexpected quiz');
            };

            comment2 = nextQuiz(comment2, action.piece);
        }

        currentPage = (currentPage + 1) % pages.length;
    }, 10);
}

function stop() {
    if (interval !== undefined) {
        clearInterval(interval);
        interval = undefined;
    }
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
        return '#000000';
    }
    throw new ViewError('Not found highlight color: ' + piece);
}

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
        return '#000000';
    }
    throw new ViewError('Not found normal color: ' + piece);
}

function parsePieceName(piece: Piece) {
    // console.log(`piece: ${n}`);

    switch (piece) {
    case Piece.I:
        return 'I';
    case Piece.L:
        return 'L';
    case Piece.O:
        return 'O';
    case Piece.Z:
        return 'Z';
    case Piece.T:
        return 'T';
    case Piece.J:
        return 'J';
    case Piece.S:
        return 'S';
    }
    throw new FumenError('Unexpected piece');
}
