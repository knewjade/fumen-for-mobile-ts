# tetfu-sp


/*


//
const pages = decode(replaced);

let interval: number | undefined;
let currentPage = 0;
let comment2 = '';

function toggleAnimation() {
    if (interval !== undefined) {
        stop();
    } else {
        start();
    }
}

const get = (value?: string) => {
    if (value === undefined || value === ']' || value === ')') {
        return '';
    }
    return value;
};

const nextQuiz = (quiz: string, use: Piece): string => {
    const name = parsePieceName(use);
    const indexHold = quiz.indexOf('[') + 1;
    const indexCurrent = quiz.indexOf('(') + 1;

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

function start() {
    router.start();

    interval = setInterval(() => {
        nextPage();
    }, 600);
}

export function nextPage() {
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
                highlight: true,
            };
        }
    }

    let hold;
    let nexts;
    let quiz2: string;
    if (comment2.startsWith('#Q=')) {
        quiz2 = nextQuiz(comment2, action.piece);

        const g: (s: string) => Piece = (s) => {
            const s2 = get(s);
            return s2 !== '' ? parsePiece(s2) : Piece.Empty;
        };

        const indexHold = quiz2.indexOf('[') + 1;
        const indexCurrent = quiz2.indexOf('(') + 1;
        hold = g(quiz2[indexHold]);
        // console.log(get(quiz2[indexCurrent]));
        nexts = (get(quiz2[indexCurrent]) + quiz2.substr(indexCurrent + 2, 4)).split('').map(g);
        // console.log(hold, nexts);
    }

    router.setFieldAndComment({
        hold,
        nexts,
        field: nextField,
        comment: comment2,
    });

    if (action.isLock && isMino(action.piece) && comment2.startsWith('#Q=')) {
        comment2 = quiz2!;
    }

    currentPage = (currentPage + 1) % pages.length;
    if (currentPage === 0) {
        const a = '<div style="position: fixed; top: 0; left: 0;">hello</div>';
        M.toast({ html: a, displayLength: 1000 });
    }
}

function stop() {
    if (interval !== undefined) {
        clearInterval(interval);
        interval = undefined;
        router.pause();
    }
}