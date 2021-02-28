import { div } from '@hyperapp/html';
import { iconContents, toolButton } from '../editor_buttons';
import { EditorLayout, toolStyle } from './editor';

export const commentMode = ({ layout, currentIndex, actions }: {
    layout: EditorLayout;
    currentIndex: number;
    actions: {
        setCommentText: (data: { text: string, pageIndex: number }) => void;
        resetCommentText: (data: { pageIndex: number }) => void;
    };
}) => {
    const toolButtonMargin = 5;

    return div({ style: toolStyle(layout) }, [
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-comment-blank',
            key: 'btn-comment-blank',
            onclick: () => {
                actions.setCommentText({ text: '', pageIndex: currentIndex });
            },
        }, iconContents({
            description: 'blank',
            iconSize: 22,
            iconName: 'format_strikethrough',
        })),
        toolButton({
            borderWidth: 1,
            width: layout.buttons.size.width,
            margin: toolButtonMargin,
            backgroundColorClass: 'white',
            textColor: '#333',
            borderColor: '#333',
            datatest: 'btn-comment-inherit',
            key: 'btn-comment-inherit',
            onclick: () => {
                actions.resetCommentText({ pageIndex: currentIndex });
            },
        }, iconContents({
            description: 'inherit',
            iconSize: 22,
            iconName: 'forward',
        })),
    ]);
};
