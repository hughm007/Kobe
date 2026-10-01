import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "packages",
          environment: "node",
          include: ["packages/*/test/**/*.test.ts", "tests/**/*.test.ts"],
        },
      },
      "apps/*",
    ],
  },
});
