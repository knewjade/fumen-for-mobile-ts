export const getURLQuery = () => {
    // Query文字列を取得
    let search = '';
    if (location.search !== '') {
        search = location.search.substr(1);
    } else {
        const hash = location.hash;
        const index = hash.indexOf('?');
        if (index !== -1) {
            search = hash.substr(index + 1);
        }
    }

    // クエリーの抽出
    const url = decodeURIComponent(search);
    const array = url.split('&');
    return {
        get: (name: string): string | undefined => {
            const data = array.find(value => value.startsWith(`${name}=`));
            if (!data) {
                return undefined;
            }
            return data.substr(name.length + 1);
        },
    };
};
