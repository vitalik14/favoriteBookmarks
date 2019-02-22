/**
 * Created by vitalik on 06.11.2016.
 */
import { Dom, Helpers } from "../components/Core";
import { Configs } from "../configs";
import Tags from "../components/Tags";
import storage from "../components/Storage";

class Bookmarks {
	constructor() {
		this.daysShowStart = 0;
		this.daysShowEnd = Configs.visibleItemsInBookmarks;
		this.counterStep = this.daysShowEnd - this.daysShowStart;
		this.currentArrBookmarks = [];
		this.loaderDownList = false;

		this.elInputBookmarks = Dom.id("bookmarks_search");
		this.elRemoveTextSearchBookmarks = Dom.id("remove_text_bookmarks");
		this.elListBookmarks = Dom.id("results_b");
		this.elFindBookmarks = Dom.id("findBookmarks");
		this.elNotFound = Dom.id("not_found");

		this.elSelectSort = Dom.id("selectSort_b");
		this.elBtnOpenFindBookmarks = Dom.id("openBookmarks");
		this.elLoaderBookmarks = Dom.id("loader_bookmarks");
		this.timeoutBookmarks = null;
		this.timeoutInputBookmarks = 0;
		this.elInputBookmarks.value = storage.getOption("lastSearchBookmarks");
		this.elSelectSort.value = storage.getOption("sortBookmarks");
		this.showHideBtnOpenBookmarks();
		this.tags = this.getTags();
		this.initialListeners();
	}

	initialListeners() {
		this.elInputBookmarks.addEventListener("input", el => {
			clearTimeout(this.timeoutInputBookmarks);
			this.timeoutInputBookmarks = setTimeout(() => {
				this.searchBookmarks(el);
			}, 800);
		});

		this.elRemoveTextSearchBookmarks.addEventListener("click", this.removeTextBookmarks.bind(this));

		this.elBtnOpenFindBookmarks.addEventListener("click", this.openFindBookmarks.bind(this));

		this.elSelectSort.addEventListener("change", el => {
			storage.setOption("sortBookmarks", el.target.value);
			this.searchBookmarks(storage.getOption("lastSearchBookmarks"));
		});
		this.elListBookmarks.addEventListener("click", el => {
			let elem = el.target;
			let _class = elem.classList;
			let childrens = false;
			if (_class.contains('h-l') || (_class.contains('h-t') && (childrens = true))) {
				if (childrens) {
					elem = elem.parentElement;
				}
				chrome.tabs.create({ url: elem.children[0].innerHTML }, null);

			} else if (_class.contains('btn-search')) {
				let el = this.elInputBookmarks.value = new URL(elem.parentElement.children[4].children[0].innerHTML).host;
				this.searchBookmarks(el);
			} else if (_class.contains('delete')) {
				try {
					elem.addEventListener("click", function () {
						chrome.bookmarks.remove(this.parentNode.getAttribute("data-id"), function () {
							this.parentNode.remove();
						}.bind(this)
						);
					});
				} catch (e) { }
			}

		}, true);

		this.elListBookmarks.addEventListener("scroll", (el) => {
			let elem = el.target;
			if (this.loaderDownList) {
				return false;
			}
			this.loaderDownList = true;
			Dom.id("loader_bookmarks").classList.add("active");
			if (elem.scrollHeight < (elem.scrollTop + elem.offsetHeight)) {
				this.renderList();
			}
			Dom.id("loader_bookmarks").classList.remove("active");
			this.loaderDownList = false;
		});
	}

	openFindBookmarks() {
		Dom.query("#results_b > li > a").forEach(e => {
			chrome.tabs.create({ url: e.getAttribute("href") }, function () { });
		});
	}

	removeTextBookmarks(el, sort) {
		this.elInputBookmarks.value = "";
		storage.setOption("lastSearchBookmarks", "");
		this.searchBookmarks("");
		this.tags.activaTag();
	}

	searchBookmarks(el) {
		console.time('load');
		let str;
		if (typeof el == "object") {
			str = el.target.value;
		} else {
			str = el;
		}
		storage.setOption("lastSearchBookmarks", str);

		this.loaderDownList = true;
		this.daysShowStart = 0;
		this.daysShowEnd = Configs.visibleItemsInBookmarks;
		this.elFindBookmarks.innerHTML = "0";
		this.elListBookmarks.innerHTML = "";
		this.showHideBtnOpenBookmarks(true);

		if (str.length < 2) return false;

		clearInterval(this.timeoutBookmarks);
		this.elLoaderBookmarks.classList.add("active");
		this.timeoutBookmarks = setTimeout(() => {
			chrome.bookmarks.search(str, tree => {
				if (!tree.length) {
					let li = document.createElement("li");
					li.classList.add('not-found');
					li.innerHTML = this.elNotFound.innerHTML;
					this.elListBookmarks.appendChild(li);
				} else {
					let arrBookmarks = [];
					tree.sort(Helpers.compare.bind(storage.getOption("sortBookmarks")));
					this.elFindBookmarks.innerHTML = tree.length;

					for (let i = 0, length = tree.length; i < length; i++) {
						let item = tree[i];
						if (item.url === undefined) continue;
						arrBookmarks.push(
							{
								id: item.id,
								title: item.title,
								added: item.dateAdded,
								url: item.url
							}
						);
					}

					this.currentArrBookmarks = arrBookmarks;
					this.renderList();
					this.showHideBtnOpenBookmarks();
					this.loaderDownList = false;
				}
				this.elLoaderBookmarks.classList.remove("active");

			});
		}, 200);
	}

	renderList() {
		let arrBookmarks = this.currentArrBookmarks;
		for (let i = this.daysShowStart, len = arrBookmarks.length; i < len && i < this.daysShowEnd; i++) {
			let item = arrBookmarks[i];
			let li = document.createElement("li");
			li.setAttribute("data-id", item.id);

			let url = new URL(item.url);
			let title = (item.title && Helpers.escapeHtml(item.title)) || url.host;
			let added = new Date(item.added).toLocaleString();
			try {
				li.innerHTML = `
					<div class="delete">x</div>
					<div class="btn-search"></div>
					<div class="time">${added}</div>
					<div class="show-url"></div>
					<a style="background-image:url(chrome://favicon/${url.origin})">
						<div class="url">${item.url}</div>
						<div class="h-t">${title}</div>
					</a>`
			} catch (e) {
				console.log(e + "error !!");
			}
			this.elListBookmarks.appendChild(li);
		}
		this.daysShowStart += this.counterStep;
		this.daysShowEnd += this.counterStep;
		console.timeEnd('load');
	}

	activate() {
		this.searchBookmarks(storage.getOption("lastSearchBookmarks"));
	}

	showHideBtnOpenBookmarks(hide) {
		if (hide) {
			this.elBtnOpenFindBookmarks.style.display = "none";
		} else if (!!Dom.queryOne(".tab-bookmarks .results-bookmarks li") && this.currentArrBookmarks.length < 50) {
			this.elBtnOpenFindBookmarks.style.display = "block";
		} else {
			this.elBtnOpenFindBookmarks.style.display = "none";
		}
	}

	getTags() {
		return new Tags({
			search: "bookmarks_search",
			alias: "bookmark_tags",
			container: "tags_bookmarks",
			elAdd: "add_tag_bookmark",
			colorActive: "rgba(77, 192, 177, 0.4)",
			funcSearch: this.searchBookmarks.bind(this)
		});
	}
}

export function bookmarks() {
	new Bookmarks().activate();
}