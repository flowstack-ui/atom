# Image Manual Test Protocol

## Step 0: Open the workbench

Open `Display > Image` with the default controls.

Verify

□ Title, Anatomy, Canvas, Source, Inspector, and Logs are available  
□ Root, Content, and Fallback appear in public anatomy order  
□ The informative image loads and the footer reports `loaded`

## Step 1: Source states

Choose each Source option in order: `Loaded`, `Broken`, then `Absent`.

Verify

□ Loaded shows the native image and `data-state="loaded"`  
□ Broken removes Content, shows the authored fallback, and reports `error`  
□ Absent shows the authored fallback and reports `idle`  
□ Logs record the matching loading-status transitions without a stale loaded result

Reset Source to `Loaded`.

## Step 2: Native image contract

Inspect Content, then open Source.

Verify

□ Content is an `img` only after the source loads  
□ Authored `alt`, `width`, `height`, `loading`, and `decoding` reach the image  
□ Source matches the controls and visible parts  
□ Selecting decorative content produces `alt=""`; restoring it restores informative alt

## Step 3: Fallback and composition

Select a broken source and inspect Fallback. Exercise each available composition option for Root, Content, and Fallback.

Verify

□ Fallback appears only for its selected non-loaded states  
□ Default, `asChild`, and `render` preserve the expected host and state metadata  
□ Root keeps `data-slot="image"`; custom slots and native test props remain inspectable

## Step 4: Responsive and accessibility check

Return to the loaded source. Test at desktop width, narrow mobile width, 200% zoom, and 400% zoom.

Verify

□ The image remains visible without page-level horizontal scrolling  
□ Informative content retains useful alt text and decorative content remains empty-alt  
□ No Image part becomes keyboard-focusable and no unexpected focus movement occurs

Record browser/device results in `component-coverage.xlsx`; do not mark rows covered without completing them.
