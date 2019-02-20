import { Configs } from "../configs";

class Storage {
	constructor() {
		this.storage = window.localStorage;
	}

	init() {
		//this.setOption("showUrl", this.getOption("showUrl", "on"));
		this.setOption("showOneLine", this.getOption("showOneLine", "on"));
		this.setOption("tabs", this.getOption("tabs", "1"));
		this.setOption("lastSearchTabs", this.getOption("lastSearchTabs"));
		this.setOption("lastSearchBookmarks", this.getOption("lastSearchBookmarks"));
		this.setOption("lastSearchHystory", this.getOption("lastSearchHystory"));
		this.setOption("tabs_tags", this.getOption("tabs_tags", "[]"));
		this.setOption("bookmark_tags", this.getOptionFix(["bookmark_tags", "vt_tags"], "[]"));
		this.setOption("history_tags", this.getOptionFix(["history_tags", "vt_tags_h"], "[]"));
		this.setOption("sortBookmarks", this.getOption("sortBookmarks", Configs.sortDefault));

		this.setOption("historyDates", this.getOption("historyDates", '{}'));

		return this;
	}

	getOption(option, def) {
		return this.storage.getItem(option) || def || "";
	}

	getOptionFix(option, def) {
		return (
			this.storage.getItem(option[0]) ||
			this.storage.getItem(option[1]) ||
			def || ""
		);
	}

	setOption(option, value) {
		this.storage.setItem(option, value);
		return value;
	}
}

export default new Storage().init();