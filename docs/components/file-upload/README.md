# FileUpload

File input, picker trigger, dropzone, validation, selected file collection, and item actions.

## Features

- Controlled and uncontrolled file list.
- Native hidden file input.
- Picker trigger and drag-and-drop dropzone.
- Accept, max file count, max file size, and custom file validation.
- Multiple-file append or replace behavior.
- Rejected file reporting.
- Item group and item metadata parts.
- Same-file re-selection support after removing or clearing files.
- Field context integration for ID, description, required, disabled, read-only, and invalid state.

## Import

```tsx
import { FileUpload } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
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
);
```

## API Reference

### Root

Provides file state, validation, and Field integration.

| Prop | Type | Default |
| --- | --- | --- |
| `files` | `File[]` | - |
| `defaultFiles` | `File[]` | `[]` |
| `onFilesChange` | `(files: File[]) => void` | - |
| `onRejectedFilesChange` | `(files: FileUploadRejectedFile[]) => void` | - |
| `accept` | `string` | - |
| `multiple` | `boolean` | `false` |
| `appendFiles` | `boolean` | `true` when `multiple` |
| `maxFiles` | `number` | - |
| `maxSize` | `number` | - |
| `validateFile` | `(file: File) => string | null | undefined | false` | - |
| `name` | `string` | - |
| `form` | `string` | - |
| `disabled` | `boolean` | Field value or `false` |
| `required` | `boolean` | Field value or `false` |
| `readOnly` | `boolean` | Field value or `false` |
| `invalid` | `boolean` | Field value or `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"file-upload"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload"` |
| `[data-state]` | `"filled" | "empty"` |
| `[data-drag]` | `"idle" | "accept" | "reject"` |
| `[data-filled]` | Present when files are selected |
| `[data-rejected]` | Present when files were rejected |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### HiddenInput

Native `input[type="file"]` connected to Root state.

`HiddenInput` gets native file input attributes from `Root` and Field context.
That includes `id`, `name`, `form`, `accept`, `multiple`, `disabled`,
`required`, `aria-describedby`, and `aria-invalid`.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"file-upload-hidden-input"` |

### Trigger

Button-like control that opens the native file picker.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"file-upload-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-trigger"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

### Dropzone

Drop target for files.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"file-upload-dropzone"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-dropzone"` |
| `[data-drag]` | `"idle" | "accept" | "reject"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

### ItemGroup

Renders selected files. Children may be static nodes or a render function.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"file-upload-item-group"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item-group"` |
| `[data-count]` | Number of selected files |

### Item

Provides selected file context.

| Prop | Type | Default |
| --- | --- | --- |
| `file` | `File` | Required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"file-upload-item"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item"` |
| `[data-name]` | File name |
| `[data-size]` | File size in bytes |

### ItemName

Displays the current file name.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item-name"` |

### ItemSize

Displays the formatted file size.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item-size"` |

### ItemDeleteTrigger

Removes the current file.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `aria-label` | `string` | `"Remove {file.name}"` |
| `data-slot` | `string` | `"file-upload-item-delete-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"file-upload-item-delete-trigger"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

## Examples

### Single File

```tsx
<FileUpload.Root name="avatar" accept="image/*" maxFiles={1}>
  <FileUpload.HiddenInput />
  <FileUpload.Trigger>Choose image</FileUpload.Trigger>
  <FileUpload.ItemGroup>
    {(file) => (
      <FileUpload.Item key={file.name} file={file}>
        <FileUpload.ItemName />
        <FileUpload.ItemSize />
        <FileUpload.ItemDeleteTrigger>Remove</FileUpload.ItemDeleteTrigger>
      </FileUpload.Item>
    )}
  </FileUpload.ItemGroup>
</FileUpload.Root>
```

### Dropzone

```tsx
<FileUpload.Root multiple maxFiles={5}>
  <FileUpload.HiddenInput />
  <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
</FileUpload.Root>
```

## Accessibility

Use `FileUpload.HiddenInput` for native file picker semantics. The trigger and delete trigger are keyboard-accessible button-like controls.

| Key | Description |
| --- | --- |
| `Enter` | Opens the file picker from Trigger or removes a file from ItemDeleteTrigger. |
| `Space` | Opens the file picker from Trigger or removes a file from ItemDeleteTrigger. |
| `Tab` | Moves through trigger, dropzone content, file items, and delete controls normally. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
