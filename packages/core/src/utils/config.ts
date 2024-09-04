import { resolve } from "path";
import { localModulePath } from "../resolve";
import { emitError } from "./error";

export type ConfigOptions = {
  entry?: string;
  output?: string;
  resolve?: {
    alias?: { [index: string]: string };
    plugins?: { [index: string]: any; apply: (arg0: any) => void }[];
  };
  module?: {
    test?: RegExp;
    exclude?: RegExp;
    loader?: (
      content: string,
      emitError: (error: string) => void
    ) => Promise<string>;
  }[];
};

export const loadConfigByPath = (configPath: string): ConfigOptions => {
  let options: ConfigOptions = {};

  try {
    const absolutePath = resolve(process.cwd(), configPath);
    options = require(absolutePath);
  } catch (error) {}

  return options;
};
