# FileUpload

Headless native file-picker, dropzone, validation, selected-file collection,
and removal primitives.

## When to Use

Use FileUpload when users must choose local files and the interface needs a
custom picker, drop target, selected-file list, or client-side feedback. Use a
plain `input type="file"` when the browser control is sufficient. Client checks
improve feedback but are not a security boundary; validate every uploaded file
again on the server.

## Features

- Supports controlled and uncontrolled file arrays.
- Uses a hidden native file input for picker and form semantics.
- Supports button and drag-and-drop selection.
- Validates accept rules, count, size, and custom errors.
- Appends or replaces multiple-file selections.
- Exposes rejected files, drag state, item metadata, and removal actions.
- Integrates IDs, descriptions, and state with Field.

## Import

```tsx
import { FileUpload } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<FileUpload.Root>
  <FileUpload.HiddenInput />
  <FileUpload.Trigger />
  <FileUpload.Dropzone />
  <FileUpload.ItemGroup>
    <FileUpload.Item>
      <FileUpload.ItemName />
      <FileUpload.ItemSize />
      <FileUpload.ItemDeleteTrigger />
    </FileUpload.Item>
  </FileUpload.ItemGroup>
</FileUpload.Root>

fileMatchesAccept()
validateFileUploadFiles()
formatFileSize()
```

## API Reference

### Root

Renders a `div`, owns selection and validation state, and supplies behavior to
all parts. Local field-state props override Field context.
An uncancelled native form reset restores uncontrolled `defaultFiles`, clears
rejections and drag state, and resets the native file picker.

| Prop | Type | Default |
| --- | --- | --- |
| `files` | `File[]` | - |
| `defaultFiles` | `File[]` | `[]` |
| `onFilesChange` | `(files: File[]) => void` | - |
| `onRejectedFilesChange` | `(files: FileUploadRejectedFile[]) => void` | - |
| `accept` | `string` | - |
| `multiple` | `boolean` | `false` |
| `appendFiles` | `boolean` | `true` when multiple |
| `maxFiles` | `number` | `1` when single; otherwise - |
| `maxSize` | `number` | - |
| `validateFile` | `(file) => string \| null \| undefined \| false` | - |
| `name` | `string` | - |
| `form` | `string` | - |
| `disabled` | `boolean` | Field state or `false` |
| `required` | `boolean` | Field state or `false` |
| `readOnly` | `boolean` | Field state or `false` |
| `invalid` | `boolean` | Field state or `false` |
| `validationBehavior` | `"inline" \| "native"` | Field/Form value or `"native"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload"` |
| `[data-state]` | `"filled" \| "empty"` |
| `[data-drag]` | `"idle" \| "accept" \| "reject"` |
| `[data-filled]` | Present with selected files |
| `[data-rejected]` | Present with rejected files |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### HiddenInput

Renders the transparent native `input type="file"`, opens through Trigger, and
sends selected `FileList` values into Root validation. It is aligned with
Trigger so native required feedback points to the visible control and redirects
validation focus there. Accepted drag/drop files are synchronized back to the
native input when the browser permits `FileList` assignment.

| Prop | Type | Default |
| --- | --- | --- |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | - |

| ARIA/native attribute | Values |
| --- | --- |
| `id` | Field control ID or generated Root control ID |
| `name`, `form`, `accept`, `multiple` | Root values |
| `disabled`, `required` | Resolved Root/Field state |
| `aria-describedby` | Explicit Root value or Field message IDs |
| `aria-invalid` | Resolved invalid state |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-hidden-input"` |

### Trigger

Opens HiddenInput's native file picker. It renders a button by default and adds
button semantics to non-native custom elements.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for non-native custom elements |
| `aria-disabled` | `"true"` when a custom trigger is disabled or read-only |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-trigger"` |
| `[data-disabled]` | Present when Root is disabled |
| `[data-readonly]` | Present when Root is read-only |

### Dropzone

Renders a `div` that accepts dropped files. It owns drag events but adds no
button role or tab stop; include Trigger when keyboard picker access is needed.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-dropzone"` |
| `[data-drag]` | `"idle" \| "accept" \| "reject"` |
| `[data-dragging]` | Present for accept/reject drag state |
| `[data-accepted]` | Present for accepted drag state |
| `[data-rejected]` | Present for rejected drag state |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

