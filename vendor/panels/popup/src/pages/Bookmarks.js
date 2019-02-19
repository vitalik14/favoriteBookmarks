/**
 * Created by vitalik on 06.11.2016.
 */
import { Dom, Helpers } from "../components/Core";
import Tags from "../components/Tags";
import storage from "../components/Storage";

class Bookmarks {
	constructor() {
		this.elInputBookmarks = Dom.id("search_bookmarks");
		this.elRemoveTextSearchBookmarks = Dom.id("remove-text-search_b");
		this.elListBookmarks = Dom.id("results_b");
		this.elFindBookmarks = Dom.id("findBookmarks");
		this.elSelectSort = Dom.id("selectSort_b");
		this.elBtnOpenFindBookmarks = Dom.id("openBookmarks");
		this.elLoaderBookmarks = Dom.id("loader-bookmarks");
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
			this.searchBookmarks(storage.getOption("lastSearchBookmarks"), {
				sort: el.target.value
			});
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
			} else if (_class.contains('bookmark-delete')) {
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




		//deleteBookmarks
	}

	openFindBookmarks() {
		Dom.query("#results_b > li > a").forEach(e => {
			chrome.tabs.create({ url: e.getAttribute("href") }, function () { });
		});
	}

	removeTextBookmarks(el, sort) {
		this.elInputBookmarks.value = "";
		this.searchBookmarks("", {
			sort: this.elInputBookmarks.value,
		});
		this.tags.activaTag();
	}

	searchBookmarks(el, data) {
		//	debugger;
		if (!data) {
			// event in input
			var data = {
				sort: storage.getOption("sortBookmarks")
			};
		}
		let str;
		if (typeof el == "object") {
			str = el.target.value;
			storage.setOption("lastSearchBookmarks", el.target.value);
		} else {
			str = el;
			storage.setOption("lastSearchBookmarks", el);
		}
		this.elFindBookmarks.innerHTML = "0";
		this.elListBookmarks.innerHTML = "";

		this.showHideBtnOpenBookmarks(true);

		if (str.length < 2) return false;

		clearInterval(this.timeoutBookmarks);
		this.elLoaderBookmarks.classList.add("active");
		this.timeoutBookmarks = setTimeout(() => {
			chrome.bookmarks.search(str, tree => {
				data.sort = data.sort || storage.getOption("sortBookmarks");
				tree.sort(Helpers.compare.bind(data.sort));
				this.elFindBookmarks.innerHTML = tree.length;
				for (let i = 0, length = tree.length; i < length; i++) {
					let item = tree[i];
					let title =
						(item.title && Helpers.escapeHtml(item.title)) ||
						item.url.split("/")[2];

					if (item.url === undefined) continue;

					item.domain = new URL(item.url).origin;

					let div = document.createElement("li");
					div.setAttribute("data-id", item.id);
					let dateAdded = new Date(item.dateAdded).toLocaleString();
					try {
						div.innerHTML = `
						<div class="bookmark-delete">x</div>
						<div class="btn-search"></div>
						<div class="time">${dateAdded}</div>
						<div class="show-url"></div>
						<a style="background-image:url(chrome://favicon/${item.domain})">
							<div class="url">${item.url}</div>
							<div class="h-t">${title}</div>
						</a>`

					} catch (e) {
						console.log(e + "error !!");
					}

					this.elListBookmarks.appendChild(div);
				}
				this.elLoaderBookmarks.classList.remove("active");
				this.showHideBtnOpenBookmarks();
			});
		}, 200);
	}

	activate() {
		this.searchBookmarks(storage.getOption("lastSearchBookmarks"), {
			sort: storage.getOption("sortBookmarks"),
		});
	}

	showHideBtnOpenBookmarks(hide) {
		if (hide) {
			this.elBtnOpenFindBookmarks.style.display = "none";
		} else if (!!Dom.queryOne(".t_bookmarks .results div")) {
			this.elBtnOpenFindBookmarks.style.display = "block";
		} else {
			this.elBtnOpenFindBookmarks.style.display = "none";
		}
	}

	getTags() {
		return new Tags({
			search: "search_bookmarks",
			alias: "bookmark_tags",
			container: "tags_b",
			elAdd: "addTags_b",
			colorActive: "rgba(77, 192, 177, 0.4)",
			funcSearch: this.searchBookmarks.bind(this)
		});
	}
}

export const bookmarks = new Bookmarks();
bookmarks.activate();
