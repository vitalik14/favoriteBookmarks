/**
 * Created by vitalik on 21.03.2018.
 */
var search_history = T.id('search_history');
var removeTextSearchHistory = T.id('remove-text-search_h');
var listHistory = T.id('results_h');
var findHistory = T.id('findHistory');
//var selectSort = T.id('selectSort_h');
//var btnOpenFindHistory = T.id('openHistory');
var dateHistory = T.id('dateHistory');

var timeoutHistory;

var timeoutInputHistory = 0;
search_history.addEventListener('input', (el) => {
	clearTimeout(timeoutInputHistory);
	timeoutInputHistory = setTimeout(() => {
		searchHistory(el);
	}, 800);
});

removeTextSearchHistory.addEventListener('click', removeTextHistory);

// function searchInInput() {
// 	clearTimeout(timeInterval);
// 	timeInterval = setTimeout((el) => {
// 		searchHistory(el);
// 	}, 2000);
// }

//btnOpenFindHistory.addEventListener('click', openFindHistory);

// function openFindHistory(el) {
// 	T.query('#results_h > li > a').forEach(function(e) {
// 		 chrome.tabs.create({url: e.getAttribute('href')}, function(){});
// 	 });
// }

function removeTextHistory(el, sort, interval) {
	search_history.value = '';
	searchHistory('', {sort: search_history.value, interval: 0});
	tags_history.activaTag();
}

function searchHistory(el, data) {
	// if (!data) { // event in input
	// 	var data = {
	// 		sort: T.storage('sortHistory'),
	// 		interval: 0
	// 	};
	// }
	let str;
	if (typeof el == 'object') {
		str = localStorage['lastSearchHystory'] = el.target.value;
	} else {
		str = localStorage['lastSearchHystory'] = el || '';
	}
	//findHistory.innerHTML = '0';
	listHistory.innerHTML = '';

	//showHideBtnOpenHistory(true);

	//if (str.length < 2) return false;

	clearInterval(timeoutHistory);
	timeoutHistory = setTimeout(() => {
		//console.log(search_history.value);
		T.id('loader-history').classList.add('active');
		//chrome.history.search({text: search_history.value, maxResults: 1000, startTime: 1000}, function(tree) {
		chrome.history.search({text: search_history.value, maxResults: 1000, startTime: 1000, endTime: (new Date().getTime())}, function(tree) {
			T.id('loader-history').classList.remove('active');
			// data.sort = data.sort || localStorage['sortHistory'];
			// function compare(a, b) {
			// 	if (a[data.sort] > b[data.sort])
			// 		return -1;
			// 	if (a[data.sort] < b[data.sort])
			// 		return 1;
			// 	return 0;
			// }
			// tree.sort(compare);
			//findHistory.innerHTML = tree.length;

			console.log(tree);

			function compare(a, b) {
				if (a['lastVisitTime'] > b['lastVisitTime'])
					return -1;
				if (a['lastVisitTime'] < b['lastVisitTime'])
					return 1;
				return 0;
			}
			tree.sort(compare);

			var day = false;
			//var div;
			for (let i = 0, length = tree.length; i < length; i++) {
				let item = tree[i];

				let _date = new Date(item.lastVisitTime);
				
				// if (!day) {


				// 	day = _date.getDate();


				// }

				if (!day || day !== _date.getDate()) {
					var li = document.createElement('li');
					var ul = document.createElement('ul');
					var titleDate = document.createElement('div');
					li.appendChild(titleDate);
					li.appendChild(ul);
					
					titleDate.innerHTML = _date.toDateString();
					titleDate.setAttribute('class', 'date-title');
					day = _date.getDate();
					listHistory.appendChild(li);
					titleDate.addEventListener('click', function(el) {
						if (this.classList.contains('active')) {
							this.classList.remove('active');
						} else {
							this.classList.add('active');
						}
					});
				}
				
				// console.log(new Date(item.lastVisitTime));
				let lastVisitTime = (new Date(item.lastVisitTime)).toLocaleString();
				let title = (item.title && T.escapeHtml(item.title)) || new URL(item.url).host;

				if (item.url === undefined) continue;
				
				let divItem = document.createElement('li');
			//	divItem.setAttribute('data-id', item.id);
				try {
					divItem.innerHTML = `
					<div class="deleteHistory">x</div>
					<a style="background-image:url(chrome://favicon/${item.url})" href=${item.url} title="${item.url}">${title}</a>
					<div class="info">
						<div class="history_info">&#9733;</div>
						<div class="popap" title="${lastVisitTime}">
							<div class="data">${lastVisitTime}</div>
						</div>
					</div>`;
				} catch(e) {
					console.log(e +  'error !!');
				}

				divItem.children[1].addEventListener('click', function() {
					chrome.tabs.create({ url: this.getAttribute('href') }, null);
				});
				try {
					divItem.children[0].addEventListener('click', function(el) {
						let current = this.parentNode;
						console.log(el);
						debugger;
						chrome.history.deleteUrl({url: el.target.nextElementSibling.getAttribute('href')}, function(el) {
							console.log(el);
							console.log(this);
							location.reload();
							debugger;
							//current.remove();
							//searchHistory();
						});
					});
				} catch (e) {}
				ul.appendChild(divItem);
			}
			
			//showHideBtnOpenHistory();
		});
	}, (data && data.interval) || 250);
}

chrome.history.onVisitRemoved.addListener(function(el) {
	location.reload();
	debugger;
});


search_history.value = localStorage['lastSearchHystory'];

function initHistory() {
	//searchHistory(localStorage['lastSearchHystory'], {sort: localStorage['sortHistory'], interval:0});  
	searchHistory(localStorage['lastSearchHystory']);  
}

//selectSort.value = localStorage['sortHistory'];
// selectSort.addEventListener('change', function(el) {
// 	localStorage['sortHistory'] = this.value;
// 	searchHistory(localStorage['lastSearchHystory'], {sort: this.value, interval: 0});
// });

// function showHideBtnOpenHistory(hide) {
// 	if (hide) {
// 		T.id('openHistory').style.display = 'none';
// 	} else if (!!document.querySelector('.t_history .results div')) {
// 		T.id('openHistory').style.display = 'block';
// 	} else {
// 		T.id('openHistory').style.display = 'none';
// 	}
// }

// dateHistory.valueAsNumber = new Date();

// dateHistory.addEventListener('change', function(e) {
// 	console.log(e.target.defaultValue);
// })

//showHideBtnOpenHistory();

const tags_history = new Tags({
	search: 'search_history',
	alias: 'history_tags',
	container: 'tags_h',
	elAdd: 'addTags_h',
	colorActive: 'rgba(77, 192, 177, 0.4)',
	funcSearch: searchHistory
});