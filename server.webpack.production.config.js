const path = require('path');
const webpack = require('webpack');
const fs = require('fs');


const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});

module.exports = {
    entry: {
        app: path.resolve(__dirname, './server/app.js')
    },
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist'),
        library: "mongodb-backup-manager-server",
        libraryTarget: "commonjs-module"
    },
    externals: nodeModules,
    target: "node",
    node: {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015']
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			}
		}),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
            warnings: false
            }
		})
    ],
    resolve: {
        alias: {
            modules: path.resolve(__dirname, "./server/modules/")
        }
    }
}
