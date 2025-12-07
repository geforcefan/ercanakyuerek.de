const path = require("path");

const paths = {
  src: path.resolve(__dirname, "scripts/src"),
  build: path.resolve(__dirname, "static"),
};

module.exports = {
  entry: [paths.src + "/module-exports.ts"],
  mode: "production",
  devtool: false,
  output: {
    environment: { module: true },
    path: paths.build,
    filename: "scripts.js",
    library: { type: "module" },
  },
  experiments: { outputModule: true },
  module: {
    rules: [
      { test: /\.wasm$/, loader: "arraybuffer-loader" },
      { test: /\.nl2park$/, loader: "arraybuffer-loader" },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/react",
              "@babel/preset-typescript"
            ]
          },
        },
      },
    ],
  },
  resolve: {
    fallback: { stream: require.resolve("stream-browserify") },
    modules: [paths.src, "node_modules"],
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
};
