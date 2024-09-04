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

export const loadConfigByPath = (
  configPath: string
): { options: ConfigOptions; path: string } => {
  let options: ConfigOptions = {};

  try {
    options = require(configPath);
  } catch (error) {}

  return { options, path: configPath };
};
