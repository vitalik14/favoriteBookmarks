/**
 * Created by vitalik on 06.11.2016.
 */
var search = T.id('search_b');
var removeTextSearch = T.id('remove-text-search_b');
var listBookmarks = T.id('results_b');
var findBookmarks = T.id('findBookmarks');
var selectSort = T.id('selectSort_b');
var btnOpenFindBookmarks = T.id('openBookmarks');

var timeout;

search.addEventListener('input', searchBookmarks);
removeTextSearch.addEventListener('click', removeTextBookmarks);
btnOpenFindBookmarks.addEventListener('click', openFindBookmarks);

function openFindBookmarks(el) {
    T.query('#results_b > li > a').forEach(function(e) {
         chrome.tabs.create({url: e.getAttribute('href')}, ()=>{});
     });
}

function removeTextBookmarks(el, sort, interval) {
    search.value = '';
    searchBookmarks('', {sort: search.value, interval: 0});
    tags_bookmarks.activaTag();
}

function searchBookmarks(el, data) {
    //console.log('searchBookmarks');
    console.time("time");
    if (!data) { // event in input
        var data = {
            sort: T.storage('sortBookmarks'),
            interval: 0
        };
    }
    var str;
    if (typeof el == 'object') {
        str = localStorage['lastSearch'] = el.target.value;
    } else {
        str = localStorage['lastSearch'] = el;
    }
    findBookmarks.innerHTML = '0';
    listBookmarks.innerHTML = '';

    showHideBtnOpenBookmarks(true);

    if (str.length < 2) return false;

    clearInterval(timeout);
    timeout = setTimeout(function() {
        chrome.bookmarks.search(str, function(tree) {
            data.sort = data.sort || localStorage['sortBookmarks'];

            function compare(a, b) {
                if (a[data.sort] > b[data.sort])
                    return -1;
                if (a[data.sort] < b[data.sort])
                    return 1;
                return 0;
            }
            tree.sort(compare);
            findBookmarks.innerHTML = tree.length;
            for (let i = 0, length = tree.length; i < length; i++) {
                // if (i > 60) break;
                let item = tree[i];
                if (item.url === undefined) continue;
                
                let div = document.createElement('li');
                div.setAttribute('data-id', item.id);
                let dateAdded = (new Date(item.dateAdded)).toLocaleString();
                try {
                    div.innerHTML = `
                    <div class="deleteBookmarks">x</div>
                    <a style="background-image:url(chrome://favicon/${item.url})" href=${item.url} title="${item.url}">${item.title || 'no title'}</a>
                    <div class="info">
                        <div class="bookmarks_info">&#9733;</div>
                        <div class="popap" title="${dateAdded}">
                            <div class="data">${dateAdded}</div>
                        </div>
                    </div>`;
                } catch(e) {
                    console.log(e +  'error !!');
                }

                div.children[1].addEventListener('click', function() {
                    chrome.tabs.create({ url: this.getAttribute('href') }, ()=>{});
                });
                try {
                    div.children[0].addEventListener('click', function() {
                        var current = this.parentNode;
                        chrome.bookmarks.remove(current.getAttribute('data-id'), function() {
                            current.remove();
                        });
                    });
                } catch (e) {

                }
                listBookmarks.appendChild(div);
            }
            showHideBtnOpenBookmarks();
            // console.timeEnd(); 
        });
        
    }, data.interval || 300);
    console.timeEnd("time");
}

search.value = localStorage['lastSearch'];

function initBookmarks() {
    searchBookmarks(localStorage['lastSearch'], {sort: localStorage['sortBookmarks'], interval:0});  
}

selectSort.value = localStorage['sortBookmarks'];
selectSort.addEventListener('change', function(el) {
    localStorage['sortBookmarks'] = this.value;
	searchBookmarks(localStorage['lastSearch'], {sort: this.value, interval: 0});
});

function showHideBtnOpenBookmarks(hide) {
    if (hide) {
        T.id('openBookmarks').style.display = 'none';
    } else if (!!document.querySelector('.t_bookmarks .results div')) {
        T.id('openBookmarks').style.display = 'block';
    } else {
        T.id('openBookmarks').style.display = 'none';
    }
}

showHideBtnOpenBookmarks();

if (!tags_bookmarks) {
    var tags_bookmarks = new Tags({
          search: 'search_b',
          alias: 'vt_tags',
          container: 'tags_b',
          elAdd: 'addTags_b',
          colorActive: 'rgba(77, 192, 177, 0.4)',
          funcSearch: searchBookmarks
     });  
  }