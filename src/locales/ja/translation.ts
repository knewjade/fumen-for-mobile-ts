export const resources = {
    Top: {
        RestoreFromStorage: '最後の状態が復元されました',
    },
    OpenFumen: {
        Title: 'テト譜を開く',
        Buttons: {
            Open: '開く',
            Cancel: 'キャンセル',
        },
        Errors: {
            FailedToLoad: 'テト譜を読み込めませんでした',
        },
    },
    AppendFumen: {
        Title: 'テト譜を追加',
        Errors: {
            FailedToLoad: 'テト譜を読み込めませんでした',
        },
    },
    UserSettings: {
        Title: 'ユーザー設定',
        Notice: 'ブラウザのキャッシュを削除すると、これらの設定は初期化されます。',
        Ghost: {
            Title: 'ゴーストの表示',
            Off: () => 'しない',
            On: () => 'する',
        },
        Loop: {
            Title: 'ページ移動のループ [Reader]',
            Off: () => '無効',
            On: () => '有効',
        },
        Buttons: {
            Save: '保存',
            Cancel: 'キャンセル',
        },
    },
    Clipboard: {
        Title: 'クリップボードにコピー',
    },
    Menu: {
        Messages: {
            NoAvailableCommentButton: 'Writableモードのときだけ変更できます',
        },
    },
    Navigator: {
        OpenInPC: 'PC版で開く',
        ExternalFumenURL: 'https://fumen.zui.jp/?{{data}}',
    },
};
