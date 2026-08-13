const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


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
        new CopyWebpackPlugin({
            patterns: [
                { from: 'index.html', to: './' }, // Adjust the 'from' path as necessary
                { from: 'favicon.svg', to: './' },
                { from: 'favicon.ico', to: './' },
                { from: 'favicon.png', to: './' },
                { from: 'output/indexed-in-KERISSE.html', to: './' },
                { from: 'output/search-index.orama.msgpack.gz', to: './', noErrorOnMissing: true },
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