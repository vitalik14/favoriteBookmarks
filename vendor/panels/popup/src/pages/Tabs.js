/**
 * Created by vitalik on 06.11.2016.
 */
import { Dom, Helpers } from "../components/Core";
import storage from "../components/Storage";
import Tags from "../components/Tags";
import DragDrop from "../components/DragDrop";

class Tabs {
	constructor() {
		this.elSearchTabs = Dom.id("tabsSearch");
		this.elRemoveTextSearchTabs = Dom.id("removeTextTabs");
		this.elShowOneLine = Dom.id("showOneLine");
		this.elOpenTabs = Dom.id("openTabs");
		this.elDeleteCopy = Dom.id("deleteCopy");
		this.elTabsItems = Dom.id("tabsItems");
		this.elNotFound = Dom.id("notFound");
		this.elSearchTabs.value = storage.getOption("lastSearchTabs");
		if (storage.getOption("showOneLine") === "on") {
			this.elShowOneLine.checked = true;
		}

		this.tags = this.getTags();
		this.data = [];
		this.block = false;
		this.initialListeners();
	}

	initialListeners() {
		chrome.tabs.onRemoved.addListener(() => {
			this.search();
			this.block = false;
		});

		this.elSearchTabs.addEventListener("input", this.listingList.bind(this));
		this.elRemoveTextSearchTabs.addEventListener("click", this.removeTextTabs.bind(this));
		this.elShowOneLine.addEventListener("click", () =>
			this.togleLocalStorage("showOneLine")
		);
		this.elDeleteCopy.addEventListener("click", () =>
			this.search("deleteCopy")
		);

		this.elTabsItems.addEventListener("click", el => {
			let elem = el.target;
			const classList = elem.classList;
			let childrens = false;

			if (classList.contains('tab') || classList.contains('t-t') && (childrens = true)) {
				if (childrens) {
					elem = elem.parentElement;
				}
				chrome.tabs.update(
					+elem.parentNode.getAttribute("data-id"),
					{
						active: true
					},
					null
				);
			} else if (classList.contains('btn-search')) {
				const textSearch = this.elSearchTabs.value = new URL(elem.parentElement.children[3].children[0].innerHTML).host;

				this.listingList(textSearch);
				this.tags.activeTag();

			} else if (classList.contains('delete')) {
				const parent = elem.parentElement;

				if (this.block) {
					return;
				}
				this.block = true;
				chrome.tabs.remove(+parent.getAttribute("data-id"), () => { });
			}

		}, true);

		this.elTabsItems.addEventListener("mouseover", el => {
			let elem = el.target;
			const classList = elem.classList;
			let childrens = false;

			if (classList.contains('tab') || classList.contains('t-t') && (childrens = true)) {
				if (childrens) {
					elem = elem.parentElement;
				}

				chrome.tabs.getSelected(w => {
					const tabIndex = +elem.parentNode.getAttribute("data-index");
					chrome.tabs.highlight({ tabs: [w.index, tabIndex] }, () => { });
				});
			}
		}, true);
	}

	removeTextTabs() {
		this.elSearchTabs.value = "";
		this.listingList("");
		this.tags.activeTag();
		this.elSearchTabs.focus();

	}

	togleLocalStorage(alias) {
		if (storage.getOption(alias) === "on") {
			storage.setOption(alias, "off");
		} else {
			storage.setOption(alias, "on");
		}

		this.listingList(storage.getOption("lastSearchTabs"));
	}

	search(type) {
		chrome.windows.getAll(
			{
				populate: true
			},
			event => {
				const removeTabsId = [];
				this.data = [];
				for (let i = 0, length = event.length; i < length; i++) {
					this.data = this.data.concat(event[i].tabs);
				}

				for (let i = 0, length = this.data.length; i < length; i++) {
					for (let n = this.data.length - 1; n > i; n--) {
						if (this.data[i].url === this.data[n].url) {
							this.elDeleteCopy.style.display = "block";
							if (type === "deleteCopy") {
								removeTabsId.push(this.data[n].id);
								this.data.splice(n, 1);
							}
						}
					}
				}
				if (type === "deleteCopy") {
					chrome.tabs.remove(removeTabsId, () => {
						this.elDeleteCopy.style.display = "none";
						this.listingList(storage.getOption("lastSearchTabs"));
					});
				} else {
					this.listingList(storage.getOption("lastSearchTabs"));
				}

			}
		);
	}

	listingList(word) {
		let str;
		const type = typeof word === "object";

		if (type) {
			str = word.target.value;
		} else {
			str = word;
		}

		storage.setOption("lastSearchTabs", str);

		let listing;

		this.elTabsItems.innerHTML = "";
		listing = this.data;

		if (word && str) {
			const itog = [];
			let item;

			if (type) {
				word = str;
			}
			const cacheWord = word.toLocaleLowerCase();

			for (let n = 0, length = listing.length; n < length; n++) {
				item = listing[n];

				if (
					!!~item.title.toLocaleLowerCase().indexOf(cacheWord) ||
					!!~item.url.toLocaleLowerCase().indexOf(cacheWord)
				) {
					itog.push(item);
				}
			}

			listing = itog;
		}


		if (!listing.length) {
			const li = document.createElement("li");

			li.classList.add('not-found');
			li.innerHTML = this.elNotFound.innerHTML;
			this.elTabsItems.appendChild(li);

		} else {
			let short = "";
			this.elOpenTabs.innerHTML = listing.length;

			if (storage.getOption("showOneLine") === "on") {
				short = "short";
			}

			for (let i = 0, length = listing.length; i < length; i++) {
				const item = listing[i];
				//const favicon = Helpers.faviconValidate(item.favIconUrl);
				let audible = "";

				if (item.audible) audible = '<div class="audio"></div>';

				let li = document.createElement("li");

				li.dataset.id = item.id;
				li.dataset.index = item.index;
				li.setAttribute("draggable", "true");

				if (item.active) li.classList.add("active");
				const url = new URL(item.url);

				li.innerHTML = `
					<div class="delete"></div>
					<div class="btn-search"></div>
					<div class="show-url"></div>
					<a class="tab" style="background-image:url(chrome://favicon/${url.origin})">
						<div class="url">${item.url}</div>
						<div class="t-t ${short}">${Helpers.escapeHtml(item.title)}</div>
					</a>
					<div class="info">${audible}</div>`;

				this.elTabsItems.appendChild(li);
			}
			const arrLi = Dom.query("#tabsItems li");

			new DragDrop({
				elements: arrLi,
				type: "tabs",
				container: "tabsItems",
				funcSaveSort: this.search.bind(this)
			});

		}
	}

	activate() {
		this.search();
	}

	getTags() {
		return new Tags({
			search: "tabsSearch",
			alias: "tabs_tags",
			container: "tagsTab",
			elAdd: "addTagTab",
			colorActive: "rgba(160, 193, 248, 0.4)",
			funcSearch: this.listingList.bind(this)
		});
	}
}

export function tabs() {
	const tabs = new Tabs();

	tabs.activate();

	return tabs;
}
