import "./translate";
import { Dom } from "./components/Core";
import { State } from "./configs";
import storage from "./components/Storage";

import "../css/_global.styl";
import "../css/tags.styl";
import "../css/tabs.styl";
import "../css/bookmarks.styl";
import "../css/history.styl";

Dom.query("#panel > div").forEach(el => {
	el.addEventListener("click", (e) => {
		const list = e.currentTarget.classList;
		const item0 = list.item(0);

		Dom.query("#panel > div, .tabs > div").forEach(e =>
			e.classList.remove("active")
		);

		list.add("active");
		switch (list.item(1)) {
			case "btn-tabs":
				if (!State.current.tabs) {
					State.current.tabs = true;
					require.ensure([], (require) => {
						setTimeout(require("./pages/Tabs").tabs(), 5);

					});
				}
				break;
			case "btn-bookmarks":
				if (!State.current.bookmarks) {
					State.current.bookmarks = true;
					require.ensure([], (require) => {
						require("./pages/Bookmarks").bookmarks();
					});

				}
				break;
			case "btn-history":
				if (!State.current.history) {
					State.current.history = true;
					require.ensure([], (require) => {
						require("./pages/History").history();
					});
				}
				break;
		}
		storage.setOption("tabs", item0.split("tab")[1]);
		Dom.queryOne(`.tabs .${item0}`).classList.add("active");
	});
});

Dom.queryOne(`#panel > div:nth-child(${storage.getOption("tabs")})`).click();
