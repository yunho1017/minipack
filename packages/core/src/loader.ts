import { ConfigOptions } from "./utils/config";
import { emitError } from "./utils/error";
export const loadModule = async (
  content: string,
  file: string,
  options: ConfigOptions
) => {
  const loaders = options.module?.filter((rule) => {
    const testMatch = rule.test ? rule.test.test(file) : false;
    const excludeMatch = rule.exclude ? rule.exclude.test(file) : false;
    return testMatch && !excludeMatch;
  });

  let loadedContent = content;
  for (const rule of loaders || []) {
    if (!rule.loader) {
      return content;
    }

    loadedContent = await rule.loader(content, emitError);
  }

  return loadedContent;
};
