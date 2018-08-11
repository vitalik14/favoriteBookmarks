/**
 * Created by vitalik on 06.11.2016.
 */
var search_bookmarks = T.id('search_bookmarks');
var removeTextSearchBookmarks = T.id('remove-text-search_b');
var listBookmarks = T.id('results_b');
var findBookmarks = T.id('findBookmarks');
var selectSort = T.id('selectSort_b');
var btnOpenFindBookmarks = T.id('openBookmarks');

var timeoutBookmarks;
var timeoutInputBookmarks = 0;
search_bookmarks.addEventListener('input', (el) => {
	clearTimeout(timeoutInputBookmarks);
	timeoutInputBookmarks = setTimeout(() => {
		searchBookmarks(el);
	}, 800);
});
removeTextSearchBookmarks.addEventListener('click', removeTextBookmarks);
btnOpenFindBookmarks.addEventListener('click', openFindBookmarks);
search_bookmarks.value = localStorage['lastSearchBookmarks'];

function openFindBookmarks(el) {
	T.query('#results_b > li > a').forEach(function(e) {
		 chrome.tabs.create({url: e.getAttribute('href')}, function(){});
	 });
}

function removeTextBookmarks(el, sort, interval) {
	search_bookmarks.value = '';
	searchBookmarks('', {sort: search_bookmarks.value, interval: 0});
	tags_bookmarks.activaTag();
}

function searchBookmarks(el, data) {
	if (!data) { // event in input
		var data = {
			sort: T.storage('sortBookmarks'),
			interval: 0
		};
	}
	let str;
	if (typeof el == 'object') {
		str = localStorage['lastSearchBookmarks'] = el.target.value;
	} else {
		str = localStorage['lastSearchBookmarks'] = el;
	}
	findBookmarks.innerHTML = '0';
	listBookmarks.innerHTML = '';

	showHideBtnOpenBookmarks(true);

	if (str.length < 2) return false;

	clearInterval(timeoutBookmarks);
	T.id('loader-bookmarks').classList.add('active');
	timeoutBookmarks = setTimeout(() => {
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
				let item = tree[i];
				let title = (item.title && T.escapeHtml(item.title)) || item.url.split('/')[2];

				if (item.url === undefined) continue;
				
				let div = document.createElement('li');
				div.setAttribute('data-id', item.id);
				let dateAdded = (new Date(item.dateAdded)).toLocaleString();
				try {
					div.innerHTML = `
					<div class="deleteBookmarks">x</div>
					<a style="background-image:url(chrome://favicon/${item.url})" href=${item.url} title="${item.url}">${title}</a>
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
					chrome.tabs.create({ url: this.getAttribute('href') }, null);
				});
				try {
					div.children[0].addEventListener('click', function() {
						let current = this.parentNode;
						chrome.bookmarks.remove(current.getAttribute('data-id'), () => current.remove());
					});
				} catch (e) {

				}
				listBookmarks.appendChild(div);
			}
			T.id('loader-bookmarks').classList.remove('active');
			showHideBtnOpenBookmarks();
		});
	}, data.interval || 250);
}

function initBookmarks() {
	searchBookmarks(localStorage['lastSearchBookmarks'], {sort: localStorage['sortBookmarks'], interval:0});  
}

selectSort.value = localStorage['sortBookmarks'];
selectSort.addEventListener('change', function(el) {
	localStorage['sortBookmarks'] = this.value;
	searchBookmarks(localStorage['lastSearchBookmarks'], {sort: this.value, interval: 0});
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

const tags_bookmarks = new Tags({
	search: 'search_bookmarks',
	alias: 'bookmark_tags',
	container: 'tags_b',
	elAdd: 'addTags_b',
	colorActive: 'rgba(77, 192, 177, 0.4)',
	funcSearch: searchBookmarks
});