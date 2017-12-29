localStorage['showUrl'] = localStorage['showUrl'] || 'on';
localStorage['showOneLine'] = localStorage['showOneLine'] || 'on';
localStorage['tabs'] = localStorage['tabs'] || '1';
localStorage['lastSearch'] = localStorage['lastSearch'] || '';
localStorage['vt_tags'] = localStorage['vt_tags'] || '[]';
localStorage['sortBookmarks'] = localStorage['sortBookmarks'] || 'dateAdded';

var events = document.createElement('event');
var app = {
	data: [],
	emptyImg: 'img/empty.png',
	short: 'short',
	sortDefault: 'dateAdded'
};

events._ = {
	getAll: 'getAll'
};

function Eve(type, obj) {
	return new CustomEvent(events._[type], {
		detail: obj || {}
	});
}

function faviconValidate(str) {
	if (!str || !!~str.indexOf('chrome://theme/IDR_EXTENSIONS_FAVICON@2x')) {
		return app.emptyImg;
	} else {
		return str;
	}
}

T.query('#panel div').forEach(
	function(el) {
		el.addEventListener('click', function() {
			T.query('#panel > div').forEach(function(el) {
				el.classList.remove('active');
			});

			el.classList.add('active');

			T.query('.tabs > div').forEach(function(el) {
				el.classList.remove('active');
			});

			localStorage['tabs'] = (el.classList.item(0)).split('tab')[1];
			document.querySelector('.tabs .' + el.classList.item(0)).classList.add('active');
		});
	}
);

document.querySelector('#panel div:nth-child(' + localStorage['tabs'] + ')').click();

// chrome.bookmarks.onCreated.addListener(function(el) {
// 	console.log('onCreated');
// 	console.log(el);
// });
// chrome.bookmarks.onRemoved.addListener(function(el) {
// 	console.log('onRemoved');
// 	console.log(el);
// });
// chrome.bookmarks.onChanged.addListener(function(el) {
// 	console.log('onChanged');
// 	console.log(el);
// });

// var bookm;
// var t = [];
// function updateTree() {
// 	chrome.bookmarks.getTree(function(el) {
// 		bookm = [];
// 		var b = el[0].children[0].children;
// 		for(let i = 0; i < b.length; i++) {
// 			bookm[i] = b[i];
// 		}
// 		console.log('end');
// 	});
// }
// function seacrhW(letters) {
// 	for(let n = 0; n < bookm.length; n++) {
// 		console.log(n);
// 		if (bookm[n].url && (bookm[n].url).indexOf(letters) !== -1) {
// 			console.log(bookm[n].url);
// 			t.push(bookm[n]);
// 		} else if(bookm[n].title && (bookm[n].title).indexOf(letters) !== -1) {
// 			console.log(bookm[n].title);
// 			t.push(bookm[n]);
// 		}
// 	}
// }



// var t = [];

// function getB(search) {
	
// }
// getB('js');