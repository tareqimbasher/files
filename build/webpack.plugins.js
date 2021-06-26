const path = require('path');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");

module.exports = [
    new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, '../', "assets"),
                to: path.resolve(__dirname, '../', '.webpack/renderer', "assets")
            }
        ]
    })
];

if (process.platform !== "darwin") {
    module.exports.push(
        new webpack.IgnorePlugin({
            resourceRegExp: /^fsevents$/,
        })
    );
}