import { NextState, sequence } from './commons';
import { action, main } from '../actions';
import { AnimationState } from '../lib/enums';

export interface AnimationActions {
    startAnimation: () => action;
    pauseAnimation: () => action;
}

export const animationActions: Readonly<AnimationActions> = {
    startAnimation: () => (state): NextState => {
        return sequence(state, [
            animationActions.pauseAnimation(),
            () => ({
                play: {
                    ...state.play,
                    status: AnimationState.Play,
                },
                handlers: {
                    animation: setInterval(() => {
                        main.nextLoopPage();
                    }, state.play.intervalTime),
                },
            }),
        ]);
    },
    pauseAnimation: () => (state): NextState => {
        if (state.handlers.animation === undefined) {
            return undefined;
        }

        clearInterval(state.handlers.animation);

        return {
            play: {
                ...state.play,
                status: AnimationState.Pause,
            },
            handlers: {
                animation: undefined,
            },
        };
    },
};
