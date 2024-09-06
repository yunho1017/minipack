const babelLoader = require("@yunho1017/babel-loader").default;
const tsLoader = require("@yunho1017/ts-loader").default;

module.exports = {
  entry: "./07-react/src/index.tsx",
  output: "dist",
  resolve: {
    alias: { "06": "06-resolve-alias" },
  },
  module: [
    {
      test: /\.(ts|tsx)?$/,
      loader: tsLoader,
    },
    {
      test: /\.(ts|tsx)?$/,
      loader: babelLoader,
    },
  ],
};
