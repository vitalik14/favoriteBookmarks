/**
 * Created by vitalik on 06.11.2016.
 */
import { Dom } from "./components/Core";



function translate() {
	const words = [
		//	tabs
		"xTabs", "xSettings", "xShowOnlyOneLine", "xDeleteCopy",
		//	bookmarks
		"xBookmarks", "xSort", "xDate", "xUrl", "xTitle", "xOpenAll",
		//	history
		'xHistory', 'xFilter', "xNotFound"
	];

	words.forEach(alias => {
		Dom.queryOne(`.${alias}`).innerText = chrome.i18n.getMessage(alias, null);
	});
}

window.onload = () => {
	translate();
};
