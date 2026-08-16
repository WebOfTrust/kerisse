const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const searchIndexBaseUrl = process.env.SEARCH_INDEX_BASE_URL || 'search-index/';


module.exports = {
    entry: {
        main: './src/instantSearchInit.js',
        instantSearch: './src/instantSearch.js',
        additional2: './src/scrollHorizontallyToKeyWordInSearchResults.js',
        additional3: './src/backToTop.js'
    },
    output: {
        // filename: '[name].[contenthash].bundle.js',
        filename: '[name].bundle.js', // main.bundle.js, instantSearch.bundle.js, etc.
        path: path.resolve(__dirname, 'dist'), // Directory for the bundled file
    },
    devServer: {
        static: './dist', // Folder to serve files from
        hot: true, // Enable hot module replacement
        client: {
            logging: 'none',
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/, // Matches any CSS file
                // use: ['style-loader', 'css-loader'], // Processes CSS files
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.SEARCH_INDEX_BASE_URL': JSON.stringify(searchIndexBaseUrl),
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'index.html', to: './' }, // Adjust the 'from' path as necessary
                { from: 'bookmarks/index.html', to: 'bookmarks/' },
                { from: 'favicon.svg', to: './' },
                { from: 'favicon.ico', to: './' },
                { from: 'favicon.png', to: './' },
                { from: 'output/indexed-in-KERISSE.html', to: './' },
                // Per-category index shards + manifest.json. Optional: in production
                // these can live on an external host instead (paths.searchIndexBaseUrl).
                { from: 'output/search-index', to: 'search-index', noErrorOnMissing: true },
                { from: 'src/*.css', to: '[name][ext]' },
                { from: 'src/*.svg', to: 'icons/[name][ext]' },
                { from: 'src/*.png', to: '[name][ext]' },

            ]
        })
        // ,
        // new MiniCssExtractPlugin({
        //     filename: '[name].css',
        // })
    ],
    // mode: 'production'
    mode: 'development'
};