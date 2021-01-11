const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env) =>  {
    const globalConfig = require('./config/config.json')[env.NODE_ENV];
    const localConfig = require('./config/config.local.json')[env.NODE_ENV];
    console.log('=========================', env.NODE_ENV)
    return {
        mode: env.NODE_ENV,
        entry: {
            main: './src/index.tsx',
            home: './src/components/pageComponents/home/home.tsx'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[hash:8].js',
            // publicPath: '/',
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    use: {
                        loader: 'babel-loader',
                        query: {compact: false},
                    },
                    exclude: /(node-modules)/
                },
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node-modules/
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(s[ac]ss)$/i,
                    use: ['style-loader', 'css-loader', 'sass-loader']
                },
                {
                    test: /\.(png|j?g|svg|gif)$/,
                    use: ['file-loader']
                }
                
            ]
        },
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                maxInitialRequests: Infinity,
                minSize: 0,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                            return `npm.${packageName.replace('@', '')}`;
                        }
                    }
                }
            },
            minimizer: [
                new TerserPlugin({
                    // Use multi-process parallel running to improve the build speed
                    // Default number of concurrent runs: os.cpus().length - 1
                    parallel: true,
                    // Enable file caching
                    cache: true,
                    sourceMap: true,
                }),
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx', '.tsx', '.json', '.css']
        },
        devServer: {
            historyApiFallback: true,
            compress: true,
            hot: true,
            port: 3000
        },
        plugins: [
            new HtmlWebPackPlugin({
                template: path.resolve(__dirname, 'src/index.html'),
                filename: 'index.html'
            }),
            new webpack.DefinePlugin({
                env_config: JSON.stringify({ ...globalConfig, ...localConfig })
            })

        ]
    }
}