import { AnimationState, ModeTypes, Piece, Screens, TouchTypes } from './lib/enums';
import { Page } from './lib/fumen/fumen';
import { HyperStage } from './lib/hyper';
import { Box } from './components/box';
import { PageEnv } from './env';
import { Block } from './state_types';
import konva = require('konva');

const VERSION = PageEnv.Version;

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
        pages: Page[];
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
        inferences: number[];
    };
    mode: {
        screen: Screens;
        type: ModeTypes;
        touch: TouchTypes;
        piece: Piece | undefined;
    };
    version: string;
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
        inferences: [],
    },
    mode: {
        screen: Screens.Reader,
        type: ModeTypes.DrawingTool,
        touch: TouchTypes.Drawing,
        piece: undefined,
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
