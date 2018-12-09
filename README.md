# fumen-for-mobile

### Memo

#### Bookmarklet Code: Load fumen from official page

```
var value = window.location.href;
if (
value.match(/fumen.zui.jp\/\?v115@/) ||
value.match(/fumen.zui.jp\/old\/110/) ||
value.match(/harddrop.com\/fumentool/)
) {
encode(1);
value = document.getElementById('tx').value;
}

window.location.href='https://knewjade.github.io/fumen-for-mobile/index.html?d='+value;
// window.open('https://knewjade.github.io/fumen-for-mobile/index.html?d='+value, '_blank');
```