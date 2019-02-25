import { Dom, Helpers } from "./Core";
import DragDrop from "./DragDrop";
import storage from "./Storage";

export default class Tags {
	constructor(obj) {
		for (const p in obj) this[p] = obj[p];
		storage.setOption(this.alias, storage.getOption(this.alias, "[]"));
		this.showAllTags();
		this.addEvents();
	}

	get colors() {
		return {
			colorDefault: "#EEEEEE",
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
		const tagsElement = Dom.id(self.container);
		const tags = self.getTags();

		tagsElement.innerHTML = "";
		for (let i = 0, length = tags.length; i < length; i++) {
			const div = document.createElement("li");
			const tag = tags[i];

			div.setAttribute("class", "tag");
			div.setAttribute("draggable", "true");
			div.setAttribute("data-id", Helpers.b64EncodeUnicode(tag));
			div.setAttribute("data-index", i);
			div.innerHTML = `<span class="tag-del">x</span><span class="tagName">${tag}</span>`;

			tagsElement.appendChild(div);

			const deleteTag = div.children[0];

			deleteTag.addEventListener("click", function () {
				self.delTag(this.parentNode.children[1].innerHTML);
				self.showAllTags();
				self.activaTag();
			});

			deleteTag.addEventListener("mouseover", function () {
				this.parentNode.style.background = self.colors.colorDeleteTag;
			});

			deleteTag.addEventListener("mouseout", function () {
				this.parentNode.style.background = self.colors.colorDefault;
			});

			const searchTag = div.children[1];

			searchTag.addEventListener("click", function () {
				Dom.id(self.search).value = this.innerHTML;
				self.activaTag();
				self.funcSearch(this.innerHTML);
			});

			searchTag.addEventListener("mouseover",
				el => (el.target.parentNode.style.background = self.colorActive)
			);

			searchTag.addEventListener(
				"mouseout",
				el => (el.target.parentNode.style.background = self.colors.colorDefault)
			);
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
			const value = Dom.id(this.search).value;

			if (!!value) {
				this.addTag(value);
				this.showAllTags();
				this.activaTag();
			}
		});

		Dom.id(this.search).addEventListener("input", () => this.activaTag());
		this.activaTag();
	}

	activaTag() {
		Dom.query(`#${this.container} .tag`).forEach(el => {
			el.style.borderColor =
				el.children[1].innerHTML === Dom.id(this.search).value ?
					this.colorActive :
					this.colors.colorDefault;
		});
	}
}
