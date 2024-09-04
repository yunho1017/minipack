import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolvePath, localModulePath } from "./resolve";
import { loadModule } from "./loader";
import { emitError } from "./utils/error";
import { loadConfigByPath } from "./utils/config";
import { dirname } from "path";

const babylon = require("babylon");
const traverse = require("babel-traverse").default;

(async () => {
  const options = loadConfigByPath("minipack.config").options;

  let ID = 0;

  type Module = {
    id: number;
    filename: string;
    dependencies: string[];
    code: string;
    mapping: Record<string, number>;
  };

  async function createAsset(filename: string): Promise<Module> {
    const content = readFileSync(filename, "utf-8");
    const code = await loadModule(content, filename, options);
    const dependencies: string[] = [];

    traverse(
      babylon.parse(code, {
        sourceType: "module",
      }),
      {
        ImportDeclaration: ({ node }: any) => {
          dependencies.push(node.source.value);
        },
      }
    );

    const id = ID++;

    return {
      id,
      filename,
      dependencies,
      code,
      mapping: {},
    };
  }

  async function createGraph(entry: string) {
    const mainAsset = await createAsset(entry);

    const queue = [mainAsset];

    for (const asset of queue) {
      for (const relativePath of asset.dependencies) {
        const absolutePath = await resolvePath(relativePath, asset.filename);

        const child = await createAsset(absolutePath);

        asset.mapping[relativePath] = child.id;

        queue.push(child);
      }
    }

    return queue;
  }

  function bundle(graph: any[]) {
    let modules = "";

    graph.forEach((mod) => {
      modules += `${mod.id}: [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)},
    ],`;
    });

    const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];

        function localRequire(name) {
          return require(mapping[name]);
        }

        const module = { exports : {} };

        fn(localRequire, module, module.exports);

        return module.exports;
      }

      require(0);
    })({${modules}})
  `;

    return result;
  }

  const entry = options.entry ?? "";
  let entryFile = await localModulePath(entry);

  if (!entryFile) emitError("No entry");

  const graph = await createGraph(entryFile);
  const result = bundle(graph);

  mkdirSync(options.output ? dirname(options.output) : "dist");
  writeFileSync(
    options.output ? await localModulePath(options.output) : "./dist/index.js",
    result,
    "utf8"
  );
})();
