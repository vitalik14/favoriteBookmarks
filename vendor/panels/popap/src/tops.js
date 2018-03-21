/**
 * Created by vitalik on 06.11.2016.
 */
//chrome://theme/IDR_EXTENSIONS_FAVICON@2x

function getTopSites () {
	chrome.topSites.get(function(el) {
		let list = T.id('tabs_wrap_topsites');
		//console.time("answer time");
		for (let item of el) {
			let a = document.createElement('a');
			a.setAttribute('href', item.url);
			a.setAttribute('title', item.url);
			a.style.backgroundImage = `url(chrome://favicon/${item.url})`;
			a.addEventListener('click', function() {
				chrome.tabs.create({url: this.getAttribute('href')}, null);
			});
			a.innerHTML = item.title;
			list.appendChild(a);
		}
		//console.timeEnd("answer time");
	});
}