import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "desktop-firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "desktop-webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "mobile-android-chromium",
      use: { ...devices["Pixel 10"] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "mobile-ios-webkit",
      use: { ...devices["iPhone 17"] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm --prefix playground run preview -- --host 127.0.0.1 --port 4000",
    url: "http://127.0.0.1:4000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
