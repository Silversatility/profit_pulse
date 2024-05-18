const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

/**
 * webpack --env.NODE_ENV=local|development|production
 */
module.exports = (env) => {
  return {
    entry: ['babel-polyfill', './index.js'],
    output: {
      path: path.join(__dirname, '../../dist/customer/'),
      filename: 'app.[chunkhash].js',
      publicPath: '../../dist/customer/',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: 'index.html'
      }),
    ],
    // support source maps
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /tinymce[\\/]skins[\\/]/,
          loader: 'file-loader?name=[path][name].[ext]&context=node_modules/tinymce'
        },
        { test: /\.html$/, exclude: /node_modules|bower_components/, use: ['html-loader'] },
        {
          test: /\.js$/, exclude: /node_modules|bower_components/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
              plugins: []
            }
          }
        },
        { test: /\.css$/, exclude: /node_modules|bower_components/, use: ['style-loader', 'css-loader'] },
        { test: /\.scss$/, exclude: /node_modules|bower_components/, use: ['style-loader', 'css-loader', 'sass-loader'] },
        // // load images (inline base64 URLs for <=30k images)
        { test: /\.(png|svg|jpg|gif)$/, exclude: /node_modules|bower_components/, use: ['url-loader?limit=30720'] }
      ]
    }
  };
};
