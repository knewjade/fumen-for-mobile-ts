import { div } from '@hyperapp/html';
import { iconContents, toolButton } from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';
import { TouchTypes } from '../../lib/enums';

export const utilsMode = ({ layout, touchType, actions }: {
    layout: EditorLayout;
    touchType: TouchTypes;
    actions: {
        changeToShiftMode: () => void;
        changeToFillRowMode: () => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        toolButton({
            borderWidth: 3,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: touchType === TouchTypes.FillRow ? '#fff' : '#f44336',
            borderType: touchType === TouchTypes.FillRow ? 'double' : undefined,
            datatest: 'btn-fill-row-mode',
            key: 'btn-fill-row-mode',
            onclick: () => actions.changeToFillRowMode(),
        }, iconContents({
            description: 'row',
            iconSize: 24,
            iconName: 'power_input',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'red',
            textColor: '#fff',
            borderColor: '#f44336',
            datatest: 'btn-slide-mode',
            key: 'btn-slide-mode',
            onclick: () => actions.changeToShiftMode(),
        }, iconContents({
            description: 'slide',
            iconSize: 24,
            iconName: 'swap_vert',
        })),
    ]);
};
