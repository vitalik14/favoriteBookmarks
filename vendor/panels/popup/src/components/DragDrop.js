import { Dom } from "./Core";

let current = 10;
export default class DragDrop {
	constructor(obj) {
		const self = this;
		let type;
		this.elDrag = null;
		for (const p in obj) this[p] = obj[p];

		this.elements.forEach(elem => {

			elem.addEventListener("drag", function (e) {
				this.constructor.current = e.currentTarget.parentNode.id;
				e.dataTransfer.setData("text/html", e.target.getAttribute("data-id"));
			}.bind(this));

			elem.addEventListener("drop", function (e) {
				let element = Dom.queryOne(`#${self.container} [data-id="${e.dataTransfer.getData("text/html")}"]`);
				let buf = self.getNodeItem(e);
				if (!element) return false;
				if (self.type === "tabs") {
					try {
						Dom.id(self.container).insertBefore(element, buf.previousSibling);
					} catch (e) {
						debugger;
					}
					chrome.tabs.move(
						+element.getAttribute("data-id"),
						{
							index: +buf.getAttribute("data-index")
						},
						() => {
							self.funcSaveSort();
						}
					);
					e.target.style.background = "#FFF";
				} else if (self.type === "tags") {
					const bufIndex = buf.getAttribute("data-index");
					const elementIndex = element.getAttribute("data-index");

					Dom.id(self.container).insertBefore(
						element,
						bufIndex > elementIndex ? buf.nextSibling : buf
					);

					buf.setAttribute("data-index", String(elementIndex));
					element.setAttribute("data-index", String(bufIndex));

					let arr = [];
					Dom.query(`#${self.container} .tag-name`).forEach(el => {
						arr.push(el.innerText);
					});
					self.funcSaveSort(arr);
				}

				return false;
			});

			// elem.addEventListener('dragend', ()=>{});
			elem.addEventListener("dragenter", function (e) {
				e.preventDefault();
				return true;
			});

			elem.addEventListener("dragleave", function (e) {
				if (DragDrop.current !== e.currentTarget.parentNode.id) {
					return false;
				}

				if (self.type !== "tags") {
					self.getNodeItem(e).style.boxShadow = "inset 2px 1px 3px #D3D3D3";
					self.getNodeItem(e).style.background = "#ffffff";
				}
			});

			elem.addEventListener("dragover", function (e) {
				if (self.constructor.current !== e.currentTarget.parentNode.id) {
					return false;
				}

				if (self.type !== "tags") {
					self.getNodeItem(e).style.boxShadow = "inset 0 1px 3px #0086F8";
					self.getNodeItem(e).style.background = "#d4e3fc";
				}
				e.preventDefault();
			});

			elem.addEventListener("dragstart", function (e) {
				e.dataTransfer.effectAllowed = "move";
				e.dataTransfer.setData("text/html", e.target.getAttribute("data-id"));
				e.dataTransfer.setDragImage(e.target, 0, 0);

				return true;
			});
		});
	}

	getNodeItem(e) {
		let [tag, target] = ["LI", e.target];
		if (target.nodeName !== tag)
			while (target.nodeName !== tag) target = target.parentNode;

		return target;
	}

	static get current() {
		return current;
	}

	static set current(id) {
		current = id;
	}
}
