const sass = require('sass');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /(jSass)\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
              implementation: sass
            }
          }
        ]
      },
      {
        test: /(jSass)\.scss$/,
        loader: 'sass-extract-loader',
        options: {
          plugins: [
            require('../../src/jSass-extract')
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html',
    })
  ],
  devServer: {
    hot: true,
    contentBase: './'
  }
};
