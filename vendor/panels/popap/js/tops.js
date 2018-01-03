/**
 * Created by vitalik on 06.11.2016.
 */
//chrome://theme/IDR_EXTENSIONS_FAVICON@2x

function getTopSites () {

    chrome.topSites.get(function(el) {
        let list = T.id('tabs_wrap_topsites');
        for (let i in el) {
            let a = document.createElement('a');
            let item = el[i];
            a.setAttribute('href', item.url);
            a.setAttribute('title', item.url);
            a.style.backgroundImage = 'url(chrome://favicon/' + item.url + ')';
            a.addEventListener('click', function() {
                chrome.tabs.create({url: this.getAttribute('href')},()=>{});
            });
            a.innerHTML = item.title;
            list.appendChild(a);
        }
    });
}