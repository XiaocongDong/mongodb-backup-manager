const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports =  {
    devtool: 'source-map',
    entry: {
        app: path.resolve(__dirname, './frontend/src/app.js')
    },
    target: 'web',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'react', 'stage-0']
                    }
                }
            },
            {
                test: /\.(scss|css)$/,
                // exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                })
            },
            {
                test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                use : {
                    loader: 'file-loader',
                    options: {
                        publicPath: '/dist/'
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: './frontend/src/index.html', to: 'index.html'
            }
        ]),
        new ExtractTextPlugin('style.css'),
        new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			}
		}),
        new webpack.DefinePlugin({
            __DEV__: JSON.stringify(JSON.parse(process.env.NODE_ENV == 'dev' || 'false'))

        })
    ],
    resolve: {
        alias: {
            actions: path.resolve(__dirname, "./frontend/src/actions"),
            api: path.resolve(__dirname, "./frontend/src/api"),
            components: path.resolve(__dirname, "./frontend/src/components"),
            constants: path.resolve(__dirname, "./frontend/src/constants"),
            containers: path.resolve(__dirname, "./frontend/src/containers"),
            error: path.resolve(__dirname, "./frontend/src/error"),
            reducers: path.resolve(__dirname, "./frontend/src/reducers"),
            static: path.resolve(__dirname, "./frontend/src/static"),
            store: path.resolve(__dirname, "./frontend/src/store"),
            utility: path.resolve(__dirname, "./frontend/src/utility")
        }    
    }
}