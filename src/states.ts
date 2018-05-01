import { AnimationState, Piece } from './lib/enums';
import { Page } from './lib/fumen/fumen';
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
    next?: Piece[];
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
    version: string;
}

export interface Block {
    piece: Piece;
    highlight?: boolean;
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
    next: undefined,
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
    version: VERSION,
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
        background: undefined as any,
        fieldMarginLine: undefined as any,
        fieldBlocks: [] as konva.Rect[],
        sentBlocks: [] as konva.Rect[],
        layers: {
            background: new konva.Layer({ name: 'background' }),
            field: new konva.Layer({ name: 'field' }),
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

    return obj;
}
