let path = require("path");
const NODE_ENV = process.env.NODE_ENV || "development";
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
	mode: "development", //production
	entry: "./vendor/panels/popup/src/main.js",
	output: {
		path: path.resolve(__dirname, "public"),
		filename: "[name].js"
	},
	watch: NODE_ENV === "development",
	devtool: NODE_ENV === "development" ? "source-map" : "",
	plugins: [
		new CleanWebpackPlugin(["public"]),
		new CopyWebpackPlugin([
			{
				from: "vendor/**/*",
				to: path.resolve(__dirname, "public"),
				ignore: ["vendor/panels/popup/**/*"],
				transformPath(targetPath, absolutePath) {
					console.log(targetPath);
					let reg = /(vendor\/panels\/popup\/src)|(vendor\/panels\/popup)|(vendor\/panels)|(vendor)/;
					return targetPath.replace(reg, "");
				}
			}
		]),
		new HtmlWebpackPlugin({
			filename: "popup.html",
			template: "vendor/panels/popup/popup.html",
			minify: {
				collapseWhitespace: true,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true
			}
		})
	],
	module: {
		rules: [
			// {
			// 	test: /\.js$/,
			// 	exclude: /node_modules/,
			// 	use: ["babel-loader", "eslint-loader"]
			// },
			{
				test: /\.styl$/,
				loader: ["style-loader", "css-loader", "stylus-loader"]
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				use: [
					"url-loader?limit=10000",
					{
						loader: "img-loader",
						options: {
							plugins: [
								require("imagemin-gifsicle")({
									interlaced: false
								}),
								require("imagemin-mozjpeg")({
									progressive: true,
									arithmetic: false
								}),
								require("imagemin-pngquant")({
									floyd: 0.5,
									speed: 2
								}),
								require("imagemin-svgo")({
									plugins: [{ removeTitle: true }, { convertPathData: false }]
								})
							]
						}
					}
				]
			}
		]
	}
};
