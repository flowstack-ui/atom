# Playground Setup

## Install

From `package/playground/`:

```bash
npm install
```

The playground is a separate private package and is not declared as an npm
workspace, so install its dependencies from this folder before using the
package-level forwarding scripts.

## Run

From `package/`:

```bash
npm run playground:dev
```

From `package/playground/`:

```bash
npm run dev
```

Use the network URL printed by Vite when testing on a phone or tablet.

## Build

From `package/`:

```bash
npm run playground:build
```

From `package/playground/`:

```bash
npm run build
```

The build runs TypeScript for the playground and then Vite production build.

## Generated Folders

Do not edit `dist/` or `node_modules/`. They are generated output and install
artifacts.
