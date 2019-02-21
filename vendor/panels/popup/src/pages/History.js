/**
 * Created by vitalik on 21.03.2018.
 */
import { Dom, Helpers } from "../components/Core";
import Tags from "../components/Tags";
import storage from "../components/Storage";

class History {
	constructor() {
		this.maxDate = new Date().toLocaleDateString().split('.').reverse().join('-');
		this.minDate = '2010-01-01';

		this.daysShowStart = 0;
		this.daysShowEnd = 14;
		this.counterStep = this.daysShowEnd - this.daysShowStart;

		this.loaderDownList = false;
		this.currentArrHistory = [];
		this.elSearchHistory = Dom.id("history_search");
		this.elRemoveTextSearchHistory = Dom.id("remove_text_history");
		this.elNotFound = Dom.id("not_found");
		this.elListHistory = Dom.id("results_h");
		this.elDateHistory = Dom.id("dateHistory");
		this.elSearchPeriodHistory = Dom.id("search_period_history");
		this.elStartHistory = Dom.id("start_history");
		this.elEndHistory = Dom.id("end_history");
		this.elBtnExpand = Dom.id("btnExpand");
		this.elStartHistory.setAttribute('max', this.maxDate);
		this.elEndHistory.setAttribute('max', this.maxDate);
		this.elStartHistory.setAttribute('min', this.minDate);
		this.elEndHistory.setAttribute('min', this.minDate);
		this.elSearchOn = Dom.id("search_on");
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
				el.target.value = this.maxDate;
			}
			this.saveState("dateStart", el.target.value);
		});

		this.elEndHistory.addEventListener("blur", el => {
			if (new Date(el.target.value).getTime() > Date.now()) {

				el.target.value = this.maxDate;
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
			if (elem.scrollHeight < (elem.scrollTop + elem.offsetHeight)) {
				this.renderList();
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
				endTime = new Date(new Date(store.dateEnd).toDateString()).getTime() + 86400000; // +1 day
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
					if (!tree.length) {
						let li = document.createElement("li");
						li.classList.add('not-found');
						li.innerHTML = this.elNotFound.innerHTML;
						this.elListHistory.appendChild(li);
					} else {
						tree.sort(Helpers.compare.bind("lastVisitTime"));
						let arrHistory = [];
						let day = false;
						let lastDate = new Date(endTime).getDate();
						let list = [];
						for (let i = 0, length = tree.length; i < length; i++) {
							let item = tree[i];
							let _date = new Date(item.lastVisitTime);

							if (endTime < _date.getTime()) {
								continue;
							}
							let itemDate = _date.getDate();
							if (lastDate !== itemDate) {
								if (!day) {
									day = new Date(endTime);
								}
								list.length && arrHistory.push({
									title: day.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
									list: [...list]
								});
								list = [];
							}
							item.domain = new URL(item.url).origin;
							item.time = _date.toLocaleTimeString();
							list.push(item);

							day = _date;
							lastDate = _date.getDate();

						}
						if (!!list.length) {
							arrHistory.push({
								title: day.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
								list: [...list]
							});
						}
						this.currentArrHistory = arrHistory;
						this.renderList();
						this.loaderDownList = false;

					}
				}
			);
		}, 250);
	}

	renderList() {
		let arrHistory = this.currentArrHistory;
		for (let i = this.daysShowStart, len = arrHistory.length; i < len && i < this.daysShowEnd; i++) {
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
					<div class="time">${item.time}</div>
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
		this.daysShowStart += this.counterStep;
		this.daysShowEnd += this.counterStep;
	}

	activate() {
		this.searchHistory(storage.getOption("lastSearchHystory"));
	}
	getTags() {
		return new Tags({
			search: "history_search",
			alias: "history_tags",
			container: "tags_history",
			elAdd: "add_tag_history",
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
