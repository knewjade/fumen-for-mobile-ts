const CopyPlugin = require("copy-webpack-plugin");
const { GenerateSW } = require('workbox-webpack-plugin');

const path = require('path');
// GitHub Actionsへの移行に合わせて、ビルド番号は1000から開始する
const buildNumber = process.env.GITHUB_RUN_NUMBER
    ? parseInt(process.env.GITHUB_RUN_NUMBER) + 1000
    : undefined
const version = buildNumber ? `${buildNumber}` : `dev-${new Date().toISOString()}`;
const isDebug = process.env.DEBUG_ON || 'true'
const cacheId = 'fumen-for-mobile';
const destDirectory = path.join(__dirname, 'dest')

module.exports = {
    entry: [
        './src/actions.ts',
    ],
    output: {
        filename: '[name].bundle.js',
        path: destDirectory,
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
                use: 'ts-loader',
            },
            {
                test: /\.css$/i,
                use: 'css-loader',
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
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: path.join(__dirname, 'resources'), to: destDirectory },
            ],
        }),
        new GenerateSW({
            cacheId: cacheId,
            swDest: 'sw.js',
            clientsClaim: true,
            skipWaiting: true,
            offlineGoogleAnalytics: true,
        }),
    ]
};
