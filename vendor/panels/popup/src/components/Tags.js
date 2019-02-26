import { Dom, Helpers } from "./Core";
import DragDrop from "./DragDrop";
import storage from "./Storage";

export default class Tags {
	constructor(obj) {
		for (const p in obj) this[p] = obj[p];
		storage.setOption(this.alias, storage.getOption(this.alias, "[]"));
		this.tagsElement = Dom.id(this.container);
		this.initialListeners();
		this.showAllTags();
		this.addEvents();
		this.activeTag();
	}

	initialListeners() {
		this.tagsElement.addEventListener("click", el => {
			let elem = el.target;

			if (elem.classList.contains('tag-del')) {
				this.delTag(elem.parentNode.children[1].innerHTML);
				this.showAllTags();

			} else if ((elem.classList.contains('tag') && (elem = elem.children[1])) || elem.classList.contains('tag-name')) {
				Dom.id(this.search).value = elem.innerHTML;
				this.funcSearch(elem.innerHTML);
			}

			this.activeTag();
		});
	}

	get colors() {
		return {
			colorBackgroundDefault: "#EEEEEE",
			colorDeleteTag: "#f0c4c4"
		};
	}

	getTags() {
		return JSON.parse(storage.getOption(this.alias));
	}

	saveTags(tags) {
		storage.setOption(this, JSON.stringify(tags));
	}

	addTag(tag) {
		const tags = this.getTags();

		if (!tags.includes) {
			tags = [];
		}
		if (!tags.includes(tag)) {
			tags.push(tag);
			storage.setOption(this.alias, JSON.stringify(tags));
			return true;
		}
		return false;
	}

	delTag(tag) {
		const tags = this.getTags();

		if (!!~tags.indexOf(tag)) {
			tags.splice(tags.indexOf(tag), 1);
			storage.setOption(this.alias, JSON.stringify(tags));
			return true;
		}
		return tags;
	}

	showAllTags() {
		const self = this;
		const tags = self.getTags();

		this.tagsElement.innerHTML = "";
		for (let i = 0, length = tags.length; i < length; i++) {
			const li = document.createElement("li");
			const tag = tags[i];

			li.setAttribute("class", "tag");
			li.setAttribute("draggable", "true");
			li.setAttribute("data-id", Helpers.b64EncodeUnicode(tag));
			li.setAttribute("data-index", i);
			li.innerHTML = `<span class="tag-del"></span><span class="tag-name">${tag}</span>`;
			this.tagsElement.appendChild(li);
		}

		new DragDrop({
			elements: Dom.id(self.container).childNodes,
			type: "tags",
			container: self.container,
			funcSaveSort: this.saveTags.bind(this.alias)
		});
	}

	addEvents() {
		Dom.id(this.elAdd).addEventListener("click", () => {
			const div = document.createElement('div');

			div.innerHTML = Dom.id(this.search).value;
			if (!!div.innerText) {
				this.addTag(div.innerText);
				this.showAllTags();
				this.activeTag();
			}
		});

		Dom.id(this.search).addEventListener("input", () => this.activeTag());
		this.activeTag();
	}

	activeTag() {
		const btnAdd = Dom.id(this.elAdd);
		const text = Dom.id(this.search).value;

		btnAdd.style.display = "block";
		btnAdd.parentNode.children[1].style.right = "40px";

		if (!text) {
			btnAdd.style.display = "none";
		}

		Dom.query(`#${this.container} .tag`).forEach(el => {


			el.classList.contains('active') && el.classList.remove('active');
			if (!text) {
				btnAdd.style.display = "none";
			} else if (el.children[1].innerHTML === text) {
				btnAdd.parentNode.children[1].style.right = "8px";
				btnAdd.style.display = "none";
				el.classList.add('active');
			}
		});
	}
}
