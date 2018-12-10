# fumen-for-mobile

### Memo

#### Bookmarklet Code: Load fumen from official page

```
var value = window.location.href;
if (
    value.match(/fumen.zui.jp\/\?v115@/) ||
    value.match(/fumen.zui.jp\/old\/110/) ||
    value.match(/harddrop.com\/fumen[tool]*/)
) {
    encode(1);
    value = document.getElementById('tx').value;
}

// window.location.href='https://knewjade.github.io/fumen-for-mobile/#?d='+value;
window.open('https://knewjade.github.io/fumen-for-mobile/#?d='+value, '_blank');
```

```
javascript:(function(){###CODE###})()
```