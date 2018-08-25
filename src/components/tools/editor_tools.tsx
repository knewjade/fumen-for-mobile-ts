import { Component, px, style } from '../../lib/types';
import { h } from 'hyperapp';
import { ToolButton } from './tool_button';
import { ToolText } from './tool_text';
import { AnimationState } from '../../lib/enums';
import { ColorPalette } from '../../lib/colors';

interface Props {
    height: number;
    animationState: AnimationState;
    currentPage: number;
    maxPage: number;
    palette: ColorPalette;
    actions: {
        openFumenModal: () => void;
        openSettingsModal: () => void;
        startAnimation: () => void;
        pauseAnimation: () => void;
        backPage: () => void;
        nextPageOrNewPage: () => void;
        changeToDrawingToolMode: () => void;
    };
}

export const EditorTools: Component<Props> = ({ currentPage, maxPage, height, animationState, palette, actions }) => {
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

    const colors = {
        baseClass: palette.baseClass,
        darkCode: palette.darkCode,
    };
    const themeColor = 'page-footer tools ' + palette.baseClass;

    const pages = `${currentPage} / ${maxPage}`;
    const rightIconName = currentPage < maxPage ? 'keyboard_arrow_right' : 'add';
    const leftIconName = 1 < currentPage ? 'keyboard_arrow_left' : '';

    return (
        <nav datatest="tools" className={themeColor} style={navProperties}>
            <div className="nav-wrapper" style={divProperties}>

                <ToolButton iconName={leftIconName} datatest="btn-back-page" width={35} height={height - 10}
                            fontSize={33.75} marginRight={10} colors={colors}
                            actions={{ onclick: () => actions.backPage() }}/>

                <ToolText datatest="text-pages" height={height - 10}
                          minWidth={85} fontSize={18} marginRight={10}>
                    {pages}
                </ToolText>

                <ToolButton iconName={rightIconName} datatest="btn-next-page" width={35} height={height - 10}
                            fontSize={33.75} marginRight={10} colors={colors}
                            actions={{ onclick: () => actions.nextPageOrNewPage() }}/>

                {/*<ToolButton iconName="edit" datatest="btn-block-mode" width={35} height={height - 10}*/}
                {/*fontSize={32} marginRight={10} colors={colors}*/}
                {/*actions={{ onclick: () => actions.changeToDrawingMode() }}/>*/}

                <ToolButton iconName="build" datatest="btn-drawing-tool" width={45} height={height - 10}
                            fontSize={27} marginRight={20} colors={colors}
                            actions={{ onclick: () => actions.changeToDrawingToolMode() }}/>

                {/*<ToolButton iconName="pan_tool" datatest="btn-put-piece" width={35} height={height - 10}*/}
                {/*fontSize={29} colors={colors}*/}
                {/*actions={{ onclick: () => actions.changeToPieceMode() }}/>*/}

                <ToolButton iconName="settings" datatest="btn-open-settings" sticky={true}
                            width={45} height={height - 10} fontSize={31.25} colors={colors}
                            actions={{ onclick: () => actions.openSettingsModal() }}/>
            </div>
        </nav>
    );
};
