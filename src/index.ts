import { app } from 'hyperapp';
import { actions } from './actions';
import { view } from './view';
import { initState } from './states';

app(initState, actions, view, document.body);

// for unittest
export function hello(): string {
    return 'hello';
}
