export function relativePathFromFilePath(path: string | undefined) {
  if (!path) return;

  let file: string | undefined = path.replaceAll(`\\`, `/`);
  if (!file) return;

  if (file.includes("src-tauri")) {
    file = file.split("src-tauri").pop();
    if (!file) return;
  }

  // Only relative paths work.
  // HACK: assume all tauri apps use `src/**/*.rs`
  if (file.startsWith("/src/")) {
    return `.${file}`;
  }
  if (file.startsWith("src/")) {
    return `./${file}`;
  }
  if (file.startsWith("./src/")) {
    return file;
  }
}
