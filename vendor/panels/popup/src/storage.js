import { app } from "./config";

class Storage {
	constructor() {
		this.storage = window.localStorage;
	}

	init() {
		console.log(33);
		this.setOption("showUrl", this.getOption("showUrl", "on"));
		this.setOption("showOneLine", this.getOption("showOneLine", "on"));
		this.setOption("tabs", this.getOption("tabs", "1"));
		this.setOption("lastSearchTabs", this.getOption("lastSearchTabs"));
		this.setOption(
			"lastSearchBookmarks",
			this.getOption("lastSearchBookmarks")
		);
		this.setOption("lastSearchHystory", this.getOption("lastSearchHystory"));
		this.setOption("tabs_tags", this.getOption("tabs_tags", "[]"));
		this.setOption(
			"bookmark_tags",
			this.getOptionFix(["bookmark_tags", "vt_tags"], "[]")
		);
		this.setOption(
			"history_tags",
			this.getOptionFix(["history_tags", "vt_tags_h"], "[]")
		);
		this.setOption(
			"sortBookmarks",
			this.getOption("sortBookmarks", app.sortDefault)
		);

		return this;
	}

	getOption(option, def) {
		return this.storage.getItem(option) || def || "";
	}

	getOptionFix(option, def) {
		return (
			this.storage.getItem(option[0]) ||
			this.storage.getItem(option[1]) ||
			def ||
			""
		);
	}

	setOption(option, value) {
		this.storage.setItem(option, value);
	}
}

//localStorage['sortHistory'] = localStorage['sortHistory'] || app.sortDefault;
export default new Storage().init();
