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
		// this.elShowUrl = Dom.id("showUrl");
		this.elShowOneLine = Dom.id("showOneLine");
		this.elOpenTabs = Dom.id("openTabs");
		this.elDeleteCopy = Dom.id("deleteCopy");
		this.elTabsItems = Dom.id("tabs-items");
		this.elNotFound = Dom.id("not_found");
		this.elSearchTabs.value = storage.getOption("lastSearchTabs");
		this.elSearchTabs.addEventListener("input", this.listingList.bind(this));
		this.elRemoveTextSearchTabs.addEventListener(
			"click",
			this.removeTextTabs.bind(this)
		);
		this.elDeleteCopy.addEventListener("click", () =>
			this.saveFrames("deleteCopy")
		);
		// if (storage.getOption("showUrl") === "on") {
		// 	this.elShowUrl.checked = true;
		// }
		if (storage.getOption("showOneLine") === "on") {
			this.elShowOneLine.checked = true;
		}
		// this.elShowUrl.addEventListener("click", () =>
		// 	this.togleLocalStorage("showUrl")
		// );
		this.elShowOneLine.addEventListener("click", () =>
			this.togleLocalStorage("showOneLine")
		);
		this.tags = this.getTags();
		this.data = [];
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
				let list = event;
				for (let i = 0; i < list.length; i++) {
					this.data = this.data.concat(list[i].tabs);
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

		var el = Dom.queryOne(".tabs-items"),
			li = "",
			listing;

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
				let url = "";
				let classActive = "";
				let audible = "";
				let favicon = Helpers.faviconValidate(item.favIconUrl);
				if (item.active) classActive = "active";
				// if (storage.getOption("showUrl") === "on") url = item.url;
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
						<img src="${favicon}" alt="" />
						<span class="tabs-title">${Helpers.escapeHtml(item.title)}</span>
						<span class="url">${item.url}</span>
					</div>
					<div class="info">
						${audible}
					</div>
				</li>`;
			}

			this.elTabsItems.insertAdjacentHTML("afterBegin", li);
			var arrTabs = Dom.query(".tab"),
				arrDels = Dom.query(".del"),
				arrLi = Dom.query("#tabs-items li"),
				arrTabsLength = arrTabs.length;

			for (let tab = 0; tab < arrTabsLength; tab++) {
				arrTabs[tab].addEventListener("click", function (el) {
					if (el.target.classList.contains('url')) {
						return;
					}
					chrome.tabs.update(
						+this.parentNode.getAttribute("data-id"),
						{
							active: true
						},
						null
					);
				});
				arrDels[tab].addEventListener("click", function (el) {
					let parent = this.parentNode.parentNode;
					chrome.tabs.remove(+parent.getAttribute("data-id"), () =>
						parent.remove()
					);
				});
			}
			new DragDrop({
				elements: arrLi,
				type: "tabs",
				container: "tabs-items"
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