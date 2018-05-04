import { AnimationState, Piece, Screens } from './lib/enums';
import { Page } from './lib/fumen/fumen';
import { HyperStage } from './lib/hyper';
import { Field } from './lib/fumen/field';
import konva = require('konva');
import { Quiz } from './lib/fumen/quiz';
import { QuizCommentResult, TextCommentResult } from './actions/fumen';

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
    version: string;
    screen: Screens;
}

export interface Block {
    piece: Piece;
    highlight?: boolean;
}

export interface CachedPage extends Page {
    field: {
        obj?: Field;
        ref?: number;
        diff?: Field;
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
    version: VERSION,
    screen: Screens.Reader,
};

export const resources = {
    modals: {
        settings: undefined as any,
        fumen: undefined as any,
    },
    konva: createKonvaObjects(),
};

// konvaオブジェクトの作成
// 作成コストはやや大きめなので、必要なものは初めに作成する
function createKonvaObjects() {
    const obj = {
        stage: new HyperStage(),
        event: undefined as any,
        background: undefined as any,
        fieldMarginLine: undefined as any,
        fieldBlocks: [] as konva.Rect[],
        sentBlocks: [] as konva.Rect[],
        hold: [] as konva.Rect[],
        nexts: [[]] as konva.Rect[][],
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
        const rects = Array.from({ length: 5 }).map(() => {
            return new konva.Rect({
                fill: '#333',
                strokeWidth: 1,
                stroke: '#666',
                opacity: 1,
            });
        });

        obj.hold = rects;
        for (const rect of rects) {
            layers.boxes.add(rect);
        }
    }

    // Nexts
    {
        const nexts = Array.from({ length: 5 }).map(() => {
            return Array.from({ length: 5 }).map(() => {
                return new konva.Rect({
                    fill: '#333',
                    strokeWidth: 1,
                    stroke: '#666',
                    opacity: 1,
                });
            });
        });

        obj.nexts = nexts;
        for (const next of nexts) {
            for (const rect of next) {
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
