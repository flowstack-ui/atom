import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Field,
  FileUpload,
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadItem,
  FileUploadItemDeleteTrigger,
  FileUploadItemGroup,
  FileUploadItemName,
  FileUploadItemSize,
  FileUploadRoot,
  FileUploadTrigger,
  useControllableState,
  fileMatchesAccept,
  formatFileSize,
  validateFileUploadFiles,
} from "../../dist/index.js";

test("FileUpload renders native file input, Field state, and file item parts", () => {
  const avatar = new File(["hello"], "avatar.png", { type: "image/png" });
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      {
        id: "avatar",
        invalid: true,
        required: true,
        readOnly: true,
        disabled: true,
      },
      React.createElement(
        FileUpload.Root,
        {
          name: "avatar",
          form: "profile-form",
          accept: "image/*",
          multiple: true,
          defaultFiles: [avatar],
          maxFiles: 1,
          maxSize: 5000,
          title: "Avatar upload",
          "aria-describedby": "avatar-help avatar-error",
          "data-testid": "avatar-upload",
        },
        React.createElement(FileUpload.HiddenInput),
        React.createElement(FileUpload.Trigger, null, "Choose file"),
        React.createElement(FileUpload.Dropzone, null, "Drop file"),
        React.createElement(
          FileUpload.ItemGroup,
          null,
          React.createElement(
            FileUpload.Item,
            { file: avatar },
            React.createElement(FileUpload.ItemName),
            React.createElement(FileUpload.ItemSize),
            React.createElement(FileUpload.ItemDeleteTrigger, null, "Remove"),
          ),
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="file-upload"/);
  assert.match(html, /title="Avatar upload"/);
  assert.match(html, /data-testid="avatar-upload"/);
  assert.match(html, /data-state="filled"/);
  assert.match(html, /data-filled=""/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-required=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /<input/);
  assert.match(html, /type="file"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /opacity:0/);
  assert.doesNotMatch(html, / hidden=""/);
  assert.match(html, /id="avatar-control"/);
  assert.match(html, /name="avatar"/);
  assert.match(html, /form="profile-form"/);
  assert.match(html, /accept="image\/\*"/);
  assert.match(html, /multiple=""/);
  assert.match(html, /disabled=""/);
  assert.match(html, /required=""/);
  assert.match(html, /aria-invalid="true"/);
  assert.doesNotMatch(html, /aria-required="true"/);
  assert.match(html, /aria-describedby="avatar-help avatar-error"/);
  assert.match(html, /data-slot="file-upload-hidden-input"/);
  assert.match(html, /data-slot="file-upload-trigger"/);
  assert.match(html, /data-slot="file-upload-dropzone"/);
  assert.match(html, /data-slot="file-upload-item-group"/);
  assert.match(html, /data-count="1"/);
  assert.match(html, /data-slot="file-upload-item"/);
  assert.match(html, /data-name="avatar.png"/);
  assert.match(html, /data-size="5"/);
  assert.match(html, /data-slot="file-upload-item-name"/);
  assert.match(html, />avatar\.png<\/span>/);
  assert.match(html, /data-slot="file-upload-item-size"/);
  assert.match(html, />5 B<\/span>/);
  assert.match(html, /aria-label="Remove avatar.png"/);
  assert.equal(FileUpload.Root, FileUploadRoot);
  assert.equal(FileUpload.HiddenInput, FileUploadHiddenInput);
  assert.equal(FileUpload.Trigger, FileUploadTrigger);
  assert.equal(FileUpload.Dropzone, FileUploadDropzone);
  assert.equal(FileUpload.ItemGroup, FileUploadItemGroup);
  assert.equal(FileUpload.Item, FileUploadItem);
  assert.equal(FileUpload.ItemName, FileUploadItemName);
  assert.equal(FileUpload.ItemSize, FileUploadItemSize);
  assert.equal(FileUpload.ItemDeleteTrigger, FileUploadItemDeleteTrigger);
});

test("FileUpload read-only parts expose read-only state without disabled data", () => {
  const file = new File(["hello"], "notes.txt", { type: "text/plain" });
  const html = renderToStaticMarkup(
    React.createElement(
      FileUpload.Root,
      {
        readOnly: true,
        defaultFiles: [file],
      },
      React.createElement(FileUpload.Trigger, null, "Choose file"),
      React.createElement(FileUpload.Dropzone, null, "Drop file"),
      React.createElement(
        FileUpload.ItemGroup,
        null,
        React.createElement(
          FileUpload.Item,
          { file },
          React.createElement(FileUpload.ItemDeleteTrigger, null, "Remove"),
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="file-upload-trigger"[^>]*data-readonly=""/);
  assert.match(html, /data-slot="file-upload-dropzone"[^>]*data-readonly=""/);
  assert.match(html, /data-slot="file-upload-item-delete-trigger"[^>]*data-readonly=""/);
  assert.doesNotMatch(html, /data-slot="file-upload-trigger"[^>]*data-disabled=""/);
  assert.doesNotMatch(html, /data-slot="file-upload-dropzone"[^>]*data-disabled=""/);
  assert.doesNotMatch(html, /data-slot="file-upload-item-delete-trigger"[^>]*data-disabled=""/);
});

test("FileUpload helpers validate accept, max size, max files, and custom errors", () => {
  const png = new File(["x"], "photo.PNG", { type: "image/png" });
  const text = new File(["hello"], "notes.txt", { type: "text/plain" });

  assert.equal(fileMatchesAccept(png, "image/*"), true);
  assert.equal(fileMatchesAccept(png, ".png"), true);
  assert.equal(fileMatchesAccept(text, "image/*"), false);
  assert.equal(formatFileSize(1536), "1.5 KB");

  const validation = validateFileUploadFiles([png, text], {
    accept: "image/*",
    maxFiles: 1,
    maxSize: 2,
    validateFile: (file) => file.name === "photo.PNG" ? undefined : "Custom error",
  });

  assert.deepEqual(validation.acceptedFiles, [png]);
  assert.equal(validation.rejectedFiles.length, 1);
  assert.equal(validation.rejectedFiles[0].file, text);
  assert.deepEqual(validation.rejectedFiles[0].errors, ["type", "size", "Custom error", "count"]);
});

test("FileUploadItem asChild merges props without nesting the child element", () => {
  const avatar = new File(["hello"], "avatar.png", { type: "image/png" });
  const html = renderToStaticMarkup(
    React.createElement(
      FileUpload.Root,
      { defaultFiles: [avatar] },
      React.createElement(
        FileUpload.Item,
        { asChild: true, file: avatar },
        React.createElement(
          "li",
          { className: "custom-item" },
          React.createElement("span", null, "Custom file row"),
        ),
      ),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /<li class="custom-item" data-slot="file-upload-item"/);
  assert.match(html, /<span>Custom file row<\/span>/);
  assert.doesNotMatch(html, /<li[^>]*><li/);
});

test("FileUploadTrigger asChild preserves native button semantics without redundant role", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      FileUpload.Root,
      null,
      React.createElement(
        FileUpload.Trigger,
        { asChild: true },
        React.createElement("button", null, "Choose file"),
      ),
    ),
  );

  assert.match(html, /<button/);
  assert.match(html, /type="button"/);
  assert.doesNotMatch(html, /role="button"/);
  assert.match(html, /data-slot="file-upload-trigger"/);
  assert.match(html, />Choose file<\/button>/);
});

test("FileUploadTrigger asChild adds button semantics to custom elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      FileUpload.Root,
      null,
      React.createElement(
        FileUpload.Trigger,
        { asChild: true },
        React.createElement("span", null, "Choose file"),
      ),
    ),
  );

  assert.match(html, /<span/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-slot="file-upload-trigger"/);
  assert.match(html, />Choose file<\/span>/);
});

