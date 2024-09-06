const babel = require("@babel/core");

exports.default = async function loader(content, emitError) {
  try {
    const config = await babel.loadPartialConfigAsync({
      filename: this.resourcePath,
    });
    const options = config.options;

    return (await babel.transformSync(content, options)).code;
  } catch (err) {
    emitError(`Error during Babel transformation ${err}`);
  }
};
