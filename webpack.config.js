/** @format */

const path = require('path')
require('webpack')
const pkg = require('./package.json')
const ROOT = path.resolve(__dirname, 'src')
const DESTINATION = path.resolve(__dirname, 'dist')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
    context: ROOT,
    entry: {
        main: './index.ts',
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './bundle-analysis.html',
            openAnalyzer: false,
        }),
    ],
    output: {
        path: DESTINATION,
        libraryTarget: 'umd',
        umdNamedDefine: true,
        library: pkg.name,
        filename: pkg.name + '.js',
        globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    resolve: {
        extensions: ['.ts', 'tsx', '.js'],
        modules: [ROOT, 'node_modules'],
    },
    externals: [
        {
            rxjs: 'rxjs',
            'rxjs/operators': {
                commonjs: 'rxjs/operators',
                commonjs2: 'rxjs/operators',
                root: ['rxjs', 'operators'],
            },
            '@youwol/flux-core': '@youwol/flux-core',
            '@youwol/cdn-client': '@youwol/cdn-client',
            '@youwol/flux-files': '@youwol/flux-files',
            '@youwol/flux-view': '@youwol/flux-view',
            '@youwol/fv-group': '@youwol/fv-group',
            '@youwol/fv-button': '@youwol/fv-button',
            '@youwol/fv-tree': '@youwol/fv-tree',
            '@youwol/fv-tabs': '@youwol/fv-tabs',
            '@youwol/fv-inputs': '@youwol/fv-inputs',
            js_beautify: 'js_beautify',
            lodash: '_',
        },
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{ loader: 'ts-loader' }],
                exclude: /node_modules/,
            },
        ],
    },
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, './src'),
        },
        compress: true,
        port: 9000,
    },
    /*contentBase: path.resolve(__dirname, './src'),
    historyApiFallback: true,
    inline: true,
    open: false,
    port: 4005,
    */
}
