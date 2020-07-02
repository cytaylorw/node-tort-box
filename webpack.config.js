const path = require("path");
const nodeExternals = require('webpack-node-externals');

const distPath = path.resolve(__dirname, "dist");

module.exports = {
  entry: { 
      index: path.resolve(__dirname, "index.js") 
    },
  output: {
    path: distPath
  },
  module: {
    rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
  },
  target: 'node',
  externals: [nodeExternals()]
};