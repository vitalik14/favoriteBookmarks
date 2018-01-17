/**
 * Created by vitalik on 06.11.2016.
 */
 var search_t = T.id('search_t');
 var removeTextSearch_t = T.id('remove-text-search_t');
 search_t.value = localStorage['lastSearchTabs'] = localStorage['lastSearchTabs'] || '' ;

 search_t.addEventListener('input', listingList);
 removeTextSearch_t.addEventListener('click', removeTextTabs);

function removeTextTabs() {
    search_t.value = '';
    listingList('');
    tags_tabs.activaTag();
}

function togleLocalStorage(alias) {
    if (localStorage[alias] == 'on') {
        localStorage[alias] = 'off';
    } else {
        localStorage[alias] = 'on';
    }
    listingList(localStorage['lastSearchTabs']);
}

T.id('showUrl').checked = localStorage['showUrl'] == 'on';
T.id('showOneLine').checked = localStorage['showOneLine'] == 'on';
T.id('showUrl').addEventListener('click', () => {
    togleLocalStorage('showUrl');
});
T.id('showOneLine').addEventListener('click', () => {
    togleLocalStorage('showOneLine');
});

var modules = {
    saveFrames: function(type) {
        chrome.windows.getAll({
            populate: true,
        }, function(event) {
                app.data = [];
                let list = event;
                for (let i = 0; i < list.length; i++) {
                    let tabs = list[i].tabs;
                    for (let n = 0, length = tabs.length; n < length; n++) {
                        app.data.push(tabs[n]);
                    }
                }
                var removeTabsId = [];
                for (let i = 0, length = app.data.length; i < length; i++) {
                    for (let n = app.data.length - 1; n > i; n--) {
                        if (app.data[i].url === app.data[n].url) {
                            T.id('deleteCopy').style.display = 'block';
                            if (type === 'deleteCopy') {
                                removeTabsId.push(app.data[n].id);
                                app.data.splice(n, 1);
                            }
                        }
                    }
                }
                if (type == 'deleteCopy') {
                    chrome.tabs.remove(removeTabsId, function(e) {
                        T.id('deleteCopy').style.display = 'none';
                        listingList(localStorage['lastSearchTabs']);
                    });
                } else {
                    listingList(localStorage['lastSearchTabs']);
                }
        });
    }
};

T.id('deleteCopy').addEventListener('click', function() {
    modules.saveFrames('deleteCopy');
});

function listingList(word) {
    //console.time("answer time");
    var str;
    var type = typeof word === 'object';
    if (type) {
        str = localStorage['lastSearchTabs'] = word.target.value;
    } else {
        str = localStorage['lastSearchTabs'] = word;
    }

    var el = T.queryOne('.tabs-items'),
        li = '',
        listing;

    el.innerHTML = '';
    listing = app.data;
    if (word && str) {
        if (type) {
            word = str;
        }
        let itog = [], item;
        console.time('for');
        for (let n = 0, length = listing.length; n < length; n++) { 
            item = listing[n];
            let cacheWord = word.toLocaleLowerCase();
            if (!!~((item.title).toLocaleLowerCase()).indexOf(cacheWord) || 
                !!~((item.url).toLocaleLowerCase()).indexOf(cacheWord)
            ) {
                itog.push(item);
            }
        }
        console.timeEnd('for');
        listing = itog;
    }

    T.id('openTabs').innerHTML = listing.length;
    let short = '';

    if (localStorage['showOneLine'] === 'on') {
        short = app.short;
    }
    
    for (let i = 0, length = listing.length; i < length; i++) {
        
        let item = listing[i];
        let url = '';
        let classActive = '';
        let audible = '';
        let favicon = faviconValidate(item.favIconUrl);
        if (item.active) classActive = "active";
        if (localStorage['showUrl'] === 'on') url = item.url;
        if (item.audible) audible = '<div class="audio"></div>';

        li += `
        <li title="${url}" draggable="true" data-id="${item.id}" data-index="${item.index}" class="${classActive}">
            <div class="btn">
                <div class="del">x</div>
            </div>
            <div class="tab ${short}" >
                <img src="${favicon}" alt="" />
                <span>${item.title}</span>
            </div>
            <div class="info">
                ${audible}
            </div>
        </li>`;
    }
    el.insertAdjacentHTML('afterBegin', li);
    var arrTabs = T.query('.tab'),
        arrDels = T.query('.del'),
        arrLi = T.query('#tabs-items li'),
        arrTabsLength = arrTabs.length;

    for (let tab = 0; tab < arrTabsLength; tab++) {
        arrTabs[tab].addEventListener('click', function(el) {
            chrome.tabs.update(+this.parentNode.getAttribute('data-id'), {
                active: true
            }, (el) => {});
        });
        arrDels[tab].addEventListener('click', function(el) {
            var parent = this.parentNode.parentNode;
            chrome.tabs.remove(+parent.getAttribute('data-id'), function(el) {
                parent.remove();
            });
        });
    }
    new DragDrop({
        elements: arrLi,
        type: 'tabs',
        container: 'tabs-items'
    });
    // console.timeEnd("answer time");
}

function initTabs() {
    modules.saveFrames();
}

if (!tags_tabs) {
    var tags_tabs = new Tags({
          search: 'search_t',
          alias: 'tabs_tags',
          container: 'tags_t',
          elAdd: 'addTags_t',
          colorActive: 'rgba(160, 193, 248, 0.4)',
          funcSearch: listingList
     });  
  }
