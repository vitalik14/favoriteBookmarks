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
			switch (el.classList.item(2)) {
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
                case 'p_topsites': 
                    if (!app.current.tops) {
                        app.current.tops = true;
                        getTopSites();
                    }
					break;
			}
			document.querySelector('.tabs .' + el.classList.item(0)).classList.add('active');
		});
	}
);

document.querySelector('#panel div:nth-child(' + localStorage['tabs'] + ')').click();