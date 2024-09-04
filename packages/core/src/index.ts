import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolvePath, localModulePath } from "./resolve";
import { loadModule } from "./loader";
import { emitError } from "./utils/error";
import { loadConfigByPath } from "./utils/config";
import { dirname } from "path";

const babylon = require("babylon");
const traverse = require("babel-traverse").default;

(async () => {
  const options = loadConfigByPath("./minipack.config");

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

    traverse(babylon.parse(code, { sourceType: "module" }), {
      CallExpression: (path: any) => {
        const callee = path.node.callee;
        if (callee.type === "Identifier" && callee.name === "require") {
          const argument = path.node.arguments[0];
          if (argument && argument.type === "StringLiteral") {
            dependencies.push(argument.value);
          }
        }
      },
    });

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
    let fileModuleIdMap = new Map([[entry, ID]]);
    const mainAsset = await createAsset(entry);

    const queue = [mainAsset];

    for (const asset of queue) {
      for (const relativePath of asset.dependencies) {
        const absolutePath = await resolvePath(relativePath, asset.filename);

        let depID = fileModuleIdMap.get(absolutePath);
        if (depID === undefined) {
          const child = await createAsset(absolutePath);
          fileModuleIdMap.set(absolutePath, child.id);
          asset.mapping[relativePath] = child.id;
          queue.push(child);
        } else {
          asset.mapping[relativePath] = depID;
        }
      }
    }

    return queue;
  }

  function bundle(graph: Module[]) {
    function* generate(modules: Module[]) {
      yield ";(function (modules) {";
      yield `
    var executedModules = {};
    (function executeModule(id) {
      if (executedModules[id]) return executedModules[id];
    
      var mod = modules[id];
      var localRequire = function (path) {
        return executeModule(mod[1][path]);
      };
      var module = { exports: {} };
      executedModules[id] = module.exports;
      mod[0](localRequire, module, module.exports);
      return module.exports;
    })(0);
    `;
      yield "})({";
      for (let mod of modules) {
        yield `${mod.id}: [`;
        yield `function (require, module, exports) {`;
        yield mod.code;
        yield "}, {";
        for (let [key, val] of Object.entries(mod.mapping)) {
          yield `${JSON.stringify(key)}: ${val},`;
        }
        yield "}";
        yield "],";
      }
      yield "})";
    }
    let result = "";
    for (let code of generate(graph)) {
      result += code + "\n";
    }
    return result;
  }

  const entry = options.entry || process.argv[2];

  let entryFile = entry
    ? await localModulePath(entry, process.cwd())
    : undefined;

  if (!entryFile) {
    emitError("No entry");
    return;
  }

  const graph = await createGraph(entryFile);
  const result = bundle(graph);

  const output = options.output || "dist";

  // 디렉토리가 존재하지 않으면 생성
  if (!existsSync(output)) {
    mkdirSync(output, { recursive: true });
  }

  // 파일 생성 및 내용 쓰기

  writeFileSync(`${output}/index.js`, result, "utf8");
})();
