module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' }
        ]
    }
};