import { app } from 'hyperapp';
import { Actions, view } from './view';

app({ count: 0 }, new Actions(), view, document.body);

// for unittest
export function hello(): string {
    return 'hello';
}