test("FileUploadItemGroup rejects asChild with function children", () => {
  const avatar = new File(["hello"], "avatar.png", { type: "image/png" });

  assert.throws(
    () => renderToStaticMarkup(
      React.createElement(
        FileUpload.Root,
        { defaultFiles: [avatar] },
        React.createElement(
          FileUpload.ItemGroup,
          { asChild: true },
          () => React.createElement("li", null, "Avatar"),
        ),
      ),
    ),
    /FileUpload\.ItemGroup cannot use asChild with function children/,
  );
});

test("FileUpload source wires controlled state, clear refocus, and keyboard trigger behavior", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/file-upload/FileUploadRoot.tsx", packageRoot),
    "utf8",
  );
  const hiddenInputSource = await readFile(
    new URL("src/primitives/file-upload/FileUploadHiddenInput.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/file-upload/FileUploadTrigger.tsx", packageRoot),
    "utf8",
  );
  const deleteTriggerSource = await readFile(
    new URL("src/primitives/file-upload/FileUploadItemDeleteTrigger.tsx", packageRoot),
    "utf8",
  );
  const dropzoneSource = await readFile(
    new URL("src/primitives/file-upload/FileUploadDropzone.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useControllableState<File\[]>/);
  assert.match(rootSource, /appendFiles\?/);
  assert.match(rootSource, /shouldAppendFiles \? \[\.\.\.resolvedFiles, \.\.\.incomingFiles\] : incomingFiles/);
  assert.match(rootSource, /fieldCtx\?\.controlId/);
  assert.match(rootSource, /fieldCtx\?\.describedBy/);
  assert.match(rootSource, /validateFileUploadFiles/);
  assert.match(rootSource, /const resetNativeInput = useCallback/);
  assert.match(rootSource, /inputRef\.current\.value = ""/);
  assert.match(rootSource, /setResolvedFiles\(resolvedFiles\.filter\(\(currentFile\) => currentFile !== file\)\);\s*resetNativeInput\(\);/);
  assert.match(hiddenInputSource, /files && files\.length > 0/);
  assert.match(hiddenInputSource, /ctx\.setFilesFromList\(files\)/);
  assert.match(hiddenInputSource, /const composedRef = useCallback\(/);
  assert.match(hiddenInputSource, /composeRefs\(ctx\.inputRef, ref\)\(node\)/);
  assert.doesNotMatch(hiddenInputSource, /aria-required=/);
  assert.doesNotMatch(triggerSource, /composeEventHandlers\(onClick, handleClick\)/);
  assert.match(triggerSource, /if \(isInactive\) \{\s*event\.preventDefault\(\);/);
  assert.match(triggerSource, /onClick\?\.\(event\);\s*if \(event\.defaultPrevented\) return;\s*openFilePicker\(\);/);
  assert.match(triggerSource, /event\.key !== " " && event\.key !== "Enter"/);
  assert.match(triggerSource, /openFilePicker\(\)/);
  assert.doesNotMatch(deleteTriggerSource, /composeEventHandlers\(onClick, handleClick\)/);
  assert.match(deleteTriggerSource, /if \(isInactive\) \{\s*event\.preventDefault\(\);/);
  assert.match(deleteTriggerSource, /onClick\?\.\(event\);\s*if \(event\.defaultPrevented\) return;\s*removeFile\(file\);/);
  assert.match(deleteTriggerSource, /removeFile\(file\)/);
  assert.match(dropzoneSource, /const handleDragLeave = useCallback/);
  assert.match(dropzoneSource, /if \(isInactive\) return;\s*if \(event\.currentTarget\.contains/);
  assert.match(dropzoneSource, /\[isInactive, setDragState\]/);
});
