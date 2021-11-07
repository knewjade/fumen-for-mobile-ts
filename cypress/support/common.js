import { operations } from './operations';

export const HighlightType = {
    Normal: 'Normal',
    Highlight1: 'Highlight1',
    Highlight2: 'Highlight2',
    Lighter: 'Lighter',
};

export const Color = {
    Completion: {
        [HighlightType.Normal]: '#ffffff',
        [HighlightType.Highlight1]: '#ffffff',
        [HighlightType.Highlight2]: '#ffffff',
        [HighlightType.Lighter]: '#ffffff',
    },
    Gray: {
        [HighlightType.Normal]: '#999999',
        [HighlightType.Highlight1]: '#cccccc',
        [HighlightType.Highlight2]: '#ffffff',
        [HighlightType.Lighter]: '#333333',
    },
    I: {
        [HighlightType.Normal]: '#009999',
        [HighlightType.Highlight1]: '#33cccc',
        [HighlightType.Highlight2]: '#00ffff',
        [HighlightType.Lighter]: '#003333',
    },
    T: {
        [HighlightType.Normal]: '#990099',
        [HighlightType.Highlight1]: '#cc33cc',
        [HighlightType.Highlight2]: '#ff00ff',
        [HighlightType.Lighter]: '#4d004d',
    },
    S: {
        [HighlightType.Normal]: '#009900',
        [HighlightType.Highlight1]: '#33cc33',
        [HighlightType.Highlight2]: '#00ff00',
        [HighlightType.Lighter]: '#003300',
    },
    Z: {
        [HighlightType.Normal]: '#990000',
        [HighlightType.Highlight1]: '#cc3333',
        [HighlightType.Highlight2]: '#ff0000',
        [HighlightType.Lighter]: '#4d0000',
    },
    L: {
        [HighlightType.Normal]: '#996600',
        [HighlightType.Highlight1]: '#cc9933',
        [HighlightType.Highlight2]: '#ff9900',
        [HighlightType.Lighter]: '#3b1d00',
    },
    J: {
        [HighlightType.Normal]: '#0000BB',
        [HighlightType.Highlight1]: '#3333cc',
        [HighlightType.Highlight2]: '#0000ff',
        [HighlightType.Lighter]: '#000061',
    },
    O: {
        [HighlightType.Normal]: '#999900',
        [HighlightType.Highlight1]: '#cccc33',
        [HighlightType.Highlight2]: '#ffff00',
        [HighlightType.Lighter]: '#333300',
    },
    Empty: {
        [HighlightType.Normal]: '#000000',
        [HighlightType.Highlight1]: '#000000',
        [HighlightType.Highlight2]: '#000000',
        [HighlightType.Lighter]: '#000000',
    },
};

export const ClassicColor = {
    Completion: Color.Completion,
    Gray: Color.Gray,
    I: Color.Z,
    T: Color.I,
    S: Color.T,
    Z: Color.S,
    L: Color.L,
    J: Color.J,
    O: Color.O,
    Empty: Color.Empty,
};

export const Piece = {
    Empty: '0',
    I: '1',
    L: '2',
    O: '3',
    Z: '4',
    T: '5',
    J: '6',
    S: '7',
    Gray: '8',
};

export const Rotation = {
    Spawn: 'Spawn',
    Reverse: 'Reverse',
    Left: 'Left',
    Right: 'Right',
};

export const datatest = value => `[datatest="${value}"]`;

export const block = (x, y) => datatest(`block-${x}-${y}`);
export const sentBlock = (x) => datatest(`sent-block-${x}-0`);

export const mino = (piece, rotation) => {
    let blocks = getPieces(piece);
    switch (rotation) {
    case Rotation.Spawn:
        break;
    case Rotation.Reverse:
        blocks = blocks.map(current => [-current[0], -current[1]]);
        break;
    case Rotation.Left:
        blocks = blocks.map(current => [-current[1], current[0]]);
        break;
    case Rotation.Right:
        blocks = blocks.map(current => [current[1], -current[0]]);
        break;
    }

    return (x, y) => {
        return blocks.map(current => [current[0] + x, current[1] + y]).map(current => block(...current));
    };
};

export const minoPosition = (piece, rotation) => {
    let blocks = getPieces(piece);
    switch (rotation) {
    case Rotation.Spawn:
        break;
    case Rotation.Reverse:
        blocks = blocks.map(current => [-current[0], -current[1]]);
        break;
    case Rotation.Left:
        blocks = blocks.map(current => [-current[1], current[0]]);
        break;
    case Rotation.Right:
        blocks = blocks.map(current => [current[1], -current[0]]);
        break;
    }

    return (x, y) => {
        return blocks.map(current => [current[0] + x, current[1] + y]);
    };
};

const getPieces = (piece) => {
    switch (piece) {
    case Piece.I:
        return [[0, 0], [-1, 0], [1, 0], [2, 0]];
    case Piece.T:
        return [[0, 0], [-1, 0], [1, 0], [0, 1]];
    case Piece.O:
        return [[0, 0], [1, 0], [0, 1], [1, 1]];
    case Piece.L:
        return [[0, 0], [-1, 0], [1, 0], [1, 1]];
    case Piece.J:
        return [[0, 0], [-1, 0], [1, 0], [-1, 1]];
    case Piece.S:
        return [[0, 0], [-1, 0], [0, 1], [1, 1]];
    case Piece.Z:
        return [[0, 0], [1, 0], [0, 1], [-1, 1]];
    }
};

export const visit = (
    { fumen, sleepInMill = 800, lng = 'en', mode = 'readonly', mobile = true, reload = false },
) => {
    let baseUrl = 'fumen-for-mobile/#';

    if (mode !== 'readonly') {
        baseUrl += `/${mode}`;
    }

    const params = {};

    if (fumen) {
        params.d = fumen;
    }

    if (lng) {
        params.lng = lng;
    }

    if (mobile) {
        params.mobile = 1;
    }

    if (params) {
        const query = Object.entries(params).map(value => value[0] + '=' + value[1]).join('&');
        cy.visit(baseUrl + '?' + query);
    } else {
        cy.visit(baseUrl);
    }

    if (reload) {
        cy.reload();
    }

    cy.wait(sleepInMill);
};

export const rightTap = (first, second) => {
    let count, callback;
    if (typeof first === 'number') {
        count = first;
        callback = second;
    } else {
        count = 1;
        callback = first;
    }

    for (let i = 0; i < count; i += 1) {
        if (0 < i) cy.wait(40);
        cy.get('body').click(300, 300);
    }

    cy.wait(80);

    if (callback) callback();
};

export const leftTap = (first, second = undefined) => {
    let count, callback;
    if (typeof first === 'number') {
        count = first;
        callback = second;
    } else {
        count = 1;
        callback = first;
    }

    for (let i = 0; i < count; i += 1) {
        if (0 < i) cy.wait(40);
        cy.get('body').click(100, 300);
    }

    cy.wait(80);

    if (callback) callback();
};

export const pages = (max) => {
    return (page) => {
        return `${page} / ${max}`;
    };
};

export const holdBox = () => {
    return datatest('box-hold');
};

export const nextBox = (index) => {
    return datatest(`box-next-${index}`);
};

export const expectFumen = (fumen) => {
    operations.menu.copyToClipboard();
    cy.wait(100);
    cy.get(datatest('copied-fumen-data')).should('have.attr', 'data', fumen);
    rightTap();
};
