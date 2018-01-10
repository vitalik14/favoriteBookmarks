/**
 * Created by vitalik on 06.11.2016.
 */
window.onload = function() {
    translate();
}

function translate() {
    T.id('deleteCopy').innerText = chrome.i18n.getMessage("deleteCopy", ()=>{});
    T.queryOne('.settings-btn').innerText = chrome.i18n.getMessage("settings", ()=>{});
    T.queryOne('.xShowOnlyOneLine').innerText = chrome.i18n.getMessage("xShowOnlyOneLine", ()=>{});
    T.queryOne('.xShowUrl').innerText = chrome.i18n.getMessage("xShowUrl", ()=>{});
    T.queryOne('.xTabs').innerText = chrome.i18n.getMessage("xTabs", ()=>{});
    T.queryOne('.xOpenAll').innerText = chrome.i18n.getMessage("xOpenAll", ()=>{});
    T.queryOne('.xTopSites').innerText = chrome.i18n.getMessage("xTopSites", ()=>{});
    T.queryOne('.xBookmarks').innerText = chrome.i18n.getMessage("xBookmarks", ()=>{});
    T.queryOne('.xSort').innerText = chrome.i18n.getMessage("xSort", ()=>{});
    T.queryOne('.xDate').innerText = chrome.i18n.getMessage("xDate", ()=>{});
    T.queryOne('.xUrl').innerText = chrome.i18n.getMessage("xUrl", ()=>{});
    T.queryOne('.xTitle').innerText = chrome.i18n.getMessage("xTitle", ()=>{});
}