const ts = require("typescript");
const fs = require("fs");
const path = require("path");

function findConfigFile(requestDirPath, configFile) {
  if (path.isAbsolute(configFile)) {
    return fs.existsSync(configFile) ? configFile : undefined;
  }

  if (/^\.\.?(\/|\\)/.test(configFile)) {
    const resolvedPath = path.resolve(requestDirPath, configFile);
    return fs.existsSync(resolvedPath) ? resolvedPath : undefined;
  }

  while (true) {
    const fileName = path.join(requestDirPath, configFile);
    if (fs.existsSync(fileName)) {
      return fileName;
    }
    const parentPath = path.dirname(requestDirPath);
    if (parentPath === requestDirPath) {
      break;
    }
    requestDirPath = parentPath;
  }

  return undefined;
}

function readConfigFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading config file at ${filePath}:`, error);
    return undefined;
  }
}

function getConfigFileOptions(requestDirPath, configFile) {
  const configFilePath = findConfigFile(requestDirPath, configFile);
  if (configFilePath) {
    const configFileContent = readConfigFile(configFilePath);
    return configFileContent ? configFileContent.compilerOptions : {};
  }
  return {};
}

exports.default = async function loader(content, emitError) {
  try {
    return ts.transpileModule(content, {
      compilerOptions: getConfigFileOptions(process.cwd(), "tsconfig.json"),
    }).outputText;
  } catch (err) {
    emitError(err);
  }
};
