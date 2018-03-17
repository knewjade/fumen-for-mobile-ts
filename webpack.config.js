const path = require('path');

module.exports = {
    entry: [
        './src/index.ts'
    ],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'public/js')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};