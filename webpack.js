const path = require('path');

const paths = {
  src: path.resolve(__dirname, 'src'),
  build: path.resolve(__dirname, 'public', 'scripts'),
};

module.exports = {
  entry: [paths.src + '/helper/render-content-component.tsx'],
  mode: 'production',
  devtool: false,
  output: {
    environment: { module: true },
    path: paths.build,
    filename: 'render-content-component.js',
    library: { type: 'module' },
  },
  experiments: { outputModule: true },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      },
      { test: /\.nl2park$/, type: 'asset/resource' },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react', '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: { stream: require.resolve('stream-browserify') },
    modules: [paths.src, 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
};
