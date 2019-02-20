/**
 * Created by vitalik on 21.03.2018.
 */
import { Dom, Helpers } from "../components/Core";
import Tags from "../components/Tags";
import storage from "../components/Storage";

class History {
	constructor() {
		let maxDate = new Date().toLocaleDateString().split('.').reverse().join('-');
		let minDate = '2010-01-01';
		this.daysShowStart = 0;
		this.daysShowEnd = 14;
		this.loaderDownList = false;
		this.currentArrHistory = [];
		this.elSearchHistory = Dom.id("search_history");
		this.elRemoveTextSearchHistory = Dom.id("remove-text-search_h");
		this.elListHistory = Dom.id("results_h");
		this.elFindHistory = Dom.id("findHistory");
		this.elDateHistory = Dom.id("dateHistory");
		this.elSearchPeriodHistory = Dom.id("searchPeriodHistory");
		this.elStartHistory = Dom.id("startHistory");
		this.elEndHistory = Dom.id("endHistory");
		this.elBtnExpand = Dom.id("btnExpand");
		this.elStartHistory.setAttribute('max', maxDate);
		this.elEndHistory.setAttribute('max', maxDate);
		this.elStartHistory.setAttribute('min', minDate);
		this.elEndHistory.setAttribute('min', minDate);
		this.elSearchOn = Dom.id("searchOn");
		this.timeoutHistory = 0;
		this.timeoutInputHistory = 0;
		this.elSearchHistory.value = storage.getOption("lastSearchHystory");
		this.tags = this.getTags();
		this.loadStateHistory();
		this.initialListeners();
	}

	initialListeners() {
		this.elStartHistory.addEventListener("blur", el => {
			if (new Date(el.target.value).getTime() > Date.now()) {
				el.target.value = maxDate;
			}
			this.saveState("dateStart", el.target.value);
		});

		this.elEndHistory.addEventListener("blur", el => {
			if (new Date(el.target.value).getTime() > Date.now()) {

				el.target.value = maxDate;
			}
			this.saveState("dateEnd", el.target.value);
		});

		// this.elBtnExpand.addEventListener("click", el => {
		// 	console.time('expand');
		// 	if (el.target.classList.contains('open')) {
		// 		el.target.classList.remove('open');
		// 		this.saveState('expand', false);
		// 		document.querySelectorAll('#results_h > li > .date-title.active').forEach(el => {
		// 			el.classList.remove('active');
		// 		});
		// 	} else {
		// 		el.target.classList.add('open');
		// 		this.saveState('expand', true);
		// 		document.querySelectorAll('#results_h > li > .date-title:not(.active)').forEach(el => {
		// 			el.classList.add('active');
		// 		});
		// 	}
		// 	console.timeEnd('expand');
		// });

		this.elSearchOn.addEventListener("change", el => {
			this.visibilityFilterDateHistory(el.target.checked);
			!el.target.checked && this.searchHistory();
		});

		this.elListHistory.addEventListener("click", el => {
			let elem = el.target;
			let _class = elem.classList;
			let childrens = false;
			if (_class.contains('date-title') || (_class.contains('counter') && (childrens = true)) || (_class.contains('title') && (childrens = true))) {
				if (childrens) {
					elem = elem.parentElement;
				}
				elem.classList.add("visited");
				if (elem.classList.contains("active")) {
					elem.classList.remove("active");
				} else {
					elem.classList.add("active");
				}

			} else if (_class.contains('h-l') || (_class.contains('h-t') && (childrens = true))) {
				if (childrens) {
					elem = elem.parentElement;
				}
				chrome.tabs.create({ url: elem.children[0].innerHTML }, null);

			} else if (_class.contains('btn-search')) {

				let el = this.elSearchHistory.value = new URL(elem.parentElement.children[3].children[0].innerHTML).host;

				this.searchHistory(el);
			}

		}, true);

		this.elSearchPeriodHistory.addEventListener("click", this.searchHistory.bind(this));

		this.elSearchHistory.addEventListener("input", el => {
			clearTimeout(this.timeoutInputHistory);
			this.timeoutInputHistory = setTimeout(() => {
				this.searchHistory(el.target.value);
			}, 800);
		});

		this.elRemoveTextSearchHistory.addEventListener("click", this.removeTextHistory.bind(this));

		this.elListHistory.addEventListener("scroll", (el) => {
			let elem = el.target;
			if (this.loaderDownList) {
				return false;
			}
			this.loaderDownList = true;
			Dom.id("loader-history").classList.add("active");
			let counter = 5;
			if (elem.scrollHeight < (elem.scrollTop + elem.offsetHeight)) {
				this.renderList(this.daysShowStart, this.daysShowEnd);
				this.daysShowStart += counter;
				this.daysShowEnd += counter;
			}
			Dom.id("loader-history").classList.remove("active");
			this.loaderDownList = false;
		});
	}

	visibilityFilterDateHistory(status) {
		this.elStartHistory.disabled =
			this.elEndHistory.disabled =
			this.elSearchPeriodHistory.disabled = !status;
		this.saveState("status", status);
	}

