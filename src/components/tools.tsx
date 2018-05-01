import { Component, px, style } from '../lib/types';
import { h } from 'hyperapp';
import { ToolButton } from './tool_button';
import { ToolText } from './tool_text';
import { AnimationState } from '../lib/enums';

interface Props {
    height: number;
    animationState: AnimationState;
    pages: string;
    actions: {
        openFumenModal: () => void;
        openSettingsModal: () => void;
        startAnimation: () => void;
        pauseAnimation: () => void;
    };
}

export const Tools: Component<Props> = ({ height, animationState, pages, actions }) => {
    const navProperties = style({
        width: '100%',
        height: px(height),
        margin: 0,
        padding: 0,
    });

    const divProperties = style({
        width: '100%',
        height: px(height),
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    });

    return (
        <nav datatest="tools" className="teal page-footer tools" style={ navProperties }>
            <div className="nav-wrapper" style={ divProperties }>

                <ToolButton iconName="open_in_new" datatest="btn-open-fumen" width={ 55 } height={ height - 10 }
                            fontSize={ 33.75 } marginRight={ 10 }
                            actions={ { onclick: () => actions.openFumenModal() } }/>

                <ToolText datatest="text-pages" height={ height - 10 }
                          minWidth={ 85 } fontSize={ 18 } marginRight={ 10 }>
                    { pages }
                </ToolText>

                <ToolButton iconName={ animationState !== 'pause' ? 'pause' : 'play_arrow' } datatest="btn-play-anime"
                            width={ 50 } height={ height - 10 } fontSize={ 45.375 } marginRight={ 10 }
                            actions={ {
                                onclick: () => {
                                    switch (animationState) {
                                    case AnimationState.Play:
                                        actions.pauseAnimation();
                                        break;
                                    default:
                                        actions.startAnimation();
                                        break;
                                    }
                                },
                            } }/>

                <ToolButton iconName="settings" datatest="btn-open-settings" sticky={ true }
                            width={ 45 } height={ height - 10 } fontSize={ 31.25 }
                            actions={ { onclick: () => actions.openSettingsModal() } }/>

            </div>
        </nav>
    );
};
