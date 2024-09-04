import { existsSync as exists, promises, statSync as stat } from "fs";
import { basename, dirname, extname, isAbsolute, join, resolve } from "path";
import { emitError } from "./utils/error";
let isFile = (path: string) => exists(path) && stat(path).isFile();
let isDir = (path: string) => exists(path) && stat(path).isDirectory();

async function addExtensionFromDirectory(path: string): Promise<string> {
  if (isFile(path)) {
    return path;
  }
  try {
    const dirPath = dirname(path);
    const filename = basename(path);

    const files = await promises.readdir(dirPath);
    let result = "";
    for (const file of files) {
      if (
        basename(file, extname(file)) === basename(filename, extname(filename))
      ) {
        const filePath = join(dirPath, file);
        if (isFile(filePath)) {
          result = filePath;
          break;
        }
      }
    }

    return result;
  } catch {
    emitError(`No files found in the directory, ${path}`);
    return "";
  }
}
export async function localModulePath(
  path: string,
  from?: string
): Promise<string> {
  const absPath = from ? resolve(dirname(from), path) : resolve(path);
  const tsPath = await addExtensionFromDirectory(absPath);
  if (isFile(tsPath)) {
    return tsPath;
  }

  const indexPath = await addExtensionFromDirectory(resolve(absPath, "index"));
  if (isDir(absPath) && isFile(indexPath)) {
    return indexPath;
  }

  return emitError(`Cannot find module '${path}'.`);
}

async function npmModulePath(pkg: string, from: string): Promise<string> {
  let projRoot = dirname(from);
  while (!isDir(resolve(projRoot, "node_modules"))) {
    projRoot = dirname(projRoot);
  }

  let pkgRoot = resolve(projRoot, "node_modules", pkg);

  let jsPath = pkgRoot + ".js";
  if (isFile(jsPath)) {
    return jsPath;
  }

  let packageJSONPath = resolve(pkgRoot, "package.json");
  if (isFile(packageJSONPath)) {
    let main: string =
      require(packageJSONPath).module || require(packageJSONPath).main;
    if (main) {
      return resolve(pkgRoot, main);
    }
  }

  let indexPath = await addExtensionFromDirectory(resolve(pkgRoot, "index"));
  if (isFile(indexPath)) {
    return indexPath;
  }

  return emitError(`Cannot find module '${pkg}'.`);
}

export async function resolvePath(dep: string, file: string): Promise<string> {
  let depPath: string;

  if (dep.startsWith(".")) {
    depPath = await localModulePath(dep, file);
  } else if (isAbsolute(dep)) {
    depPath = await localModulePath(dep);
  } else {
    depPath = await npmModulePath(dep, file);
  }
  return depPath;
}
