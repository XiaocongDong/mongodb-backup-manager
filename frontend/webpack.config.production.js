const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports= {
    entry: {
        app: path.resolve(__dirname, './src/app.js')
    },
    output: {
        filename: '[name].js',
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
                from: 'src/index.html', to: 'index.html'
            }
        ]),
        new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			}
		}),
        new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
	        compress: {
	          //supresses warnings, usually from module minification
	          warnings: false
	        }
    	}),
        new ExtractTextPlugin('style.css'),
        new webpack.DefinePlugin({
            __DEV__: JSON.stringify(JSON.parse(process.env.NODE_ENV == 'dev' || 'false'))

        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                context: '/', // <- putting this line right under "options" did the trick
                sassLoader: {
                    includePaths: [
                        path.resolve('./src'),
                    ]
                }
            }
        })
    ],
    resolve: {
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules')
        ]
    }
};