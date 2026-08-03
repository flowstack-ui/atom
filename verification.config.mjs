const verification = {
  schemaVersion: 1,
  id: "atom",
  kind: "public-package",
  commands: {
    focused: "check:focused",
    repository: "check:repository",
    release: "check:release",
    processCheck: "test:processes",
    contract: "verify:repository-contract",
  },
  servers: [
    {
      name: "playground",
      developmentPort: 3000,
      testPort: 4000,
      configurationFiles: ["playground/vite.config.ts"],
      strictPort: true,
    },
  ],
  browserConfigs: ["playwright.config.ts"],
  workflows: {
    ci: ".github/workflows/ci.yml",
    nightly: ".github/workflows/nightly.yml",
    publish: ".github/workflows/publish.yml",
  },
  impact: {
    strategy: "component-manifest",
    manifest: "scripts/component-test-manifest.mjs",
    conservativePaths: ["package.json", "package-lock.json", "src/index.ts", "scripts", "test/browser"],
  },
  manual: ["physical mobile browsers", "human accessibility and interaction judgment"],
};

export default verification;
