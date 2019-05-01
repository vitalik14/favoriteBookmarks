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

		this.elInputBookmarks = Dom.id("bookmarksSearch");
		this.elRemoveTextSearchBookmarks = Dom.id("removeTextBookmarks");
		this.elListBookmarks = Dom.id("resultsBookmarks");
		this.elFindBookmarks = Dom.id("findBookmarks");
		this.elFindBookmarksSearch = Dom.id("openBookmarksSearch");
		debugger;
		this.elNotFound = Dom.id("notFound");

		this.elSelectSort = Dom.id("selectSortBookmarks");
		this.elBtnOpenFindBookmarks = Dom.id("openBookmarks");
		this.elLoaderBookmarks = Dom.id("loaderBookmarks");
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
				this.search(el);
			}, 800);
		});

		this.elRemoveTextSearchBookmarks.addEventListener("click", this.removeTextBookmarks.bind(this));

		this.elBtnOpenFindBookmarks.addEventListener("click", this.openFindBookmarks.bind(this));

		this.elSelectSort.addEventListener("change", el => {
			storage.setOption("sortBookmarks", el.target.value);
			this.search(storage.getOption("lastSearchBookmarks"));
		});
		this.elListBookmarks.addEventListener("click", el => {
			let elem = el.target;
			const classList = elem.classList;
			let childrens = false;

			if (classList.contains('h-l') || (classList.contains('h-t') && (childrens = true))) {
				if (childrens) {
					elem = elem.parentElement;
				}
				chrome.tabs.create({ url: elem.children[0].innerHTML }, null);

			} else if (classList.contains('btn-search')) {
				const textSearch = this.elInputBookmarks.value = new URL(elem.parentElement.children[4].children[0].innerHTML).host;

				this.search(textSearch);
				this.tags.activeTag();

			} else if (classList.contains('delete')) {
				elem.addEventListener("click", function () {
					try {
						chrome.bookmarks.remove(this.parentNode.getAttribute("data-id"), function () {
							this.parentNode.remove();
						}.bind(this));
					} catch (e) { console.log(e); }
				});
			}

		}, true);

		this.elListBookmarks.addEventListener("scroll", el => {
			let elem = el.target;

			if (this.loaderDownList) {
				return false;
			}
			this.loaderDownList = true;

			Dom.id("loaderBookmarks").classList.add("active");
			if (elem.scrollHeight < (elem.scrollTop + elem.offsetHeight)) {
				this.renderList();
			}

			Dom.id("loaderBookmarks").classList.remove("active");
			this.loaderDownList = false;
		});
	}

	openFindBookmarks() {
		Dom.query("#resultsBookmarks > li > a .url").forEach(e => {
			chrome.tabs.create({ url: e.innerText }, () => { });
		});
	}

	removeTextBookmarks() {
		this.elInputBookmarks.value = "";
		storage.setOption("lastSearchBookmarks", "");
		this.search("");
		this.tags.activeTag();
		this.elInputBookmarks.focus();
	}

	search(el) {
		let str;

		if (typeof el === "object") {
			str = el.target.value;
		} else {
			str = el;
		}
		storage.setOption("lastSearchBookmarks", str);

		this.loaderDownList = true;
		this.daysShowStart = 0;
		this.daysShowEnd = Configs.visibleItemsInBookmarks;
		this.elFindBookmarks.innerHTML = "0";
		this.elFindBookmarksSearch.innerHTML = " "
		this.elListBookmarks.innerHTML = "";
		this.showHideBtnOpenBookmarks(true);

		//if (str.length < 2) return false;

		clearInterval(this.timeoutBookmarks);
		this.elLoaderBookmarks.classList.add("active");

		this.timeoutBookmarks = setTimeout(() => {

			chrome.bookmarks.search(str, tree => {
				tree = tree.filter(el => {
					return !!el.url;
				});

				var arr = [];
				console.log(tree);
				if (!tree.length) {
					chrome.bookmarks.getTree((items) => {
						getItems(items[0]);
					});

					function getItems(item) {
						if (item.children) {
							for (let i = 0; i < item.children.length; i++) {
								if (item.children[i].children) {
									getItems(item.children[i].children);
								} else {
									arr.push(item.children[i]);
								}
							}
						} else if (item.length) {
							for (let i = 0; i < item.length; i++) {
								getItems(item[i]);
							}
						} else {
							arr.push(item);
						}
					}
					// const li = document.createElement("li");
					// li.classList.add('not-found');
					// li.innerHTML = this.elNotFound.innerHTML;
					// this.elListBookmarks.appendChild(li);
					tree = arr;
				}
				console.log(tree);
				const length = tree.length;
				this.elFindBookmarksSearch.innerHTML = `( ${length} )`;
				const arrBookmarks = [];
				tree.sort(Helpers.compare.bind(storage.getOption("sortBookmarks")));
				this.elFindBookmarks.innerHTML = length;

				for (let i = 0; i < length; i++) {
					const item = tree[i];
					if (!item.url) continue;
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

				this.elLoaderBookmarks.classList.remove("active");
			});
		}, 200);
	}

	renderList() {
		const arrBookmarks = this.currentArrBookmarks;

		for (let i = this.daysShowStart, len = arrBookmarks.length; i < len && i < this.daysShowEnd; i++) {
			const item = arrBookmarks[i];
			const url = new URL(item.url);
			const title = (item.title && Helpers.escapeHtml(item.title)) || url.host;
			const added = new Date(item.added).toLocaleString();
			const li = document.createElement("li");

			li.setAttribute("data-id", item.id);

			try {
				li.innerHTML = `
					<div class="delete"></div>
					<div class="btn-search"></div>
					<div class="time">${added}</div>
					<div class="show-url"></div>
					<a class="h-l" style="background-image:url(chrome://favicon/${url.origin})">
						<div class="url">${item.url}</div>
						<div class="h-t">${title}</div>
					</a>`;
			} catch (e) {
				console.log(e);
			}
			this.elListBookmarks.appendChild(li);
		}

		this.daysShowStart += this.counterStep;
		this.daysShowEnd += this.counterStep;
	}

	activate() {
		this.search(storage.getOption("lastSearchBookmarks"));
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
			search: "bookmarksSearch",
			alias: "bookmark_tags",
			container: "tagsBookmarks",
			elAdd: "addTagBookmark",
			colorActive: "rgba(77, 192, 177, 0.4)",
			funcSearch: this.search.bind(this)
		});
	}
}

export function bookmarks() {
	new Bookmarks().activate();
}
