
var app = {
	data: [],
	emptyImg: 'img/empty.png',
	short: 'short',
	sortDefault: 'dateAdded',
	current: {
		tabs: false,
		bookmarks: false,
		// tops: false,
		history: false
	}
};

localStorage['showUrl'] = localStorage['showUrl'] || 'on';
localStorage['showOneLine'] = localStorage['showOneLine'] || 'on';
localStorage['tabs'] = localStorage['tabs'] || '1';

localStorage['lastSearchTabs'] = localStorage['lastSearchTabs'] || '' ;
localStorage['lastSearchBookmarks'] = localStorage['lastSearchBookmarks'] || '';
localStorage['lastSearchHystory'] = localStorage['lastSearchHystory'] || '';

localStorage['tabs_tags'] = localStorage['tabs_tags'] || '[]';
localStorage['bookmark_tags'] = localStorage['bookmark_tags'] || localStorage['vt_tags'] || '[]';
localStorage['history_tags'] = localStorage['history_tags'] || localStorage['vt_tags_h'] || '[]';

localStorage['sortBookmarks'] = localStorage['sortBookmarks'] || app.sortDefault;
//localStorage['sortHistory'] = localStorage['sortHistory'] || app.sortDefault;

function faviconValidate(str) {
	return str || app.emptyImg;
}