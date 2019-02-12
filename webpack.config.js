var path = require("path");

module.exports = {
	mode: "development",
	entry: "./vendor/panels/popap/src/main.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "foo.bundle.js"
	}
};
