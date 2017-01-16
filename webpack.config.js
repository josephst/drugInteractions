const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public', 'dist'),
    publicPath: '/dist/',
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({
          loader: 'css-loader?source-map',
        }),
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015'],
        },
      },
    ],
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {},

  devServer: {
    inline: true,
    publicPath: '/dist/',
    contentBase: path.join(__dirname, 'public'),
  },

  plugins: [
    new ExtractTextPlugin({ filename: 'bundle.css', disable: false, allChunks: true }),
  ],
};
