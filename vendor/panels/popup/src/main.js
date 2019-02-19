import { Dom } from "./components/Core";
import { State } from "./configs";
import storage from "./components/Storage";
import { tabs } from "./pages/Tabs";
import { bookmarks } from "./pages/Bookmarks";
import { history } from "./pages/History";

import "../css/_global.styl";
import "../css/tops.styl";
import "../css/tabs.styl";
import "../css/bookmarks.styl";
import "../css/history.styl";

Dom.query("#panel > div").forEach(el => {
	el.addEventListener("click", function () {
		let list = this.classList;
		let item0 = list.item(0);

		Dom.query("#panel > div, .tabs > div").forEach(e =>
			e.classList.remove("active")
		);
		list.add("active");
		storage.setOption("tabs", item0.split("tab")[1]);

		switch (list.item(1)) {
			case "p_tabs":
				if (!State.current.tabs) {
					State.current.tabs = true;
					tabs.activate();
					_gaq.push(['_trackEvent', 'tabs', 'clicked']);
				}
				break;
			case "p_bookmarks":
				if (!State.current.bookmarks) {
					State.current.bookmarks = true;
					bookmarks.activate();
					_gaq.push(['_trackEvent', 'bookmarks', 'clicked']);
				}
				break;
			case "p_history":
				if (!State.current.history) {
					State.current.history = true;
					history.activate();
					_gaq.push(['_trackEvent', 'history', 'clicked']);
				}
				break;
		}
		Dom.queryOne(`.tabs .${item0}`).classList.add("active");
	});
});

Dom.queryOne(`#panel > div:nth-child(${storage.getOption("tabs")})`).click();

