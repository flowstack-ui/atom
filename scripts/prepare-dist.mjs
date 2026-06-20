import { cp, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const distRoot = join(packageRoot, "dist");
const internalRoot = join(distRoot, "_internal");

const internalDirectories = ["hooks", "primitives", "utils"];
async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function moveInternalDirectory(name) {
  const source = join(distRoot, name);
  const destination = join(internalRoot, name);

  if (!await pathExists(source)) return;

  await rename(source, destination).catch(async (error) => {
    if (error?.code !== "EXDEV") throw error;
    await cp(source, destination, { recursive: true });
    await rm(source, { recursive: true });
  });
}

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(entryPath));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

function rewritePublicInternalImports(source) {
  return source
    .replaceAll("\"./hooks/", "\"./_internal/hooks/")
    .replaceAll("'./hooks/", "'./_internal/hooks/")
    .replaceAll("\"./primitives/", "\"./_internal/primitives/")
    .replaceAll("'./primitives/", "'./_internal/primitives/")
    .replaceAll("\"./utils/", "\"./_internal/utils/")
    .replaceAll("'./utils/", "'./_internal/utils/");
}

function rewriteMovedPrimitiveImports(source) {
  return source
    .replaceAll("\"../../collection.js\"", "\"../../../collection.js\"")
    .replaceAll("'../../collection.js'", "'../../../collection.js'");
}

await mkdir(internalRoot, { recursive: true });

for (const directory of internalDirectories) {
  await moveInternalDirectory(directory);
}

for (const file of await walkFiles(distRoot)) {
  const extension = extname(file);
  const isDeclaration = file.endsWith(".d.ts");
  const isJavaScript = extension === ".js";

  if (!isJavaScript && !isDeclaration) continue;

  const original = await readFile(file, "utf8");
  const next = file.includes(`${join("_internal", "primitives")}/`)
    ? rewriteMovedPrimitiveImports(rewritePublicInternalImports(original))
    : rewritePublicInternalImports(original);

  if (next !== original) {
    await writeFile(file, next);
  }
}
