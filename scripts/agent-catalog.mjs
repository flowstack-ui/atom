import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import ts from "typescript";

async function exists(path) {
  return stat(path).then(() => true, () => false);
}

async function directories(path) {
  return (await readdir(path, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function sourceForSubpath(packageRoot, subpath) {
  if (subpath === ".") return join(packageRoot, "src", "index.ts");
  if (!subpath.startsWith("./") || subpath.includes("*")) return null;
  return join(packageRoot, "src", `${subpath.slice(2)}.ts`);
}

function moduleExports(checker, sourceFile) {
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return [];
  return checker.getExportsOfModule(moduleSymbol).map((symbol) => {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    return {
      name: symbol.getName(),
      value: Boolean(target.flags & ts.SymbolFlags.Value),
    };
  }).filter(({ name }) => name !== "default").sort((a, b) => a.name.localeCompare(b.name));
}

function displayName(id) {
  return id.split("-").map((part) => part === "otp" ? "OTP" : `${part[0].toUpperCase()}${part.slice(1)}`).join(" ");
}

function symbolPrefix(id) {
  return id.split("-").map((part) => part === "otp" ? "OTP" : `${part[0].toUpperCase()}${part.slice(1)}`).join("");
}

function mentionsPublicName(prose, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`).exec(prose);
  if (!match) return false;
  const following = prose.slice(match.index + match[0].length - match[2].length);
  return !/^\s+by\b/u.test(following);
}

function failure(code, message, surface, id) {
  return { code, message, ...(surface ? { surface } : {}), ...(id ? { id } : {}) };
}

export async function buildAgentCoverage({ packageRoot, manifest, componentRecords, guideRecords }) {
  const packageJsonPath = join(packageRoot, "package.json");
  const catalogPath = join(packageRoot, "agents", "catalog.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  if (catalog.schema !== "flowstack.agent-catalog.v1") throw new Error("agents/catalog.json has the wrong schema");
  if (catalog.package !== packageJson.name || catalog.layer !== "atom") throw new Error("agents/catalog.json package or layer does not match package.json");

  const primitiveRoot = join(packageRoot, "src", "primitives");
  const discoveredPrimitiveIds = await directories(primitiveRoot);
  const exportEntries = Object.keys(packageJson.exports).sort();
  const componentIds = discoveredPrimitiveIds.filter((id) => exportEntries.includes(`./${id}`));
  const componentIdSet = new Set(componentIds);
  const expectedGuideIds = catalog.packageGuideIds ?? [];
  const expectedGuideIdSet = new Set(expectedGuideIds);
  const discoveredGuideIds = guideRecords.map(({ data }) => data.id);
  const guideIdSet = new Set(discoveredGuideIds);
  const manifestComponentIds = new Set(manifest.components.map(({ id }) => id));
  const manifestGuideIds = new Set(manifest.guides.map(({ id }) => id));
  const classifications = new Map();
  const failures = [];

  if (!Array.isArray(catalog.packageGuideIds) || expectedGuideIds.length === 0 || expectedGuideIdSet.size !== expectedGuideIds.length) {
    failures.push(failure("invalid-package-guide-catalog", "packageGuideIds must be a non-empty unique list of canonical package-guide IDs.", "agents/catalog.json"));
  }
  for (const { data } of componentRecords) {
    if (!componentIdSet.has(data.id)) {
      failures.push(failure("non-public-agent-owner", `Component Agent Knowledge source ${data.id} does not map to a public component owner.`, `src/primitives/${data.id}/agent.json`, data.id));
    }
  }
  for (const id of discoveredGuideIds) {
    if (!expectedGuideIdSet.has(id)) {
      failures.push(failure("stale-agent-source", `Package-guide source ${id} is not in the canonical packageGuideIds catalog.`, `agents/guides/${id}/agent.json`, id));
    }
  }
  for (const id of expectedGuideIds) {
    if (!guideIdSet.has(id)) {
      failures.push(failure("missing-agent-source", `Canonical package guide ${id} has no source Agent Knowledge pair.`, `agents/guides/${id}/agent.json`, id));
    }
  }

  for (const item of catalog.classifications ?? []) {
    if (!item.surface || !item.classification || !item.reason) {
      failures.push(failure("invalid-classification", "Catalog classifications require surface, classification, and reason.", item.surface));
      continue;
    }
    if (classifications.has(item.surface)) {
      failures.push(failure("duplicate-classification", "Surface has more than one explicit classification.", item.surface));
    }
    if (!["component", "compound-part", "alias", "utility", "metadata"].includes(item.classification)) {
      failures.push(failure("invalid-classification-kind", `Unsupported classification ${item.classification}.`, item.surface));
    }
    if (["utility", "metadata"].includes(item.classification)) {
      const documentationPath = item.documentation?.split("#")[0];
      if (!documentationPath || !await exists(join(packageRoot, documentationPath))) {
        failures.push(failure("missing-classification-documentation", "Utility and metadata classifications require an existing public documentation owner.", item.surface));
      }
    }
    classifications.set(item.surface, item);
  }

  const sourceFiles = exportEntries.map((subpath) => sourceForSubpath(packageRoot, subpath)).filter(Boolean);
  const missingSourceFiles = [];
  for (const file of sourceFiles) if (!await exists(file)) missingSourceFiles.push(file);
  const program = ts.createProgram(sourceFiles.filter((file) => !missingSourceFiles.includes(file)), {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
    skipLibCheck: true,
  });
  const checker = program.getTypeChecker();
  const symbolsBySubpath = new Map();
  for (const subpath of exportEntries) {
    const file = sourceForSubpath(packageRoot, subpath);
    const sourceFile = file ? program.getSourceFile(file) : null;
    if (sourceFile) symbolsBySubpath.set(subpath, moduleExports(checker, sourceFile));
  }

  const surfaces = [];
  for (const subpath of exportEntries) {
    let classification;
    let ownerId;
    let documentation;
    let reason;
    if (subpath === ".") {
      classification = "aggregate";
      documentation = "docs/guides/public-api.md";
      reason = "The root export aggregates the classified public API and does not create a second component owner.";
    } else if (componentIdSet.has(subpath.slice(2))) {
      classification = "component";
      ownerId = subpath.slice(2);
      documentation = `docs/components/${ownerId}/README.md`;
      reason = "Public component subpath matches its documented primitive owner.";
    } else if (classifications.has(subpath)) {
      ({ classification, ownerId, documentation, reason } = classifications.get(subpath));
    } else {
      classification = "unclassified";
      reason = "No derived component owner or explicit catalog classification exists.";
      failures.push(failure("unclassified-public-surface", reason, subpath));
    }
    surfaces.push({ surface: subpath, classification, ...(ownerId ? { ownerId } : {}), ...(documentation ? { documentation } : {}), reason, status: classification === "unclassified" ? "unclassified" : "covered" });

    for (const symbol of symbolsBySubpath.get(subpath) ?? []) {
      const surface = `${subpath}#${symbol.name}`;
      if (subpath === ".") continue;
      if (classification === "component") {
        surfaces.push({ surface, classification: "compound-part", ownerId, value: symbol.value, reason: `Named export belongs to the ${ownerId} component family.`, status: "covered" });
      } else if (classification === "utility") {
        surfaces.push({ surface, classification: "utility", documentation, value: symbol.value, reason, status: "covered" });
      }
    }
  }

  const nonRootBySymbol = new Map();
  for (const surface of surfaces) {
    if (!surface.surface.includes("#") || surface.surface.startsWith(".#")) continue;
    const symbol = surface.surface.split("#")[1];
    const candidates = nonRootBySymbol.get(symbol) ?? [];
    candidates.push(surface);
    nonRootBySymbol.set(symbol, candidates);
  }
  for (const symbol of symbolsBySubpath.get(".") ?? []) {
    const rootSurface = `.#${symbol.name}`;
    const candidates = nonRootBySymbol.get(symbol.name) ?? [];
    const componentOwners = [...new Set(candidates.map(({ ownerId }) => ownerId).filter(Boolean))];
    const explicit = classifications.get(rootSurface);
    const ownerBearingName = symbol.name.replace(/^use/i, "");
    const prefixOwners = componentIds.filter((id) => ownerBearingName.startsWith(symbolPrefix(id))).sort((a, b) => b.length - a.length);
    const canonicalOwner = prefixOwners[0];
    if (explicit) {
      surfaces.push({ surface: rootSurface, classification: explicit.classification, ...(explicit.ownerId ? { ownerId: explicit.ownerId } : {}), ...(explicit.documentation ? { documentation: explicit.documentation } : {}), value: symbol.value, reason: explicit.reason, status: "covered" });
    } else if (canonicalOwner) {
      surfaces.push({ surface: rootSurface, classification: "alias", ownerId: canonicalOwner, value: symbol.value, reason: "Root named export aliases the matching canonical component family.", status: "covered" });
    } else if (componentOwners.length === 1) {
      surfaces.push({ surface: rootSurface, classification: "alias", ownerId: componentOwners[0], value: symbol.value, reason: "Root named export aliases the canonical component subpath contract.", status: "covered" });
    } else if (componentOwners.length === 0 && candidates.some(({ classification }) => classification === "utility")) {
      const utility = candidates.find(({ classification }) => classification === "utility");
      surfaces.push({ surface: rootSurface, classification: "utility", documentation: utility.documentation, value: symbol.value, reason: "Root named export aliases a classified public utility.", status: "covered" });
    } else {
      const reason = componentOwners.length > 1
        ? `Root export maps ambiguously to component owners: ${componentOwners.join(", ")}.`
        : "Root named export has no classified public subpath owner.";
      surfaces.push({ surface: rootSurface, classification: "unclassified", value: symbol.value, reason, status: "unclassified" });
      failures.push(failure("unclassified-root-symbol", reason, rootSurface));
    }
  }

  const discoveredSurfaceSet = new Set(surfaces.map(({ surface }) => surface));
  for (const [surface] of classifications) {
    if (!discoveredSurfaceSet.has(surface)) failures.push(failure("stale-classification", "Catalog classification does not match a package export or named symbol.", surface));
  }

  const components = [];
  for (const id of componentIds) {
    const sourceJson = `src/primitives/${id}/agent.json`;
    const sourceMarkdown = `src/primitives/${id}/agent.md`;
    const docs = `docs/components/${id}/README.md`;
    const subpath = `./${id}`;
    const hasJson = await exists(join(packageRoot, sourceJson));
    const hasMarkdown = await exists(join(packageRoot, sourceMarkdown));
    const hasDocs = await exists(join(packageRoot, docs));
    const hasManifest = manifestComponentIds.has(id);
    const status = hasJson && hasMarkdown && hasDocs && hasManifest ? "covered" : "uncovered";
    if (status === "uncovered") {
      failures.push(failure("uncovered-component", `Component owner is missing ${[!hasJson && "agent.json", !hasMarkdown && "agent.md", !hasDocs && "public documentation", !hasManifest && "manifest entry"].filter(Boolean).join(", ")}.`, subpath, id));
    }
    components.push({
      id,
      name: componentRecords.find(({ data }) => data.id === id)?.data.name ?? displayName(id),
      publicSubpaths: [subpath],
      publicSymbols: (symbolsBySubpath.get(subpath) ?? []).map(({ name }) => name),
      publicValueSymbols: (symbolsBySubpath.get(subpath) ?? []).filter(({ value }) => value).map(({ name }) => name),
      sourceOwner: `src/primitives/${id}`,
      documentationOwner: docs,
      agentSources: hasJson || hasMarkdown ? { json: sourceJson, markdown: sourceMarkdown } : null,
      manifestPaths: { json: `./${id}.json`, markdown: `./${id}.md` },
      status,
    });
  }

  const guides = guideRecords.map(({ data }) => {
    const manifestCovered = manifestGuideIds.has(data.id);
    if (!manifestCovered) failures.push(failure("uncovered-guide", "Package guide is absent from the manifest.", undefined, data.id));
    return {
      id: data.id,
      name: data.name,
      sourceOwner: `agents/guides/${data.id}`,
      agentSources: { json: `agents/guides/${data.id}/agent.json`, markdown: `agents/guides/${data.id}/agent.md` },
      manifestPaths: { json: `./${data.id}.json`, markdown: `./${data.id}.md` },
      status: manifestCovered ? "covered" : "uncovered",
    };
  }).sort((a, b) => a.id.localeCompare(b.id));

  const nativeDestinations = catalog.nativeApplicationDestinations ?? [];
  const nativeIds = new Set();
  for (const item of nativeDestinations) {
    const keys = Object.keys(item).sort().join(",");
    if (keys !== "id,kind,reason" || !item.id || !["native", "application"].includes(item.kind) || !item.reason) {
      failures.push(failure("invalid-native-application-destination", "Native/application destinations require only id, kind, and reason.", "agents/catalog.json", item.id));
    } else if (nativeIds.has(item.id)) {
      failures.push(failure("duplicate-native-application-destination", "Native/application destination IDs must be unique.", "agents/catalog.json", item.id));
    } else {
      nativeIds.add(item.id);
    }
  }
  const utilityIds = new Set((catalog.classifications ?? []).filter(({ classification, surface }) => classification === "utility" && /^\.\/[a-z0-9-]+$/.test(surface)).map(({ surface }) => surface.slice(2)));
  const selectionDestinations = [];
  function destinationShapeValid(destination) {
    if (!destination || typeof destination !== "object" || Array.isArray(destination)) return false;
    const keys = Object.keys(destination).sort().join(",");
    if (["component", "guide", "native-application", "utility"].includes(destination.kind)) {
      return keys === "id,kind" && typeof destination.id === "string" && destination.id.length > 0;
    }
    if (destination.kind === "package") {
      return keys === "id,kind,package,versionPolicy"
        && typeof destination.package === "string" && destination.package.startsWith("@flowstack-ui/")
        && typeof destination.id === "string" && destination.id.length > 0
        && destination.versionPolicy === "installed-exact";
    }
    return false;
  }
  function resolveDestination(destination, source, context) {
    let resolved = destinationShapeValid(destination);
    if (resolved && destination.kind === "component") resolved = componentIdSet.has(destination.id);
    else if (resolved && destination.kind === "guide") resolved = guideIdSet.has(destination.id);
    else if (resolved && destination.kind === "utility") resolved = utilityIds.has(destination.id);
    else if (resolved && destination.kind === "native-application") resolved = nativeIds.has(destination.id);
    else if (resolved && destination.kind === "package") {
      const installed = packageJson.dependencies?.[destination.package] ?? packageJson.peerDependencies?.[destination.package];
      resolved = typeof installed === "string" && /^\d+\.\d+\.\d+(?:[-+].+)?$/u.test(installed);
    }
    const entry = { source, context, destination, status: resolved ? "covered" : "unresolved" };
    selectionDestinations.push(entry);
    if (!resolved) failures.push(failure("unresolved-selection", `Destination ${JSON.stringify(destination)} does not resolve.`, source));
  }
  for (const { data } of guideRecords) {
    for (const [index, item] of data.selection.entries()) {
      if (!Array.isArray(item.destinations) || item.destinations.length === 0) {
        failures.push(failure("missing-selection-destinations", `Selection item ${index + 1} has no structured destinations.`, `agents/guides/${data.id}/agent.json`));
        continue;
      }
      for (const destination of item.destinations) {
        if (destination.kind === "utility") failures.push(failure("invalid-selection-destination-kind", "Selection destinations cannot target an unstructured utility.", `agents/guides/${data.id}/agent.json`));
        resolveDestination(destination, `agents/guides/${data.id}/agent.json`, item.intent);
      }
      const prose = `${item.use} ${item.note ?? ""}`;
      const destinationIds = new Set(item.destinations.map(({ kind, id }) => kind === "component" ? id : null).filter(Boolean));
      for (const id of componentIds) {
        const publicNames = [symbolPrefix(id), displayName(id)].filter((name) => name.length > 3);
        const named = publicNames.some((name) => mentionsPublicName(prose, name));
        if (named && !destinationIds.has(id)) {
          failures.push(failure("selection-prose-destination-mismatch", `Selection prose names ${id} without a matching component destination.`, `agents/guides/${data.id}/agent.json`));
        }
      }
    }
    for (const related of data.related) {
      const destination = typeof related === "string"
        ? { kind: guideIdSet.has(related) ? "guide" : utilityIds.has(related) ? "utility" : "component", id: related }
        : related;
      resolveDestination(destination, `agents/guides/${data.id}/agent.json`, "related");
    }
  }
  for (const { data } of componentRecords) {
    for (const related of data.related) {
      const destination = typeof related === "string"
        ? { kind: guideIdSet.has(related) ? "guide" : utilityIds.has(related) ? "utility" : "component", id: related }
        : related;
      resolveDestination(destination, `src/primitives/${data.id}/agent.json`, "related");
    }
  }

  const exclusionEntries = (catalog.exclusions ?? []).map((item) => ({ ...item, status: "invalid" }));
  for (const item of exclusionEntries) failures.push(failure("invalid-exclusion", "Atom currently has no supported source-only exclusion discovery; remove or implement an exact verifier-backed exclusion.", item.pattern));

  surfaces.sort((a, b) => a.surface.localeCompare(b.surface));
  components.sort((a, b) => a.id.localeCompare(b.id));
  selectionDestinations.sort((a, b) => `${a.source}:${a.context}:${JSON.stringify(a.destination)}`.localeCompare(`${b.source}:${b.context}:${JSON.stringify(b.destination)}`));
  failures.sort((a, b) => `${a.code}:${a.surface ?? ""}:${a.id ?? ""}`.localeCompare(`${b.code}:${b.surface ?? ""}:${b.id ?? ""}`));
  const unclassified = surfaces.filter(({ status }) => status === "unclassified").length;
  const unresolvedSelections = selectionDestinations.filter(({ status }) => status === "unresolved").length;
  return {
    schema: "flowstack.agent-coverage.v1",
    package: packageJson.name,
    packageVersion: packageJson.version,
    layer: "atom",
    generatedFrom: { exports: "package.json", catalog: "agents/catalog.json", manifest: "dist/agents/manifest.json" },
    summary: {
      publicSurfaces: surfaces.length,
      classifiedPublicSurfaces: surfaces.length - unclassified,
      componentOwners: components.length,
      guidedComponentOwners: components.filter(({ status }) => status === "covered").length,
      packageGuides: guides.length,
      unclassified,
      invalidExclusions: exclusionEntries.filter(({ status }) => status === "invalid").length,
      unresolvedSelections,
    },
    components,
    surfaces,
    guides,
    exclusions: exclusionEntries,
    selectionDestinations,
    nativeApplicationDestinations: nativeDestinations.map((item) => ({ ...item, status: nativeIds.has(item.id) ? "covered" : "invalid" })),
    failures,
  };
}

export function coverageFailureMessage(report) {
  if (!report.failures.length) return null;
  return `Agent catalog coverage failed:\n${report.failures.map(({ code, message, surface, id }) => `- [${code}] ${surface ?? id ?? "catalog"}: ${message}`).join("\n")}`;
}
