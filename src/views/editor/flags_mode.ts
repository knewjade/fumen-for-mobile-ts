import { div } from '@hyperapp/html';
import { switchButton, switchIconContents, toolSpace } from '../editor_buttons';
import { toolStyle } from './editor';
import { EditorLayout } from '../../componentsv2/editor/layout';

export const flagsMode = ({ layout, currentIndex, flags, actions }: {
    layout: EditorLayout;
    currentIndex: number;
    flags: {
        lock: boolean;
        mirror: boolean;
        rise: boolean;
    },
    actions: {
        removePage: (data: { index: number }) => void;
        changeToDrawingMode: () => void;
        changeLockFlag: (data: { index: number, enable: boolean }) => void;
        changeRiseFlag: (data: { index: number, enable: boolean }) => void;
        changeMirrorFlag: (data: { index: number, enable: boolean }) => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        toolSpace({
            flexGrow: 100,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            key: 'div-space',
        }),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-lock-flag',
            key: 'btn-lock-flag',
            onclick: () => actions.changeLockFlag({ index: currentIndex, enable: !flags.lock }),
            enable: flags.lock,
        }, switchIconContents({
            description: 'lock',
            iconSize: 22,
            enable: flags.lock,
        })),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-rise-flag',
            key: 'btn-rise-flag',
            onclick: () => actions.changeRiseFlag({ index: currentIndex, enable: !flags.rise }),
            enable: flags.rise,
        }, switchIconContents({
            description: 'rise',
            iconSize: 22,
            enable: flags.rise,
        })),
        switchButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#333',
            borderColor: '#f44336',
            datatest: 'btn-mirror-flag',
            key: 'btn-mirror-flag',
            onclick: () => actions.changeMirrorFlag({ index: currentIndex, enable: !flags.mirror }),
            enable: flags.mirror,
        }, switchIconContents({
            description: 'mirror',
            iconSize: 22,
            enable: flags.mirror,
        })),
    ]);
};
