
var app = {
	data: [],
	emptyImg: 'img/empty.png',
	short: 'short',
	sortDefault: 'dateAdded',
	current: {
		tabs: false,
		bookmarks: false,
		tops: false
	}
};

localStorage['showUrl'] = localStorage['showUrl'] || 'on';
localStorage['showOneLine'] = localStorage['showOneLine'] || 'on';
localStorage['tabs'] = localStorage['tabs'] || '1';
localStorage['lastSearch'] = localStorage['lastSearch'] || '';
localStorage['vt_tags'] = localStorage['vt_tags'] || '[]';
localStorage['sortBookmarks'] = localStorage['sortBookmarks'] || app.sortDefault;


function faviconValidate(str) {
	if (!str || !!~str.indexOf('chrome://theme/IDR_EXTENSIONS_FAVICON@2x')) {
		return app.emptyImg;
	} else {
		return str;
	}
}