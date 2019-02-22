import { translate } from "./translate"
import { Dom } from "./components/Core";
import { State } from "./configs";
import storage from "./components/Storage";
import { tabs } from "./pages/Tabs";
import { bookmarks } from "./pages/Bookmarks";
import { history } from "./pages/History";

import "../css/_global.styl";
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
			case "btn-tabs":
				if (!State.current.tabs) {
					State.current.tabs = true;
					tabs();
				}
				break;
			case "btn-bookmarks":
				if (!State.current.bookmarks) {
					State.current.bookmarks = true;
					bookmarks();
				}
				break;
			case "btn-history":
				if (!State.current.history) {
					State.current.history = true;
					history();
				}
				break;
		}
		Dom.queryOne(`.tabs .${item0}`).classList.add("active");
	});
});

Dom.queryOne(`#panel > div:nth-child(${storage.getOption("tabs")})`).click();