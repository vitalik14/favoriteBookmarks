T.query('#panel > div').forEach(
	function(el) {
		el.addEventListener('click', function(elm) {
			let list = this.classList;
			let item0 = list.item(0);
			T.query('#panel > div, .tabs > div').forEach((e) => e.classList.remove('active'));
			list.add('active');
			localStorage['tabs'] = (item0).split('tab')[1];

			switch (list.item(2)) {
				case 'p_tabs': 
					if (!app.current.tabs) {
						app.current.tabs = true;
						initTabs();
					}
					break;
				case 'p_bookmarks':
					if (!app.current.bookmarks) {
						app.current.bookmarks = true;
						initBookmarks();
					}
					break;
				// case 'p_topsites': 
				// 	if (!app.current.tops) {
				// 		app.current.tops = true;
				// 		getTopSites();
				// 	}
				// 	break;
				case 'p_history': 
					if (!app.current.history) {
						app.current.history = true;
						initHistory();
					}
					break;

					
			}
			document.querySelector('.tabs .' + item0).classList.add('active');
		});
	}
	
);

document.querySelector('#panel > div:nth-child(' + localStorage['tabs'] + ')').click();
