export function emitError(msg: string): any {
  console.error(msg);
  process.exit(1);
}
