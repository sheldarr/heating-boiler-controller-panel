const webpack = require('webpack');

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
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            'React': 'react',
        })
    ],
};