import { h } from 'hyperapp';
import { Page } from '../../lib/fumen/types';
import { CommentType, Screens } from '../../lib/enums';
import { componentize } from '../componentize';
import { managers } from '../../repository/managers';
import { Scenes } from '../../repository/modals/manager';
import { ComponentWithText, px, style } from '../../lib/types';
import { i18n } from '../../locales/keys';

declare const M: any;

interface Props {
    version: string;
    pages: Page[];
    screen: Screens;
    currentIndex: number;
    maxPageIndex: number;
    comment: CommentType;
    ghostVisible: boolean;
}

interface Actions {
    changeToReaderScreen: () => void;
    changeToDrawerScreen: () => void;
    changeToDrawingToolMode: () => void;
    changeCommentMode: (data: { type: CommentType }) => void;
    fixInferencePiece: () => void;
    clearInferencePiece: () => void;
    firstPage: () => void;
    lastPage: () => void;
    clearToEnd: () => void;
    clearPast: () => void;
    changeGhostVisible: (data: { visible: boolean }) => void;
    reopenCurrentPage: () => void;

    loadNewFumen: () => any;
}

interface Locals {
}

export const MenuModal = componentize<Props, Actions, Locals>({}, (hub, initState, actions) => {
    // Members

    let modalInstance: { close: () => void } | undefined;

    const divProperties = style({
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'start',
        alignItems: 'center',
    });

    // Watches

    // Callbacks

    const onCreateModal = (element: HTMLDivElement) => {
        const instance = M.Modal.init(element, {
            onOpenEnd: () => {
                const element = document.getElementById('textarea-fumen');
                if (element !== null) {
                    element.focus();
                }
            },
            onCloseStart: () => {
                managers.modals.close(Scenes.Menu);
            },
        });

        instance.open();

        modalInstance = instance;
    };

    const onDestroyModal = () => {
        if (modalInstance !== undefined) {
            modalInstance.close();
        }
    };

    return {
        render: (
            { version, screen, currentIndex, maxPageIndex, comment, ghostVisible },
        ) => {
            return (
                <div key="menu-modal-top">
                    <div key="mdl-open-fumen" datatest="mdl-open-fumen"
                         className="modal bottom-sheet" oncreate={onCreateModal} ondestroy={onDestroyModal}>
                        <div key="modal-content" className="modal-content">

                            <h4 key="memu-title">
                                {i18n.Menu.Title()}&nbsp;
                                <span style={style({
                                    color: '#999',
                                    fontSize: '50%',
                                })}>[{i18n.Menu.Build(version)}]</span>
                            </h4>

                            <div key="menu-top" style={divProperties}>
                                {screen === Screens.Editor ?
                                    <SettingButton key="btn-readonly" datatest="btn-readonly" href="#"
                                                   icons={[{ name: 'visibility', size: 31.25 }]}
                                                   onclick={() => {
                                                       actions.changeToReaderScreen();
                                                       managers.modals.closeAll();
                                                   }}>{i18n.Menu.Buttons.Readonly()}</SettingButton>
                                    : undefined}

                                {screen === Screens.Reader ?
                                    <SettingButton key="btn-writable" datatest="btn-writable" href="#"
                                                   icons={[{ name: 'mode_edit', size: 31.25 }]}
                                                   onclick={() => {
                                                       actions.changeToDrawerScreen();
                                                       actions.changeToDrawingToolMode();
                                                       managers.modals.closeAll();
                                                   }}>{i18n.Menu.Buttons.Writable()}</SettingButton>
                                    : undefined}

                                <SettingButton key="btn-copy-fumen" datatest="btn-copy-fumen" href="#"
                                               icons={[{ name: 'content_copy', size: 29.3 }]}
                                               onclick={() => {
                                                   actions.fixInferencePiece();
                                                   managers.modals.next(Scenes.Clipboard);
                                               }}>
                                    {i18n.Menu.Buttons.Clipboard()}
                                </SettingButton>

                                <SettingButton key="btn-new-fumen" datatest="btn-new-fumen" href="#"
                                               icons={[{ name: 'insert_drive_file', size: 32.3 }]}
                                               onclick={() => {
                                                   actions.fixInferencePiece();
                                                   actions.clearInferencePiece();
                                                   actions.loadNewFumen();
                                                   actions.changeToDrawerScreen();
                                                   actions.changeToDrawingToolMode();
                                                   managers.modals.closeAll();
                                               }}>
                                    {i18n.Menu.Buttons.New()}
                                </SettingButton>

                                <SettingButton key="btn-append-fumen" datatest="btn-append-fumen" href="#"
                                               icons={[{ name: 'library_add', size: 29 }]}
                                               onclick={() => {
                                                   managers.modals.next(Scenes.Append);
                                               }}>
                                    {i18n.Menu.Buttons.Append()}
                                </SettingButton>

                                <SettingButton key="btn-first-page" datatest="btn-first-page" href="#"
                                               icons={[{ name: 'fast_rewind', size: 32.3 }]}
                                               onclick={() => {
                                                   actions.firstPage();
                                                   managers.modals.closeAll();
                                               }}>
                                    {i18n.Menu.Buttons.FirstPage()}
                                </SettingButton>

                                <SettingButton key="btn-last-page" datatest="btn-last-page" href="#"
                                               icons={[{ name: 'fast_forward', size: 32.3 }]}
                                               onclick={() => {
                                                   actions.lastPage();
                                                   managers.modals.closeAll();
                                               }}>
                                    {i18n.Menu.Buttons.LastPage()}
                                </SettingButton>

                                <SettingButton key="btn-clear-past" datatest="btn-clear-past" href="#"
                                               icons={[{ name: 'arrow_back', size: 18 }, { name: 'clear', size: 28 }]}
                                               textSize={12} enable={0 < currentIndex}
                                               onclick={() => {
                                                   actions.clearPast();
                                                   managers.modals.closeAll();
                                               }}>
                                    {i18n.Menu.Buttons.ClearPast()}
                                </SettingButton>

                                <SettingButton key="btn-clear-to-end" datatest="btn-clear-to-end" href="#"
                                               icons={[{ name: 'clear', size: 28 }, {
                                                   name: 'arrow_forward',
                                                   size: 18,
                                               }]}
                                               textSize={12} enable={currentIndex < maxPageIndex - 1}
                                               onclick={() => {
                                                   actions.clearToEnd();
                                                   managers.modals.closeAll();
                                               }}>
                                    {i18n.Menu.Buttons.ClearToEnd()}
                                </SettingButton>

                                {comment !== CommentType.PageSlider ?
                                    <SettingButton key="btn-page-slider" href="#"
                                                   datatest="btn-page-slider"
                                                   icons={[{ name: 'looks_one', size: 30 }]}
                                                   onclick={() => {
                                                       actions.changeCommentMode({ type: CommentType.PageSlider });
                                                       managers.modals.closeAll();
                                                   }}>
                                        {i18n.Menu.Buttons.PageSlider()}
                                    </SettingButton>
                                    : undefined}

                                {screen === Screens.Reader && comment === CommentType.PageSlider ?
                                    <SettingButton key="btn-show-comment" href="#"
                                                   datatest="btn-show-comment"
                                                   icons={[{ name: 'text_fields', size: 32 }]}
                                                   onclick={() => {
                                                       actions.changeCommentMode({ type: CommentType.Writable });
                                                       managers.modals.closeAll();
                                                   }}>
                                        {i18n.Menu.Buttons.ShowComment()}
                                    </SettingButton>
                                    : undefined}

                                {screen === Screens.Editor && comment !== CommentType.Writable ?
                                    <SettingButton key="btn-comment-writable" href="#"
                                                   datatest="btn-comment-writable"
                                                   icons={[{ name: 'text_fields', size: 32 }]}
                                                   onclick={() => {
                                                       actions.changeCommentMode({ type: CommentType.Writable });
                                                       managers.modals.closeAll();
                                                   }}>
                                        {i18n.Menu.Buttons.WritableComment()}
                                    </SettingButton>
                                    : undefined}

                                {screen === Screens.Editor && comment !== CommentType.Readonly ?
                                    <SettingButton key="btn-comment-readonly" href="#"
                                                   datatest="btn-comment-readonly"
                                                   icons={[{ name: 'lock_outline', size: 30 }]}
                                                   enable={screen === Screens.Editor}
                                                   onclick={screen === Screens.Editor ? () => {
                                                       actions.changeCommentMode({ type: CommentType.Readonly });
                                                       managers.modals.closeAll();
                                                   } : () => {
                                                       M.toast({
                                                           html: i18n.Menu.Messages.NoAvailableCommentButton(),
                                                           classes: 'top-toast',
                                                           displayLength: 3000,
                                                       });
                                                   }}>
                                        {i18n.Menu.Buttons.ReadonlyComment()}
                                    </SettingButton>
                                    : undefined}

                                <SettingButton key="btn-ghost-toggle" href="#"
                                               datatest="btn-ghost-toggle"
                                               icons={[{
                                                   name: ghostVisible ? 'visibility_off' : 'pageview',
                                                   size: 32,
                                               }]}
                                               onclick={() => {
                                                   actions.changeGhostVisible({ visible: !ghostVisible });
                                                   actions.reopenCurrentPage();
                                                   managers.modals.closeAll();
                                               }}>
                                    {ghostVisible ? i18n.Menu.Buttons.GhostOff() : i18n.Menu.Buttons.GhostOn()}
                                </SettingButton>

                                <SettingButton key="btn-help" datatest="btn-help" href="./help.html"
                                               icons={[{ name: 'help_outline', size: 31.25 }]}>
                                    {i18n.Menu.Buttons.Help()}
                                </SettingButton>

                                <div style={style({ height: px(10), width: '100%' })}/>
                            </div>
                        </div>
                    </div>
                </div>
            );
        },
    };
});

