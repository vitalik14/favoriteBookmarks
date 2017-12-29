/**
 * Created by vitalik on 06.11.2016.
 */
 localStorage['lastSearchTabs'] = localStorage['lastSearchTabs'] || '' ;

 var search_t = T.id('search_t');
 var removeTextSearch_t = T.id('remove-text-search_t');
 search_t.value = localStorage['lastSearchTabs'];

 search_t.addEventListener('input', listingList);
 removeTextSearch_t.addEventListener('click', removeTextBookmarks);

function removeTextBookmarks() {
    search_t.value = '';
    listingList('');
    tags_tabs.activaTag();
}

T.id('showUrl').checked = localStorage['showUrl'] == 'on';
T.id('showOneLine').checked = localStorage['showOneLine'] == 'on';

function togleLocalStorage(alias) {
    if (localStorage[alias] == 'on') {
        localStorage[alias] = 'off';
    } else {
        localStorage[alias] = 'on';
    }
    listingList(localStorage['lastSearchTabs']);
}

T.id('showUrl').addEventListener('click', () => {
    togleLocalStorage('showUrl');
});
T.id('showOneLine').addEventListener('click', () => {
    togleLocalStorage('showOneLine');
});

var modules = {
    getAll: function(event) {
        chrome.windows.getAll({
            populate: true
        }, function(windowList) {
            app.data = [];
            events.dispatchEvent(Eve('getAll', {
                windowList
            }));
        });
    },
    saveFrames: function(type) {
        function getAll(event) {
            events.removeEventListener('getAll', getAll);
            let list = event.detail.windowList;
            for (let i = 0; i < list.length; i++) {
                let tabs = list[i].tabs;
                for (let n = 0, length = tabs.length; n < length; n++) {
                    let tab = tabs[n];
                    let obj = {
                        id: tab.id,
                        index: tab.index,
                        title: tab.title,
                        url: tab.url,
                        favicon: tab.favIconUrl,
                        audible: tab.audible,
                        active: tab.active
                    };
                    app.data.push(obj);
                }
            }
            var removeTabsId = [];
            for (let i = 0; i < app.data.length; i++) {
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
        }
        events.addEventListener('getAll', getAll);
        modules.getAll();
    },
    deleteCopy: function() {
        modules.saveFrames('deleteCopy');
    }
};
T.id('deleteCopy').addEventListener('click', function() {
    modules.deleteCopy();
});

function listingList(word) {
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
        for (let n = 0, length = listing.length; n < length; n++) { 
            item = listing[n];
            if (!!~((item.title).toLocaleLowerCase()).indexOf(word.toLocaleLowerCase()) || 
                !!~((item.url).toLocaleLowerCase()).indexOf(word.toLocaleLowerCase())
            ) {
                itog.push(item);
            }
        }
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
        let favicon = faviconValidate(item.favicon);
        if (item.active) classActive = "active";
        if (localStorage['showUrl'] === 'on') url = item.url;
        if (item.audible) audible = '<div class="audio"></div>';

        var template = `
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
        li += template;
        
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
}

modules.saveFrames();

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
