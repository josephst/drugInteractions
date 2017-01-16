const path = require('path');

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
        test: /.\css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
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
    // externals: {
    //     'react': 'React',
    //     'react-dom': 'ReactDOM',
    // },

  devServer: {
    inline: true,
    publicPath: '/dist/',
    contentBase: path.join(__dirname, 'public'),
  },
};
