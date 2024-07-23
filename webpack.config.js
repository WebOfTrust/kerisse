const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
    // entry: './src/typesenseInstantSearchInit.js', // Your main JavaScript file
    entry: {
        main: './src/typesenseInstantSearchInit.js',
        additional1: './src/typesenseInstantSearch.js',
        additional2: './src/scrollHorizontallyToKeyWordInSearchResults.js',
    },
    output: {
        // filename: '[name].[contenthash].bundle.js', // Generates main.bundle.js, additional1.bundle.js, etc.
        filename: '[name].bundle.js', // Generates main.bundle.js, additional1.bundle.js, etc.
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
                { from: 'output/indexed-in-KERISSE.html', to: './' }, // Adjust the 'from' path as necessary
                { from: 'src/custom.css', to: './custom.css' },
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