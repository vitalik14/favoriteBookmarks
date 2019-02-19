/**
 * Created by vitalik on 06.11.2016.
 */
import { Dom } from "./components/Core";
window.onload = function () {
	translate();
};

function translate() {
	//tabs
	Dom.queryOne(".xTabs").innerText = chrome.i18n.getMessage("xTabs", null);
	Dom.queryOne(".settings-btn").innerText = chrome.i18n.getMessage("settings", null);
	Dom.queryOne(".xShowOnlyOneLine").innerText = chrome.i18n.getMessage("xShowOnlyOneLine", null);
	// Dom.queryOne(".xShowUrl").innerText = chrome.i18n.getMessage("xShowUrl", null);
	Dom.id("deleteCopy").innerText = chrome.i18n.getMessage("deleteCopy", null);

	//bookmarks
	Dom.queryOne(".xBookmarks").innerText = chrome.i18n.getMessage("xBookmarks", null);
	Dom.queryOne(".xSort").innerText = chrome.i18n.getMessage("xSort", null);
	Dom.queryOne(".xDate").innerText = chrome.i18n.getMessage("xDate", null);
	Dom.queryOne(".xUrl").innerText = chrome.i18n.getMessage("xUrl", null);
	Dom.queryOne(".xTitle").innerText = chrome.i18n.getMessage("xTitle", null);
	Dom.queryOne(".xOpenAll").innerText = chrome.i18n.getMessage("xOpenAll", null);

	//history
	Dom.queryOne('.xHistory').innerText = chrome.i18n.getMessage("xHistory", null);
	Dom.queryOne('.xFilter').innerText = chrome.i18n.getMessage("xFilter", null);
}
