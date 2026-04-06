import { run } from "./index";

/**
 * @param {import("../generated/api").RunInput} input
 * @returns {import("../generated/api").FunctionRunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  return run(input);
}