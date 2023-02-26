const path = require("path");

const paths = {
  src: path.resolve(__dirname, "scripts"),

  // Production build files
  build: path.resolve(__dirname, "static"),
};

module.exports = {
  entry: [paths.src + "/entry.js"],
  mode: "production",
  devtool: false,
  output: {
    environment: {
      module: true,
    },
    path: paths.build,
    filename: "scripts.js",
    library: {
      type: "module",
    },
  },
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        loader: "arraybuffer-loader",
      },
      {
        test: /\.nl2park$/,
        loader: "arraybuffer-loader",
      },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/react"],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    fallback: { stream: require.resolve("stream-browserify") },
    modules: [paths.src, "node_modules"],
    extensions: [".js", ".jsx"]
  },
};
