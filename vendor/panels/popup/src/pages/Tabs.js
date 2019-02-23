/**
 * Created by vitalik on 06.11.2016.
 */
import { Dom, Helpers } from "../components/Core";
import storage from "../components/Storage";
import Tags from "../components/Tags";
import DragDrop from "../components/DragDrop";

class Tabs {
	constructor() {
		this.elSearchTabs = Dom.id("tabs_search");
		this.elRemoveTextSearchTabs = Dom.id("remove_text_tabs");
		this.elShowOneLine = Dom.id("showOneLine");
		this.elOpenTabs = Dom.id("openTabs");
		this.elDeleteCopy = Dom.id("deleteCopy");
		this.elTabsItems = Dom.id("tabs-items");
		this.elNotFound = Dom.id("not_found");
		this.elSearchTabs.value = storage.getOption("lastSearchTabs");
		this.elSearchTabs.addEventListener("input", this.listingList.bind(this));
		this.elRemoveTextSearchTabs.addEventListener("click", this.removeTextTabs.bind(this));

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
			this.saveFrames();
			this.block = false;
		});

		this.elShowOneLine.addEventListener("click", () =>
			this.togleLocalStorage("showOneLine")
		);
		this.elDeleteCopy.addEventListener("click", () =>
			this.saveFrames("deleteCopy")
		);

		this.elTabsItems.addEventListener("click", el => {
			let elem = el.target;
			let _class = elem.classList;
			let childrens = false;
			if (_class.contains('tab') || (_class.contains('tabs-title') || _class.contains('f-img')) && (childrens = true)) {
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
			}
			if (_class.contains('del')) {
				let parent = elem.parentNode.parentNode;
				if (this.block) {
					return;
				}
				this.block = true;
				chrome.tabs.remove(+parent.getAttribute("data-id"), (el) => { }
				);
			}

		}, true);

		this.elTabsItems.addEventListener("mouseover", el => {
			let elem = el.target;
			let _class = elem.classList;
			let childrens = false;
			if (_class.contains('tab') || (_class.contains('tabs-title') || _class.contains('f-img')) && (childrens = true)) {
				if (childrens) {
					elem = elem.parentElement;
				}
				chrome.tabs.getSelected((w) => {
					let tabIndex = +elem.parentNode.getAttribute("data-index");
					chrome.tabs.highlight({ tabs: [w.index, tabIndex] }, (e) => { })
				});
			}
		}, true);


	}
	removeTextTabs() {
		this.elSearchTabs.value = "";
		this.listingList("");
		this.tags.activaTag();
	}

	togleLocalStorage(alias) {
		if (storage.getOption(alias) === "on") {
			storage.setOption(alias, "off");
		} else {
			storage.setOption(alias, "on");
		}
		this.listingList(storage.getOption("lastSearchTabs"));
	}

	saveFrames(type) {
		chrome.windows.getAll(
			{
				populate: true
			},
			event => {
				this.data = [];
				for (let i = 0; i < event.length; i++) {
					this.data = this.data.concat(event[i].tabs);
				}
				var removeTabsId = [];

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
				if (type == "deleteCopy") {
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

		var li = "", listing;

		this.elTabsItems.innerHTML = "";
		listing = this.data;
		if (word && str) {
			if (type) {
				word = str;
			}
			let itog = [],
				item;
			for (let n = 0, length = listing.length; n < length; n++) {
				item = listing[n];
				let cacheWord = word.toLocaleLowerCase();
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
			let li = document.createElement("li");
			li.classList.add('not-found');
			li.innerHTML = this.elNotFound.innerHTML;
			this.elTabsItems.appendChild(li);
		} else {
			this.elOpenTabs.innerHTML = listing.length;
			let short = "";

			if (storage.getOption("showOneLine") === "on") {
				short = "short";
			}

			for (let i = 0, length = listing.length; i < length; i++) {
				let item = listing[i];
				let classActive = "";
				let audible = "";
				let favicon = Helpers.faviconValidate(item.favIconUrl);
				if (item.active) classActive = "active";
				if (item.audible) audible = '<div class="audio"></div>';

				li += `
				<li 
					draggable="true" 
					data-id="${item.id}" 
					data-index="${item.index}" 
					class="${classActive}"
				>	
					<div class="btn">
						<div class="del">x</div>
					</div>
					<div class="show-url"></div>
					<div class="tab ${short}" >
						<img class="f-img" src="${favicon}" alt="" />
						<span class="tabs-title">${Helpers.escapeHtml(item.title)}</span>
						<span class="url">${item.url}</span>
					</div>
					<div class="info">
						${audible}
					</div>
				</li>`;
			}
			this.elTabsItems.insertAdjacentHTML("afterBegin", li);
			let arrLi = Dom.query("#tabs-items li");

			new DragDrop({
				elements: arrLi,
				type: "tabs",
				container: "tabs-items",
				funcSaveSort: this.saveFrames.bind(this)
			});
		}
	}

	activate() {
		this.saveFrames();
	}

	getTags() {
		return new Tags({
			search: "tabs_search",
			alias: "tabs_tags",
			container: "tags_tab",
			elAdd: "add_tag_tab",
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