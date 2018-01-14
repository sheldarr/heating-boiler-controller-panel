const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './entry.jsx',
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'react']
            }
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
              use: "css-loader"
            })
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            'React': 'react',
        }),
        new ExtractTextPlugin('style.css')
    ],
};