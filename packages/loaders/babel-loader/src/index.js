const babel = require("@babel/core");

const options = {
  presets: ["@babel/preset-env"],
};

exports.default = async function loader(content, emitError) {
  try {
    return (await babel.transformSync(content, options)).code;
  } catch (err) {
    emitError(`Error during Babel transformation ${err}`);
  }
};
