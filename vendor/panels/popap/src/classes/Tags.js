class Tags {
	constructor (obj) {
		for (let p in obj) this[p] = obj[p];

		localStorage[this.alias] = localStorage[this.alias] || '[]';

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
		let tags = this.getTags();
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
		let tags = this.getTags();

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
			let value = T.id(self.search).value;
			if (!!value) {
				self.addTag(value);
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
		let tags = '#' + self.container + ' .tag';
		T.query(tags).forEach(function(el) {
			el.style.borderColor = el.children[1].innerHTML === search
				?self.colorActive
				:self.colors.colorDefault
		});
	}
}