import { Page } from './fumen/fumen';
import { ViewError } from './errors';
import { Quiz } from './fumen/quiz';

export function openDescription(pages: ReadonlyArray<Page>, index: number): string {
    const page = pages[index];

    if (page.comment.text !== undefined) {
        return page.comment.text;
    }

    if (page.comment.ref !== undefined) {
        const refPage = pages[page.comment.ref];

        if (refPage.comment.text === undefined) {
            throw new ViewError('Unexpected comment');
        }

        return refPage.comment.text;
    }

    throw new ViewError('Not found comment');
}

export function openQuiz(pages: ReadonlyArray<Page>, index: number): Quiz {
    const page = pages[index];

    if (page.comment.text !== undefined) {
        return new Quiz(page.comment.text);
    }

    if (page.comment.ref === undefined) {
        throw new ViewError('Cannot open reference for comment');
    }

    const ref = page.comment.ref;
    const refPage = pages[ref];

    if (refPage.quiz !== undefined) {
        if (refPage.comment.text === undefined) {
            throw new ViewError('Unexpected reference comment');
        }

        let quiz = new Quiz(refPage.comment.text);
        for (let i = ref; i < index; i += 1) {
            const quizPage = pages[i];
            if (quizPage.quiz === undefined) {
                throw new ViewError('Unexpected quiz operation');
            }

            if (quizPage.quiz.operation !== undefined) {
                quiz = quiz.operate(quizPage.quiz.operation);
            }
        }
        return quiz;
    }

    throw new ViewError('Not found quiz');
}
