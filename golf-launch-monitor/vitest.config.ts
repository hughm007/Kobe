import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "packages",
          environment: "node",
          // End-to-end, golden and Monte Carlo tests run full trajectory simulations; CI runners
          // are several times slower than a workstation, so the 5 s default is too tight.
          testTimeout: 120_000,
          include: ["packages/*/test/**/*.test.ts", "tests/**/*.test.ts"],
        },
      },
      "apps/*",
    ],
  },
});
