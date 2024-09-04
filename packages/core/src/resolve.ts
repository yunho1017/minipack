import { existsSync as exists, promises, statSync as stat } from "fs";
import { basename, dirname, extname, isAbsolute, join, resolve } from "path";
import { emitError } from "./utils/error";
import { ConfigOptions } from "./utils/config";
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
  const absPath = from
    ? resolve(isDir(from) ? from : dirname(from), path)
    : resolve(path);
  const tsPath = await addExtensionFromDirectory(absPath);
  if (isFile(tsPath)) {
    return tsPath;
  }

  const indexPath = await addExtensionFromDirectory(resolve(absPath, "index"));
  return indexPath;
}

async function npmModulePath(pkg: string, from: string): Promise<string> {
  let projRoot = dirname(from);

  try {
    return require.resolve(pkg, { paths: [projRoot] });
  } catch (error) {
    console.error(`Cannot find module '${pkg}' from '${from}':`, error);
  }

  while (!isDir(resolve(projRoot, "node_modules"))) {
    projRoot = dirname(projRoot);
    if (projRoot === "/") break;
  }

  try {
    return require.resolve(pkg, { paths: [projRoot] });
  } catch (error) {
    console.error(
      `Cannot find module '${pkg}' from root '${projRoot}':`,
      error
    );
  }

  return emitError(`Cannot find module '${pkg}'.`);
}

export async function resolvePath(
  dep: string,
  file: string,
  options: ConfigOptions
): Promise<string> {
  let depPath: string = dep;

  for (const [key, value] of Object.entries(options.resolve?.alias || {})) {
    if (dep.startsWith(key)) {
      depPath = dep.replace(
        new RegExp(`^${key}`),
        resolve(process.cwd(), value)
      );
    }
  }

  if (depPath.startsWith(".")) {
    depPath = await localModulePath(depPath, file);
  } else if (isAbsolute(depPath)) {
    depPath = await localModulePath(depPath);
  } else {
    depPath = await npmModulePath(depPath, file);
  }
  return depPath;
}
