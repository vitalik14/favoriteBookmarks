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
