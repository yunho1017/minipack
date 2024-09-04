const babelLoader = require("@yunho1017/babel-loader").default;
const tsLoader = require("@yunho1017/ts-loader").default;

module.exports = {
  entry: "./06-resolve-alias/index.ts",
  output: "dist",
  resolve: {
    alias: { "06": "06-resolve-alias" },
  },
  module: [
    {
      test: /\.ts?$/,
      loader: tsLoader,
    },
    {
      test: /\.ts?$/,
      loader: babelLoader,
    },
  ],
};
