const path = require('path');
const EnvironmentPlugin = require('webpack').EnvironmentPlugin;
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
      {enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'},
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.(svg|png)$/i,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }
      }
    ]
  },

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    overlay: true
  },

  plugins: [
    new HTMLWebpackPlugin({
      title: 'Filecoin Network Stats',
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
      template: 'src/index.html'
    }),
    new CopyWebpackPlugin([{
      from: path.join(__dirname, 'src', 'assets'),
      to: 'assets'
    }]),
    new EnvironmentPlugin(['BACKEND_URL'])
  ]
};

if (process.env.NODE_ENV === 'production') {
  module.exports.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true
      })
    ]
  };
}