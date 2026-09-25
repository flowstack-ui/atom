/** Read every directory batch: browsers may return only 100 entries per read. */
export async function getDroppedFiles(data: DataTransfer, directory: boolean): Promise<File[]> {
  const items = Array.from(data.items ?? []);
  if (!directory || !items.some((item) => item.webkitGetAsEntry?.())) return Array.from(data.files);
  async function visit(entry: FileSystemEntry): Promise<File[]> {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject));
      Object.defineProperty(file, "webkitRelativePath", { value: entry.fullPath.replace(/^\//, ""), configurable: true });
      return [file];
    }
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const files: File[] = [];
    for (;;) {
      const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
      if (!entries.length) return files;
      files.push(...(await Promise.all(entries.map(visit))).flat());
    }
  }
  return (await Promise.all(items.filter((item) => item.kind === "file").map((item) => {
    const entry = item.webkitGetAsEntry?.();
    const file = item.getAsFile();
    return entry ? visit(entry) : Promise.resolve(file ? [file] : []);
  }))).flat();
}
