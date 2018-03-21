/**
 * Created by vitalik on 06.11.2016.
 */
window.onload = function() {
	translate();
}

function translate() {
	T.id('deleteCopy').innerText = chrome.i18n.getMessage("deleteCopy", null);
	T.queryOne('.settings-btn').innerText = chrome.i18n.getMessage("settings", null);
	T.queryOne('.xShowOnlyOneLine').innerText = chrome.i18n.getMessage("xShowOnlyOneLine", null);
	T.queryOne('.xShowUrl').innerText = chrome.i18n.getMessage("xShowUrl", null);
	T.queryOne('.xTabs').innerText = chrome.i18n.getMessage("xTabs", null);
	T.queryOne('.xOpenAll').innerText = chrome.i18n.getMessage("xOpenAll", null);
	//T.queryOne('.xTopSites').innerText = chrome.i18n.getMessage("xTopSites", null);
	T.queryOne('.xBookmarks').innerText = chrome.i18n.getMessage("xBookmarks", null);
	T.queryOne('.xSort').innerText = chrome.i18n.getMessage("xSort", null);
	T.queryOne('.xDate').innerText = chrome.i18n.getMessage("xDate", null);
	T.queryOne('.xUrl').innerText = chrome.i18n.getMessage("xUrl", null);
	T.queryOne('.xTitle').innerText = chrome.i18n.getMessage("xTitle", null);
}