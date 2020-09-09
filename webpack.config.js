const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname) + "/dist",
    library: 'StrapiFormBuilder',
    libraryTarget: 'umd'
  },
  devServer: {
    contentBase: './'
  },
  watch: true
};