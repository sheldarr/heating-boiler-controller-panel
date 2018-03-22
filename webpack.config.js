const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: './entry.jsx',
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            enforce: "pre",
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: "eslint-loader",
        }, {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
              use: "css-loader"
            })
        }]
    },
    plugins: [
        new ExtractTextPlugin('style.css'),
        new BundleAnalyzerPlugin()
    ]
};