	loadStateHistory() {
		let store = this.loadState();

		if (!store.dateEnd || !store.dateStart || !store.hasOwnProperty('status') || !store.hasOwnProperty('expand')) {
			let latterMonth = new Date();
			latterMonth.setMonth(latterMonth.getMonth() - 1);
			let start = this.elStartHistory.value = latterMonth.toLocaleDateString().split('.').reverse().join('-');
			let end = this.elEndHistory.value = new Date().toLocaleDateString().split('.').reverse().join('-');
			this.saveState('dateStart', start);
			this.saveState('dateEnd', end);
			this.saveState('status', false);
			this.saveState('expand', false);
		} else {
			this.elSearchOn.checked = store.status;
			this.visibilityFilterDateHistory(store.status)
			this.elStartHistory.value = store.dateStart;
			this.elEndHistory.value = store.dateEnd;
			// if (store.expand) {
			// 	this.elBtnExpand.classList.add('open');
			// } else {
			// 	this.elBtnExpand.classList.remove('open');
			// }
		}
	}

	removeTextHistory() {
		this.elSearchHistory.value = "";
		storage.setOption('lastSearchHystory', "");
		this.searchHistory("", { sort: this.elSearchHistory.value, interval: 0 });
		this.tags.activaTag();
	}
	searchHistory(el) {
		this.loaderDownList = true;
		if (el && typeof el === 'string') {
			storage.setOption("lastSearchHystory", el);
		}
		this.daysShowStart = 0;
		this.daysShowEnd = 14;
		this.elListHistory.innerHTML = "";
		this.currentArrHistory = [];
		clearInterval(this.timeoutHistory);
		this.timeoutHistory = setTimeout(() => {
			Dom.id("loader-history").classList.add("active");
			let startTime = 1325368800000;
			let endTime = Date.now();
			let store = this.loadState();
			if (store.status) {
				startTime = new Date(new Date(store.dateStart).toDateString()).getTime();
				endTime = new Date(new Date(store.dateEnd).toDateString()).getTime();
			}
			chrome.history.search(
				{
					text: this.elSearchHistory.value,
					maxResults: 1000000,
					startTime: startTime,
					endTime: endTime
				},
				tree => {
					Dom.id("loader-history").classList.remove("active");
					tree.sort(Helpers.compare.bind("lastVisitTime"));
					let arrHistory = [];
					let day = false;
					let last;
					let list = [];

					for (let i = 0, length = tree.length; i < length; i++) {
						let item = tree[i];
						if ((new Date(endTime).getTime()) <= new Date(item.lastVisitTime).getTime()) {
							continue;
						}
						let itemDate = new Date(item.lastVisitTime).getDate();
						if (day !== itemDate || !day) {
							if (last) {
								arrHistory.push({
									title: new Date(last.lastVisitTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
									list: [...list]
								});
								list = [];
							}
							last = item;
							day = itemDate
						}
						item.domain = new URL(item.url).origin;

						list.push(item);
					}
					if (!!list.length) {
						arrHistory.push({
							title: new Date(last.lastVisitTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
							list: list
						});
					}
					this.currentArrHistory = arrHistory;
					this.renderList(this.daysShowStart, this.daysShowEnd = 20);
					this.loaderDownList = false;
				}
			);
		}, 250);
	}

	// preloaderList(visibleItems, step) {

	// }

	renderList(start, end) {
		let arrHistory = this.currentArrHistory;
		for (let i = start, len = arrHistory.length; i < len && i < end; i++) {
			let li = document.createElement("li");
			let ul = document.createElement("ul");
			let titleDate = document.createElement("div");
			li.appendChild(titleDate);
			li.appendChild(ul);
			titleDate.innerHTML = `<div class="title">${arrHistory[i].title}</div> <div class="counter">${arrHistory[i].list.length}</div>`;
			titleDate.classList.add("date-title");

			this.elListHistory.appendChild(li);

			for (let n = 0, len = arrHistory[i].list.length; n < len; n++) {
				let item = arrHistory[i].list[n];
				if (item.url === undefined) continue;

				let title =
					(item.title && Helpers.escapeHtml(item.title)) ||
					new URL(item.url).host;

				let divItem = document.createElement("li");
				try {
					divItem.innerHTML = `
					<div class="btn-search"></div>
					<div class="time">${new Date(item.lastVisitTime).toLocaleTimeString()}</div>
					<div class="show-url"></div>
					<a class="h-l" style="background-image:url(chrome://favicon/${item.domain})">
						<div class="url">${item.url}</div>
						<div class="h-t">${title}</div>
					</a>`;
				} catch (e) {
					console.log(e + "error !!");
				}
				ul.appendChild(divItem);
			}
		}
	}

	activate() {
		this.searchHistory(storage.getOption("lastSearchHystory"));
	}
	getTags() {
		return new Tags({
			search: "search_history",
			alias: "history_tags",
			container: "tags_h",
			elAdd: "addTags_h",
			colorActive: "rgba(243, 136, 72, 0.4)",
			funcSearch: this.searchHistory.bind(this)
		});
	}
	saveState(property, value) {
		let state = this.loadState();
		state[property] = value;
		storage.setOption('historyDates', JSON.stringify(state));
		return state;
	}
	loadState(property) {
		let state = JSON.parse(storage.getOption('historyDates'));
		if (property) {
			return state[property];
		} else {
			return state;
		}
	}
}

export const history = new History();
history.activate();
