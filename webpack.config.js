const { GenerateSW } = require('workbox-webpack-plugin');

const path = require('path');
// GitHub Actionsへの移行に合わせて、ビルド番号は1000から開始する
const buildNumber = process.env.GITHUB_RUN_NUMBER
    ? parseInt(process.env.GITHUB_RUN_NUMBER) + 1000
    : undefined
const version = buildNumber ? `${buildNumber}` : `dev-${new Date().toISOString()}`;
const isDebug = process.env.DEBUG_ON || 'true'
console.log(`isDebug=${isDebug}`)
const cacheId = 'fumen-for-mobile';

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
    },
    plugins: [
        new GenerateSW({
            cacheId: cacheId,
            swDest: 'sw.js',
            clientsClaim: true,
            skipWaiting: true,
            offlineGoogleAnalytics: true,
            runtimeCaching: [
                {
                    urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/materialize\/.+\.(js|css)$/,
                    handler: "CacheFirst",
                    options: {
                        cacheName: cacheId + "-materialize-cache",
                        expiration: {
                            maxAgeSeconds: 60 * 60 * 24 * 14,
                        },
                    },
                },
                {
                    urlPattern: /^https:\/\/fonts\.googleapis\.com\/icon\?family=Material\+Icons$/,
                    handler: "CacheFirst",
                    options: {
                        cacheName: cacheId + "-materialize-font-cache",
                        expiration: {
                            maxAgeSeconds: 60 * 60 * 24 * 14,
                        },
                    },
                },
            ],
        })
    ]
};
