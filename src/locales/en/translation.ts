export const resources = {
    Top: {
        RestoreFromStorage: 'Restored to last state',
    },
    OpenFumen: {
        Title: 'Open fumen',
        PlaceHolder: 'URL or v115@~ / Support v115 or v110',
        Buttons: {
            Open: 'Open',
            Cancel: 'Cancel',
        },
        Errors: {
            FailedToLoad: 'Failed to load',
            Unexpected: 'Unexpected error: {{message}}',
        },
    },
    AppendFumen: {
        Title: 'Append fumen',
        PlaceHolder: 'URL or v115@~ / Support v115 or v110',
        Buttons: {
            Cancel: 'Cancel',
        },
        Errors: {
            FailedToLoad: 'Failed to load',
            Unexpected: 'Unexpected error: {{message}}',
        },
    },
    UserSettings: {
        Title: 'User Settings',
        Notice: 'Clearing the browser cache will initialize the settings.',
        Ghost: {
            Title: 'Show the ghost',
            Off: () => 'Off',
            On: () => 'On',
        },
        Loop: {
            Title: 'Loop on page navigation [Reader]',
            Off: () => 'Off',
            On: () => 'On',
        },
        Buttons: {
            Save: 'Save',
            Cancel: 'Cancel',
        },
    },
    Clipboard: {
        Title: 'Copy to clipboard',
        Buttons: {
            Close: 'Close',
        },
    },
    Menu: {
        Title: 'Menu',
        Build: 'build {{version}}',
        Buttons: {
            Readonly: 'Readonly',
            Writable: 'Edit',
            Clipboard: 'Clipboard',
            FirstPage: 'FirstPage',
            LastPage: 'LastPage',
            New: 'New',
            Open: 'Open',
            Help: 'Help',
            ShowComment: 'ShowText',
            ReadonlyComment: 'ReadText',
            WritableComment: 'WriteText',
            PageSlider: 'PageSlider',
            ClearToEnd: 'Clear->',
            ClearPast: '<-Clear',
            Append: 'Append',
            GhostOn: 'GhostOn',
            GhostOff: 'GhostOff',
            UserSettings: 'Settings',
            SavePlayfieldToImage: 'Image/field',
        },
        Messages: {
            NoAvailableCommentButton: 'Available only when writable mode',
        },
    },
    Navigator: {
        OpenInPC: 'Open in Hard Drop',
        ExternalFumenURL: 'https://harddrop.com/fumen/?{{data}}',
    },
};
