/**
 * @fileoverview Webpack core config
 *
 * @license Copyright 2020 The Coding with Chrome Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */

import CopyPlugin from 'copy-webpack-plugin';
import ExcludeAssetsPlugin from 'webpack-exclude-assets-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ImageminPlugin from 'imagemin-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import ServiceWorkerWebpackPlugin from 'serviceworker-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

import path from 'path';
import webpack from 'webpack';

module.exports = (mode = 'development') => ({
  mode: mode,
  entry: {
    boot: ['./src/boot.js', './assets/css/boot.css']
  },
  output: {
    path: path.resolve('./dist'),
    publicPath: '/',
    filename: '[name].[contenthash].js'
  },
  optimization: {
    minimize: mode != 'development',
    minimizer: [new TerserPlugin({}), new OptimizeCssAssetsPlugin({})],
    moduleIds: 'hashed',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + '/';
              }
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.scss$/i,
        loaders: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      moduleFilename: ({ name }) => `${name.replace('/js/', '/css/')}.css`
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false
    }),
    new ExcludeAssetsPlugin({
      path: ['boot.css']
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./../package.json').version)
    }),
    new WebpackPwaManifest({
      name: 'Coding with Chrome Suite',
      short_name: 'Coding with Chrome',
      description: 'Educational Coding Development Environment',
      start_url: 'index.html',
      display: 'standalone',
      background_color: '#fff',
      theme_color: 'red',
      icons: [
        {
          src: path.resolve('assets/svg/logo.svg'),
          sizes: [96, 128, 256, 384]
        },
        {
          src: path.resolve('assets/icons/1024x1024.png'),
          sizes: [192, 512]
        }
      ]
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, '../src/service-worker/service-worker.js'),
      filename: 'service-worker.js'
    }),
    new CopyPlugin([
      {
        from: path.resolve('./assets/svg'),
        to: path.resolve('./dist/assets/svg')
      }
    ]),
    new FaviconsWebpackPlugin({
      logo: path.resolve('assets/svg/logo.svg'),
      outputPath: 'assets/favicons',
      inject: false
    }),
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      pngquant: {
        quality: '95-100'
      }
    })
  ]
});
