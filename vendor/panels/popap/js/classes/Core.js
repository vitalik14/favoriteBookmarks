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


class T {
    constructor (obj) {}
    static addClass(cl, el) {
        el.classList.add(cl);
        return el;
    }
    static removeClass(cl, el) {
        el.classList.remove(cl);
        return el;
    }
    static query(query) {
        return document.querySelectorAll(query);
    }
    static queryOne(query) {
        return document.querySelector(query);
    }
    static id(id) {
        return document.getElementById(id)
    }
    static  b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
        }));
    }
    static storage(alias, val) {
        if (val) {
            localStorage[alias] = val;
            return localStorage[alias];
        } else {
           return localStorage[alias] || false;
        }
    }
 }



 class DragDrop {
    constructor (obj) {
        let self = this;
        let type;       
        for (let p in obj) this[p] = obj[p];

        this.elements.forEach(function(elem) {
            elem.addEventListener('drag', function(e) {
               e.dataTransfer.setData("text/html", e.target.getAttribute('data-id'));
            });

            elem.addEventListener('drop', function(e) {
                let element = T.queryOne('#' + self.container + ' [data-id="' + e.dataTransfer.getData("text/html") + '"]');
                let buf = self.getNodeItem(e);
     
                if (self.type === 'tabs') {
                    T.id(self.container).insertBefore(element, buf.previousSibling);
                    chrome.tabs.move(+element.getAttribute('data-id'), {
                        index: +buf.getAttribute('data-index')
                    }, function() {
                        app.data = [];
                        modules.saveFrames();
                    });
                    e.target.style.background = '#FFF';
                } else if (self.type === 'tags') {

                    let bufIndex = self.getNodeItem(e).getAttribute('data-index');
                    let elementIndex = element.getAttribute('data-index');

                    if (bufIndex > elementIndex) {
                        T.id(self.container).insertBefore(element, buf.nextSibling);
                    } else {
                        T.id(self.container).insertBefore(element, buf);
                    }
                    self.getNodeItem(e).setAttribute('data-index', String(elementIndex));
                    element.setAttribute('data-index', String(bufIndex));

                }
                return false;
            });
            
            elem.addEventListener('dragend', ()=>{});
            elem.addEventListener('dragenter', function(e) {
                e.preventDefault();
                return true;
            });

            elem.addEventListener('dragleave', function(e) { 
                if (self.type !== 'tags') {
                    self.getNodeItem(e).style.boxShadow = '2px 1px 3px #D3D3D3';
                }
            });

            elem.addEventListener('dragover', function(e) {
                if (self.type !== 'tags') {
                    self.getNodeItem(e).style.boxShadow = 'inset 0 1px 3px #0086F8';
                }
                e.preventDefault();
            });

            elem.addEventListener('dragstart', function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData("text/html", e.target.getAttribute('data-id'));
                e.dataTransfer.setDragImage(e.target, 0, 0);
                return true;
            });
        })
    }
    getNodeItem(e) {
        let tag = 'LI';
        let target = e.target;
        if (target.nodeName !== tag) { 
            while (target.nodeName !== tag) {
                target = target.parentNode;
            }
        }
        return target;
    }
}






class Tags {
    constructor (obj) {
        for (let p in obj) this[p] = obj[p];
        
        if (localStorage[this.alias] === '{}') {
            localStorage[this.alias] = '[]';
        }
        localStorage[this.alias] = localStorage[this.alias] || '{}';

        this.showAllTags();
        this._addEvents();
    }
    get colors() {
        return {
            colorDefault: '#EEEEEE',
            colorDeleteTag: '#f0c4c4'
        };
    }
    getTags() {
        return JSON.parse(localStorage[this.alias]);
    } 
    addTag(tag) {
        let tags = JSON.parse(localStorage[this.alias]);
        if (!tags.includes) {
            tags = [];
        }
        if (!tags.includes(tag)) {
            tags.push(tag);
            localStorage[this.alias] = JSON.stringify(tags);
            return true;
        }
         return false;
    }
    delTag(tag) {
        let tags = JSON.parse(localStorage[this.alias]);

        if (!!~tags.indexOf(tag)) {
            tags.splice(tags.indexOf(tag), 1);
            localStorage[this.alias] = JSON.stringify(tags);
            return true;
        }
        return tags;
    }
    showAllTags() {
        var self = this;
        var tagsElement = T.id(this.container);
        var tags = this.getTags();
        tagsElement.innerHTML = '';
        for (let i = 0, length = tags.length; i < length; i++) {
            let div = document.createElement('li');
            let tag = tags[i];
            var arrLi = [];
            div.setAttribute('class', 'tag');
            div.setAttribute('draggable', 'true');
            div.setAttribute('data-id', T.b64EncodeUnicode(tag));
           
            div.setAttribute('data-index', i);
            div.innerHTML = `<span class="tag-del">x</span><span class="tagName">${tag}</span>`;
            tagsElement.appendChild(div);

            let deleteTag = div.children[0];
            deleteTag.addEventListener('click', function() {
                self.delTag(this.parentNode.children[1].innerHTML);
                self.showAllTags();
                self.activaTag();
            });
            deleteTag.addEventListener('mouseover', function() {
                this.parentNode.style.background = self.colors.colorDeleteTag;
                this.parentNode.style.borderColor = self.colors.colorDeleteTag;
            });
            deleteTag.addEventListener('mouseout', function() {
                this.parentNode.style.background = self.colors.colorDefault;
                this.parentNode.style.borderColor = self.colors.colorDefault;
            });

            let searchTag = div.children[1];
            searchTag.addEventListener('click', function() {
                T.id(self.search).value = this.innerHTML;
                self.activaTag();
                self.funcSearch(this.innerHTML, {sort: null, interval: 0});
            });
            
            searchTag.addEventListener('mouseover', function() {
                this.parentNode.style.background = self.colorActive;
            });
            searchTag.addEventListener('mouseout', function() {
                this.parentNode.style.background = self.colors.colorDefault;
            });
            arrLi.push(div);
        }

        new DragDrop({
           elements: T.id(self.container).childNodes,
           type: 'tags',
           container: self.container
        });
    }
    _addEvents() {
        let self = this;
        T.id(this.elAdd).addEventListener('click', function(el) {
            let search = T.id(self.search);
            if (!!search.value && search.value !== '') {
                self.addTag(search.value);
                self.showAllTags();
                self.activaTag();
            }
        });
        T.id(self.search).addEventListener('input', function() {
           self.activaTag();
        });
        self.activaTag();
    }
    activaTag() {
        let self = this;
        let search = T.id(self.search).value;

        T.query('#' + self.container + ' .tag').forEach(function(el) {
            if (el.children[1].innerHTML === search) {
                el.style.borderColor = self.colorActive;
            } else {
                el.style.borderColor = self.colors.colorDefault;
            }
        });
    }
}