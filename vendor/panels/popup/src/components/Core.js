/**
 * Created by vitalik on 06.11.2016.
 */
import emptyImg from "../../img/empty.png";

export class Dom {
	constructor(obj) { }
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
		return document.getElementById(id);
	}
}

export class Helpers {
	static b64EncodeUnicode(str) {
		return btoa(
			encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(
				match,
				p1
			) {
				return String.fromCharCode("0x" + p1);
			})
		);
	}
	static escapeHtml(text) {
		return text.replace(/[\"&'\/<>]/g, function (a) {
			return {
				'"': "&quot;",
				"&": "&amp;",
				"'": "&#39;",
				"/": "&#47;",
				"<": "&lt;",
				">": "&gt;"
			}[a];
		});
	}

	static faviconValidate(str) {
		return str || emptyImg;
	}

	static compare(a, b) {
		if (a[this] > b[this]) return -1;
		if (a[this] < b[this]) return 1;
		return 0;
	}
}