### ItemGroup

Renders a `ul` for selected files. A function child receives each `(file,
index)`; function children cannot be combined with `asChild`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode \| ((file, index) => ReactNode)` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item-group"` |
| `[data-count]` | Selected file count |
| `[data-filled]` | Present when count is greater than zero |

### Item

Renders one `li` and provides its resolved File and index to metadata/removal
parts. It returns `null` when neither `file` nor the requested Root index exists.

| Prop | Type | Default |
| --- | --- | --- |
| `file` | `File` | Root file at `index` |
| `index` | `number` | `0` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item"` |
| `[data-index]` | Resolved file index |
| `[data-name]` | File name |
| `[data-size]` | File size in bytes |

### ItemName

Renders a `span` containing the File name by default. Consumer children replace
that text; `asChild` and `render` are supported.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | Current file name |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item-name"` |

### ItemSize

Renders a `span` containing `formatFileSize(file.size)` by default. Consumer
children replace the formatted text; `asChild` and `render` are supported.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | Formatted current file size |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item-size"` |
| `[data-size]` | File size in bytes |

### ItemDeleteTrigger

Renders a button that removes the current Item, resets the native input so the
same file can be chosen again, and respects disabled/read-only state.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Consumer value or `"Remove {file.name}"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item-delete-trigger"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

### fileMatchesAccept

Returns whether a File matches a comma-separated extension, exact MIME type,
or wildcard MIME rule. No rule or an empty rule accepts the file.

### validateFileUploadFiles

Returns `{ acceptedFiles, rejectedFiles }`. Rejection errors contain `"type"`,
`"size"`, `"count"`, and any nonempty custom validation string.

### formatFileSize

Formats bytes with binary-sized B, KB, MB, GB, or TB units and returns `"0 B"`
for non-finite or nonpositive input.

The entry also exports `useFileUploadContext` and `useFileUploadItemContext` for
advanced custom parts; both require their corresponding parent.

## Examples

### Multiple Documents

```tsx
import { FileUpload } from "@flowstack-ui/atom";

export function DocumentUpload() {
  return (
    <FileUpload.Root name="documents" accept=".pdf,.txt" multiple maxFiles={5}>
      <FileUpload.HiddenInput />
      <FileUpload.Trigger>Choose documents</FileUpload.Trigger>
      <FileUpload.Dropzone>Drop PDF or text files here</FileUpload.Dropzone>
      <FileUpload.ItemGroup>
        {(file, index) => (
          <FileUpload.Item key={`${file.name}-${index}`} file={file}>
            <FileUpload.ItemName />
            <FileUpload.ItemSize />
            <FileUpload.ItemDeleteTrigger>Remove</FileUpload.ItemDeleteTrigger>
          </FileUpload.Item>
        )}
      </FileUpload.ItemGroup>
    </FileUpload.Root>
  );
}
```

### Report Rejections

```tsx
import { useState } from "react";
import { FileUpload, type FileUploadRejectedFile } from "@flowstack-ui/atom";

export function ImageUpload() {
  const [rejected, setRejected] = useState<FileUploadRejectedFile[]>([]);
  return (
    <FileUpload.Root
      accept="image/*"
      maxSize={2 * 1024 * 1024}
      onRejectedFilesChange={setRejected}
    >
      <FileUpload.HiddenInput />
      <FileUpload.Trigger>Choose image</FileUpload.Trigger>
      <p aria-live="polite">
        {rejected.length > 0 ? "The selected image was not accepted." : ""}
      </p>
    </FileUpload.Root>
  );
}
```

## Accessibility

HiddenInput remains an aligned native file control and owns its constraints.
A validation attempt is mirrored to Root, Trigger, and Field. Inline behavior
suppresses the browser bubble; native behavior keeps it at Trigger's bounds.

HiddenInput supplies native file-input semantics and must be present for
Trigger to open a picker. Give the upload a visible Field.Label or another
accessible name. Trigger and ItemDeleteTrigger use button keyboard behavior;
Dropzone alone is pointer-only. Announce rejection feedback in visible text and
validate file type, size, and content again on the server.

| Key | Description |
| --- | --- |
| `Enter` / `Space` | Opens the picker from Trigger or removes from ItemDeleteTrigger. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
