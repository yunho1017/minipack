const ts = require("typescript");

export default function loader(content) {
  return ts.transpileModule(content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      noImplicitUseStrict: true,
      pretty: true,
    },
  }).outputText;
}
