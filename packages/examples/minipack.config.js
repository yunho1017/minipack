const babelLoader = require("@yunho1017/babel-loader").default;
const tsLoader = require("@yunho1017/ts-loader").default;

module.exports = {
  entry: "./05-node-modules/index.ts",
  output: "dist",
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
