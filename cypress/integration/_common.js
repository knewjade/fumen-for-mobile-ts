// TODO: 構造を色->状態に統一したい
export const Color = {
    Normal: {
        I: '#009999',
        J: '#0000BE',
        L: '#9A6700',
        Z: '#9B0000',
        S: '#009B00',
        O: '#999900',
        T: '#9B009B',
    },
    Highlight: {
        I: '#24CCCD',
        J: '#3229CF',
        L: '#CD9A24',
        Z: '#CE312D',
        S: '#26CE22',
        O: '#CCCE19',
        T: '#CE27CE',
        Completion: '#fff',
    },
    Empty: {
        Field: '#000',
    },
    Gray: {
        Field: '#999999',
        Highlight: '#CCCCCC',
    },
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

export const visit = (fumen, sleepInMill = 500) => {
    cy.visit('./public/index.html?d=' + fumen);
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