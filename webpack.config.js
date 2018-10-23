const path = require('path');
const version = process.env.TRAVIS_BUILD_NUMBER || `dev-${new Date().toISOString()}`;
// const isDebug = (!process.env.TRAVIS_BUILD_NUMBER) + '';
const isDebug = 'true';

module.exports = {
    entry: [
        './src/actions.ts'
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'public')
    },
    module: {
        rules: [
            {
                test: /env\.ts$/,
                loader: 'string-replace-loader',
                options: {
                    search: '###VERSION###',
                    replace: version,
                }
            },
            {
                test: /env\.ts$/,
                loader: 'string-replace-loader',
                options: {
                    search: '###DEBUG###',
                    replace: isDebug,
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
        ]
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: 'initial',
        },
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};