/**
 * Created by vitalik on 21.03.2018.
 */
import { Dom, Helpers } from "../components/Core";
import { Configs } from "../configs";
import Tags from "../components/Tags";
import storage from "../components/Storage";

class History {
	constructor() {
		this.maxDate = new Date().toLocaleDateString().split('.').reverse().join('-');
		this.minDate = '2010-01-01';

		this.daysShowStart = 0;
		this.daysShowEnd = Configs.visibleItemsInHistory;
		this.counterStep = this.daysShowEnd - this.daysShowStart;

		this.loaderDownList = false;
		this.currentArrHistory = [];

		this.elSearchHistory = Dom.id("historySearch");
		this.elRemoveTextSearchHistory = Dom.id("removeTextHistory");
		this.elNotFound = Dom.id("notFound");
		this.elListHistory = Dom.id("resultsHistory");
		this.elDateHistory = Dom.id("dateHistory");
		this.elSearchPeriodHistory = Dom.id("searchPeriodHistory");
		this.elStartHistory = Dom.id("startHistory");
		this.elEndHistory = Dom.id("endHistory");

		this.elStartHistory.setAttribute('max', this.maxDate);
		this.elEndHistory.setAttribute('max', this.maxDate);
		this.elStartHistory.setAttribute('min', this.minDate);
		this.elEndHistory.setAttribute('min', this.minDate);

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

		this.elSearchOn.addEventListener("change", el => {
			this.visibilityFilterDateHistory(el.target.checked);
			!el.target.checked && this.search();
		});

		this.elListHistory.addEventListener("click", el => {
			let elem = el.target;
			const classList = elem.classList;
			let childrens = false;

			if (classList.contains('date-title') || (classList.contains('counter') && (childrens = true)) || (classList.contains('title') && (childrens = true))) {
				if (childrens) {
					elem = elem.parentElement;
				}
				elem.classList.add("visited");
				if (elem.classList.contains("active")) {
					elem.classList.remove("active");
					elem.parentElement.children[1].remove();

				} else {
					document.querySelectorAll('#resultsHistory .date-title').forEach(item => {
						item.classList.remove('active');
						item.parentElement.children[1] && item.parentElement.children[1].remove();
					});
					elem.classList.add("active");
					this.renderDayItems(elem.parentElement, elem.dataset.id);
					el.currentTarget.scrollTop = Math.abs(elem.parentElement.offsetTop - el.currentTarget.parentElement.children[0].scrollHeight - 34); // 34 height munu height
				}

			} else if (classList.contains('h-l') || (classList.contains('h-t') && (childrens = true))) {
				if (childrens) {
					elem = elem.parentElement;
				}
				chrome.tabs.create({ url: elem.children[0].innerHTML }, null);

			} else if (classList.contains('btn-search')) {
				const textSearch = this.elSearchHistory.value = new URL(elem.parentElement.children[3].children[0].innerHTML).host;

				this.search(textSearch);
				this.tags.activeTag();
			}

		}, true);

		this.elSearchPeriodHistory.addEventListener("click", this.search.bind(this));

		this.elSearchHistory.addEventListener("input", el => {
			clearTimeout(this.timeoutInputHistory);

			this.timeoutInputHistory = setTimeout(() => {
				this.search(el.target.value);
			}, 800);
		});

		this.elRemoveTextSearchHistory.addEventListener("click", this.removeTextHistory.bind(this));

		this.elListHistory.addEventListener("scroll", el => {
			const elem = el.target;

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
		this.elStartHistory.disabled = !status;
		this.elEndHistory.disabled = !status;
		this.elSearchPeriodHistory.disabled = !status;
		this.saveState("status", status);
	}

	loadStateHistory() {
		const store = this.loadState();

		if (!store.dateEnd || !store.dateStart || !store.hasOwnProperty('status') || !store.hasOwnProperty('expand')) {
			const latterMonth = new Date();
			latterMonth.setMonth(latterMonth.getMonth() - 1);
			const start = this.elStartHistory.value = latterMonth.toLocaleDateString().split('.').reverse().join('-');
			const end = this.elEndHistory.value = new Date().toLocaleDateString().split('.').reverse().join('-');
			this.saveState('dateStart', start);
			this.saveState('dateEnd', end);
			this.saveState('status', false);
			this.saveState('expand', false);
		} else {
			this.elSearchOn.checked = store.status;
			this.visibilityFilterDateHistory(store.status);
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
		this.search("");
		this.tags.activeTag();
		this.elSearchHistory.focus();
	}

	search(el) {
		if (el && typeof el === 'string') {
			storage.setOption("lastSearchHystory", el);
		}
		this.loaderDownList = true;
		this.daysShowStart = 0;
		this.daysShowEnd = Configs.visibleItemsInHistory;
		this.elListHistory.innerHTML = "";
		this.currentArrHistory = [];
		clearInterval(this.timeoutHistory);

		this.timeoutHistory = setTimeout(() => {
			let startTime = 1325368800000;
			let endTime = Date.now();
			const store = this.loadState();

			Dom.id("loader-history").classList.add("active");
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
					const length = tree.length;

					if (!length) {
						let li = document.createElement("li");
						li.classList.add('not-found');
						li.innerHTML = this.elNotFound.innerHTML;
						this.elListHistory.appendChild(li);

					} else {
						const arrHistory = [];
						let day = false;
						let lastDate = new Date(endTime).getDate();
						let list = [];

						tree.sort(Helpers.compare.bind("lastVisitTime"));

						for (let i = 0; i < length; i++) {
							const item = tree[i];
							const _date = new Date(item.lastVisitTime);
							const itemDate = _date.getDate();

							if (item.url === undefined || endTime < _date.getTime()) {
								continue;
							}

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
							item.active = false;
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
					Dom.id("loader-history").classList.remove("active");
				}
			);
		}, 250);
	}

	renderList() {
		let arrHistory = this.currentArrHistory;
		for (let i = this.daysShowStart, len = arrHistory.length; i < len && i < this.daysShowEnd; i++) {
			let titleDate = document.createElement("div");
			let li = document.createElement("li");
			titleDate.classList.add("date-title");
			titleDate.dataset.id = i;
			titleDate.innerHTML = `<div class="title">${arrHistory[i].title}</div> <div class="counter">${arrHistory[i].list.length}</div>`;
			li.appendChild(titleDate);

			if (arrHistory[i].active) {
				const ul = document.createElement("ul");
				li.appendChild(ul);

				for (let n = 0, len = arrHistory[i].list.length; n < len; n++) {
					const item = arrHistory[i].list[n];
					const title =
						(item.title && Helpers.escapeHtml(item.title)) ||
						new URL(item.url).host;

					const divItem = document.createElement("li");
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
						console.log(e);
					}
					ul.appendChild(divItem);
				}
			}
			this.elListHistory.appendChild(li);

		}
		this.daysShowStart += this.counterStep;
		this.daysShowEnd += this.counterStep;
	}

	renderDayItems(elem, index) {
		const ul = document.createElement("ul");
		const day = this.currentArrHistory[index];

		for (let n = 0, len = day.list.length; n < len; n++) {
			const item = day.list[n];
			const divItem = document.createElement("li");
			const title =
				(item.title && Helpers.escapeHtml(item.title)) ||
				new URL(item.url).host;


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
				console.log(e);
			}
			ul.appendChild(divItem);
			elem.appendChild(ul);
		}
	}

	activate() {
		this.search(storage.getOption("lastSearchHystory"));
	}

	getTags() {
		return new Tags({
			search: "historySearch",
			alias: "history_tags",
			container: "tagsHistory",
			elAdd: "addTagHistory",
			colorActive: "rgba(243, 136, 72, 0.4)",
			funcSearch: this.search.bind(this)
		});
	}

	saveState(property, value) {
		const state = this.loadState();

		state[property] = value;
		storage.setOption('historyDates', JSON.stringify(state));

		return state;
	}

	loadState(property) {
		const state = JSON.parse(storage.getOption('historyDates'));

		if (property) {
			return state[property];
		} else {
			return state;
		}
	}
}

export function history() {
	new History().activate();
}
