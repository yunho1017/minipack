const ts = require("typescript");

exports.default = async function loader(content, emitError) {
  try {
    return ts.transpileModule(content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
        noImplicitUseStrict: true,
        pretty: true,
      },
    }).outputText;
  } catch (err) {
    emitError(err);
  }
};
