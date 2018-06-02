import { AnimationState, Piece, Screens, TouchTypes } from './lib/enums';
import { Page } from './lib/fumen/fumen';
import { HyperStage } from './lib/hyper';
import { Field } from './lib/fumen/field';
import { QuizCommentResult, TextCommentResult } from './actions/fumen';
import { Box } from './components/box';
import konva = require('konva');

export const VERSION = '###VERSION###';  // Replace build number of CI when run `webpack:prod`

// Immutableにする
export interface State {
    field: Block[];
    sentLine: Block[];
    comment: {
        text: string;
        isChanged: boolean;
    };
    display: {
        width: number;
        height: number;
    };
    hold?: Piece;
    nexts?: Piece[];
    play: {
        status: AnimationState;
        intervalTime: number;
    };
    fumen: {
        currentIndex: number;
        maxPage: number;
        pages: CachedPage[];
        value?: string;
        errorMessage?: string;
    };
    modal: {
        fumen: boolean;
        settings: boolean;
    };
    handlers: {
        animation?: number;
    };
    events: {
        touch: {
            piece?: Piece;
        };
    };
    mode: {
        screen: Screens;
        touch: TouchTypes;
        piece: Piece;
    };
    version: string;
}

export interface Block {
    piece: Piece;
    highlight?: boolean;
}

export interface CachedPage extends Page {
    field: {
        obj?: Field;
        ref?: number;
        operations?: { [key: string]: (field: Field) => void };
        cache?: {
            obj: Field;
        };
    };
    comment: {
        text?: string;
        ref?: number;
        cache?: TextCommentResult | QuizCommentResult;
    };
}

export const initState: Readonly<State> = {
    field: Array.from({ length: 230 }).map((ignore) => {
        return { piece: Piece.Empty };
    }),
    sentLine: Array.from({ length: 10 }).map((ignore) => {
        return { piece: Piece.Empty };
    }),
    comment: {
        text: '',
        isChanged: false,
    },
    display: {
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    },
    hold: undefined,
    nexts: undefined,
    play: {
        status: AnimationState.Pause,
        intervalTime: 1500,
    },
    fumen: {
        currentIndex: 0,
        maxPage: 1,
        pages: [],
        value: undefined,
        errorMessage: undefined,
    },
    modal: {
        fumen: false,
        settings: false,
    },
    handlers: {
        animation: undefined,
    },
    events: {
        touch: {
            piece: undefined,
        },
    },
    mode: {
        screen: Screens.Reader,
        touch: TouchTypes.Drawing,
        piece: Piece.Gray,
    },
    version: VERSION,
};

export const resources = {
    modals: {
        settings: undefined as any,
        fumen: undefined as any,
    },
    konva: createKonvaObjects(),
};

interface Box {
    background: konva.Rect;
    pieces: konva.Rect[];
}

interface PieceColorBox {
    event: konva.Rect;
    background: konva.Rect;
    pieces: konva.Rect[];
}

// konvaオブジェクトの作成
// 作成コストはやや大きめなので、必要なものは初めに作成する
function createKonvaObjects() {
    const obj = {
        stage: new HyperStage(),
        event: {} as konva.Rect,
        background: {} as konva.Rect,
        fieldMarginLine: {} as konva.Line,
        fieldBlocks: [] as konva.Rect[],
        sentBlocks: [] as konva.Rect[],
        hold: {} as Box,
        nexts: [] as Box[],
        pieceButtons: [] as PieceColorBox[],
        layers: {
            background: new konva.Layer({ name: 'background' }),
            field: new konva.Layer({ name: 'field' }),
            boxes: new konva.Layer({ name: 'boxes' }),
            overlay: new konva.Layer({ name: 'overlay' }),
        },
    };
    const layers = obj.layers;

    // 背景
    {
        const rect = new konva.Rect({
            strokeWidth: 0,
            opacity: 1,
        });

        obj.background = rect;
        layers.background.add(rect);
    }

    // プレイエリアとせり上がりの間
    {
        const line = new konva.Line({
            points: [],
        });

        obj.fieldMarginLine = line;
        layers.background.add(line);
    }

    // フィールドブロック
    {
        const rects = Array.from({ length: 23 * 10 }).map(() => {
            return new konva.Rect({
                strokeWidth: 0,
                opacity: 1,
            });
        });

        obj.fieldBlocks = rects;
        for (const rect of rects) {
            layers.field.add(rect);
        }
    }

    // せり上がりブロック
    {
        const rects = Array.from({ length: 10 }).map(() => {
            return new konva.Rect({
                strokeWidth: 0,
                opacity: 0.75,
            });
        });

        obj.sentBlocks = rects;
        for (const rect of rects) {
            layers.field.add(rect);
        }
    }

    // Hold
    {
        const background = new konva.Rect({
            fill: '#333',
            strokeWidth: 1,
            stroke: '#666',
            opacity: 1,
        });

        const pieces = Array.from({ length: 4 }).map(() => {
            return new konva.Rect({
                fill: '#333',
                strokeWidth: 1,
                stroke: '#666',
                opacity: 1,
            });
        });

        obj.hold = { background, pieces };
        for (const rect of [background].concat(pieces)) {
            layers.boxes.add(rect);
        }
    }

    // Nexts
    {
        const nexts = Array.from({ length: 5 }).map(() => {
            const background = new konva.Rect({
                fill: '#333',
                strokeWidth: 1,
                stroke: '#666',
                opacity: 1,
            });

            const pieces = Array.from({ length: 4 }).map(() => {
                return new konva.Rect({
                    fill: '#333',
                    strokeWidth: 1,
                    stroke: '#666',
                    opacity: 1,
                });
            });

            return { background, pieces };
        });

        obj.nexts = nexts;
        for (const { background, pieces } of nexts) {
            for (const rect of [background].concat(pieces)) {
                layers.boxes.add(rect);
            }
        }
    }

    // Piece buttons
    {
        const pieces = [Piece.Gray, Piece.I, Piece.L, Piece.O, Piece.Z, Piece.T, Piece.J, Piece.S, Piece.Gray];
        const buttons = pieces.map(() => {
            const event = new konva.Rect({
                fill: 'rgba(51,51,51,0.1)',  // #333
                stroke: '#ee6e73',
                strokeWidth: 3,
                opacity: 1,
                strokeEnabled: false,
                listening: true,
            });

            const background = new konva.Rect({
                fill: '#333',
                strokeWidth: 1,
                stroke: '#666',
                opacity: 1,
            });

            const pieces = Array.from({ length: 4 }).map(() => {
                return new konva.Rect({
                    fill: '#333',
                    strokeWidth: 1,
                    stroke: '#666',
                    opacity: 1,
                });
            });

            return { background, event, pieces };
        });

        obj.pieceButtons = buttons;
        for (const { background, event, pieces } of buttons) {
            for (const rect of [background].concat(pieces)) {
                layers.boxes.add(rect);
            }
            layers.boxes.add(event);  // eventが最も上になる順で追加する
        }
    }

    // Overlay
    // Event Layer
    {
        const rect = new konva.Rect({
            fill: '#333',
            opacity: 0.0,  // 0 ほど透過
            strokeEnabled: false,
            listening: true,
        });

        obj.event = rect;
        layers.overlay.add(rect);
    }

    return obj;
}
