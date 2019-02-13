import emptyImg from "../img/empty.png";

export const app = {
	data: [],
	emptyImg: emptyImg,
	short: "short",
	sortDefault: "dateAdded",
	current: {
		tabs: false,
		bookmarks: false,
		history: false
	},
	faviconValidate(str) {
		return str || emptyImg;
	}
};