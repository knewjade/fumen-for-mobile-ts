import { Component, px, style } from '../../lib/types';
import { h } from 'hyperapp';
import { ToolButton } from './tool_button';
import { ToolText } from './tool_text';
import { AnimationState } from '../../lib/enums';
import { ColorPalette } from '../../lib/colors';

interface Props {
    currentPage: number;
    maxPage: number;
    height: number;
    animationState: AnimationState;
    pages: string;
    palette: ColorPalette;
    actions: {
        changeToDrawerScreen: (data: { refresh?: boolean }) => void;
        openMenuModal: () => void;
        startAnimation: () => void;
        pauseAnimation: () => void;
        backPage: () => void;
        nextPage: () => void;
    };
}

export const ReaderTools: Component<Props> = (
    { currentPage, maxPage, height, animationState, pages, palette, actions },
) => {
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

    const themeColor = `page-footer tools ${palette.baseClass}`;

    return (
        <nav datatest="tools" className={themeColor} style={navProperties}>
            <div className="nav-wrapper" style={divProperties}>

                <ToolButton iconName="mode_edit" datatest="btn-writable" width={45} height={height - 10}
                            key="btn-writable" fontSize={33.75} marginRight={10} colors={palette}
                            actions={{
                                onclick: () => {
                                    actions.changeToDrawerScreen({ refresh: true });
                                },
                            }}/>

                <ToolButton iconName="navigate_before" datatest="btn-back-page" width={35} height={height - 10}
                            key="btn-back-page" fontSize={33.75} marginRight={5} colors={palette}
                            actions={{ onclick: () => actions.backPage() }} enable={1 < currentPage}/>

                <ToolText datatest="text-pages" height={height - 10}
                          minWidth={75} fontSize={18} marginRight={5}>
                    {pages}
                </ToolText>

                <ToolButton iconName="navigate_next" datatest="btn-next-page" width={35} height={height - 10}
                            key="btn-next-page" fontSize={33.75} marginRight={10} colors={palette}
                            actions={{ onclick: () => actions.nextPage() }} enable={currentPage < maxPage}/>

                <ToolButton iconName={animationState !== 'pause' ? 'pause' : 'play_arrow'} datatest="btn-play-anime"
                            key="btn-play-anime" width={40} height={height - 10} fontSize={40} colors={palette}
                            marginRight={10}
                            actions={{
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
                            }}/>

                <ToolButton iconName="menu" datatest="btn-open-menu" sticky={true}
                            key="btn-open-menu" width={40} height={height - 10} fontSize={32} colors={palette}
                            actions={{ onclick: () => actions.openMenuModal() }}/>
            </div>
        </nav>
    );
};
