const babelLoader = require("@yuno/babel-loader").default;
const tsLoader = require("@yuno/ts-loader").default;

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