interface SettingButtonProps {
    href?: string;
    onclick?: (event: MouseEvent) => void;
    icons: { name: string, size: number }[];
    key: string;
    datatest: string;
    textSize?: number;
    enable?: boolean;
}

export const SettingButton: ComponentWithText<SettingButtonProps> = (
    { href = '#', key, onclick, icons, datatest, textSize = 13, enable = true }, showName,
) => {
    const iconsElements = icons.map(icon => (
        <i key={`${key}-icon-${icon.name}`} className={`material-icons ${enable ? ' ' : 'disabled'}`}
           style={style({
               fontSize: px(icon.size),
           })}
        >
            {icon.name}
        </i>
    ));
    return <a key={key} href={href} onclick={onclick !== undefined ? (event: MouseEvent) => {
        onclick(event);
        event.stopPropagation();
        event.preventDefault();
    } : undefined}>
        <div key={`${key}-icon`} datatest={datatest}
             className={`z-depth-1 ${enable ? ' ' : 'disabled'}`}
             style={style({
                 width: px(50),
                 height: px(40),
                 lineHeight: px(40),
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 color: enable ? '#333' : '#bdbdbd',
                 margin: px(5),
                 border: `solid 1px ${enable ? '#999' : '#bdbdbd'}`,
                 boxSizing: 'border-box',
                 cursor: 'pointer',
             })}
        >
            {...iconsElements}
        </div>

        <div key={`${key}-text`}
             style={style({ textAlign: 'center', fontSize: px(textSize), color: enable ? '#333' : '#bdbdbd' })}>
            {showName}
        </div>
    </a>;
};
