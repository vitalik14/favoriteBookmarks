import T from "./classes/Core";
import { app } from "./config";
import storage from "./storage";
import { initTabs } from "./tabs";
import { initBookmarks } from "./bookmarks";
import { initHistory } from "./history";

import "../css/_global.styl";
import "../css/tops.styl";
import "../css/tabs.styl";
import "../css/bookmarks.styl";
import "../css/history.styl";

T.query("#panel > div").forEach(el => {
	el.addEventListener("click", function() {
		let list = this.classList;
		let item0 = list.item(0);
		T.query("#panel > div, .tabs > div").forEach(e =>
			e.classList.remove("active")
		);
		list.add("active");
		storage.setOption("tabs", item0.split("tab")[1]);
		//localStorage["tabs"] = ;

		switch (list.item(2)) {
			case "p_tabs":
				if (!app.current.tabs) {
					app.current.tabs = true;
					initTabs();
				}
				break;
			case "p_bookmarks":
				if (!app.current.bookmarks) {
					app.current.bookmarks = true;
					initBookmarks();
				}
				break;
			case "p_history":
				if (!app.current.history) {
					app.current.history = true;
					initHistory();
				}
				break;
		}
		document.querySelector(".tabs ." + item0).classList.add("active");
	});
});

document
	.querySelector(`#panel > div:nth-child(${storage.getOption("tabs")})`)
	.click();
