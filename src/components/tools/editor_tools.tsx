import { Component, px, style } from '../../lib/types';
import { h } from 'hyperapp';
import { ToolButton } from './tool_button';
import { ToolText } from './tool_text';
import { AnimationState, ModeTypes } from '../../lib/enums';
import { ColorPalette } from '../../lib/colors';

interface Props {
    height: number;
    animationState: AnimationState;
    currentPage: number;
    maxPage: number;
    palette: ColorPalette;
    modeType: ModeTypes;
    undoCount: number;
    redoCount: number;
    inferenceCount: number;
    actions: {
        openFumenModal: () => void;
        openSettingsModal: () => void;
        startAnimation: () => void;
        pauseAnimation: () => void;
        backPage: () => void;
        nextPageOrNewPage: () => void;
        changeToDrawingToolMode: () => void;
        undo: () => void;
        redo: () => void;
    };
}

export const EditorTools: Component<Props> = (
    { currentPage, maxPage, height, animationState, palette, modeType, undoCount, redoCount, inferenceCount, actions },
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

    const colors = {
        baseClass: palette.baseClass,
        baseCode: palette.baseCode,
        darkCode: palette.darkCode,
    };
    const themeColor = 'page-footer tools ' + palette.baseClass;

    const pages = `${currentPage} / ${maxPage}`;
    const rightIconName = currentPage < maxPage ? 'keyboard_arrow_right' : 'add';

    return (
        <nav datatest="tools" className={themeColor} style={navProperties}>
            <div className="nav-wrapper" style={divProperties}>

                <ToolButton iconName="undo" datatest="btn-undo" width={35} height={height - 10}
                            key="btn-undo" fontSize={33.75} marginRight={5} colors={colors}
                            actions={{ onclick: () => actions.undo() }} enable={0 < undoCount || 0 < inferenceCount}/>

                <ToolButton iconName="redo" datatest="btn-redo" width={35} height={height - 10}
                            key="btn-redo" fontSize={33.75} marginRight={15} colors={colors}
                            actions={{ onclick: () => actions.redo() }} enable={0 < redoCount}/>

                <ToolButton iconName="keyboard_arrow_left" datatest="btn-back-page" width={35} height={height - 10}
                            key="btn-back-page" fontSize={33.75} marginRight={5} colors={colors}
                            actions={{ onclick: () => actions.backPage() }} enable={1 < currentPage}/>

                <ToolText datatest="text-pages" height={height - 10}
                          minWidth={75} fontSize={18} marginRight={5}>
                    {pages}
                </ToolText>

                <ToolButton iconName={rightIconName} datatest="btn-next-page" width={35} height={height - 10}
                            key="btn-next-page" fontSize={33.75} marginRight={10} colors={colors}
                            actions={{ onclick: () => actions.nextPageOrNewPage() }}/>

                <ToolButton iconName="home" datatest="btn-drawing-tool" width={40} height={height - 10}
                            key="btn-drawing-tool" fontSize={30} marginRight={40} colors={colors}
                            actions={{ onclick: () => actions.changeToDrawingToolMode() }}/>

                {/*<ToolButton iconName="pan_tool" datatest="btn-put-piece" width={35} height={height - 10}*/}
                {/*fontSize={29} colors={colors}*/}
                {/*actions={{ onclick: () => actions.changeToPieceMode() }}/>*/}

                <ToolButton iconName="settings" datatest="btn-open-settings" sticky={true}
                            key="btn-open-settings" width={40} height={height - 10} fontSize={31.25} colors={colors}
                            actions={{ onclick: () => actions.openSettingsModal() }}/>
            </div>
        </nav>
    );
};
