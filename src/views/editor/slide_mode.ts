import { div } from '@hyperapp/html';
import { dualButton, iconContents, toolButton, toolSpace } from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';

export const slideMode = ({ layout, actions }: {
    layout: EditorLayout;
    actions: {
        shiftToLeft: () => void;
        shiftToRight: () => void;
        shiftToUp: () => void;
        shiftToBottom: () => void;
        changeToUtilsMode: () => void;
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
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-slide-to-up',
            key: 'btn-slide-to-up',
            onclick: () => actions.shiftToUp(),
        }, iconContents({
            description: '',
            iconSize: 22,
            iconName: 'keyboard_arrow_up',
        })),
        dualButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
        }, {
            datatest: 'btn-slide-to-left',
            key: 'btn-slide-to-left',
            onclick: () => actions.shiftToLeft(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'keyboard_arrow_left',
            }),
        }, {
            datatest: 'btn-slide-to-right',
            key: 'btn-slide-to-right',
            onclick: () => actions.shiftToRight(),
            contents: iconContents({
                description: '',
                iconSize: 23,
                iconName: 'keyboard_arrow_right',
            }),
        }),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-slide-to-down',
            key: 'btn-slide-to-down',
            onclick: () => actions.shiftToBottom(),
        }, iconContents({
            description: '',
            iconSize: 22,
            iconName: 'keyboard_arrow_down',
        })),
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#f44336',
            datatest: 'btn-piece-mode',
            key: 'btn-piece-mode',
            onclick: () => actions.changeToUtilsMode(),
        }, iconContents({
            description: 'Back',
            iconSize: 25,
            iconName: 'chevron_left',
        })),
    ]);
};
