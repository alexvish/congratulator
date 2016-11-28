var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};

fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

nodeModules['../service.json'] = 'commonjs ../service.json';

module.exports = {
  entry: './lib/index.js',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: nodeModules,
  output: {
    path: 'lib',
    filename: 'index.bundle.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      }
    }),
    new webpack.BannerPlugin('require("source-map-support").install();',
      { raw: true, entryOnly: false })
  ],
  devtool: 'sourcemap'
};