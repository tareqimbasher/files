const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

module.exports = [
    new ForkTsCheckerWebpackPlugin(),
];

if (process.platform !== 'darwin') {
    module.exports.push(
        new webpack.IgnorePlugin({
            resourceRegExp: /^fsevents$/,
        })
    );
}