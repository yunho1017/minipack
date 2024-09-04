const babel = require("@rollup/plugin-babel").default;
const resolve = require("@rollup/plugin-node-resolve").default;
const typescript = require("@rollup/plugin-typescript");

module.exports = [
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "cjs",
    },
    plugins: [
      typescript(),
      resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }),
      babel({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        babelHelpers: "bundled",
        rootMode: "upward",
      }),
    ],
  },
];
