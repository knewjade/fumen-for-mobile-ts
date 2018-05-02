const path = require('path');
const version = process.env.TRAVIS_BUILD_NUMBER || `dev-${new Date().toISOString()}`;
const isDebug = (!process.env.TRAVIS_BUILD_NUMBER) + '';

module.exports = {
    entry: [
        './src/actions.ts'
    ],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'public')
    },
    module: {
        rules: [
            {
                test: /states\.ts$/,
                loader: 'string-replace-loader',
                options: {
                    search: '###VERSION###',
                    replace: version,
                }
            },
            {
                test: /actions\.ts$/,
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
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};