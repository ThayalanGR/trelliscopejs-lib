const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: "cheap-module-source-map",
  entry: "./src",
  output: {
    filename: 'trelliscope.js',
    path: path.join(__dirname, '../ext-libs')
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader"
      }
    },
    {
      test: /\.html$/,
      use: [{
        loader: "html-loader"
      }]
    },
    {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    },
    // Font Definitions
    {
      test: /\.svg(\?[\s\S]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 65000,
          mimetype: 'image/svg+xml',
          name: 'public/fonts/[name].[ext]'
        }
      }]
    },
    {
      test: /\.woff(\?[\s\S]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 65000,
          mimetype: 'application/font-woff',
          name: 'public/fonts/[name].[ext]'
        }
      }]
    },
    {
      test: /\.woff2(\?[\s\S]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 65000,
          mimetype: 'application/font-woff2',
          name: 'public/fonts/[name].[ext]'
        }
      }]
    },
    {
      test: /\.[ot]tf(\?[\s\S]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 65000,
          mimetype: 'application/octet-stream',
          name: 'public/fonts/[name].[ext]'
        }
      }]
    },
    {
      test: /\.eot(\?[\s\S]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 65000,
          mimetype: 'application/vnd.ms-fontobject',
          name: 'public/fonts/[name].[ext]'
        }
      }]
    }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      crossfilter: 'crossfilter2'
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],
  optimization: {
    minimize: true
  }
};