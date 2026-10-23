/**
 * Writes JSON Schema files for every exported contract into packages/shared-types/schemas.
 * Run with `npm run schemas:generate`. A test fails if the committed files are stale.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildJsonSchemas } from "../packages/shared-types/src/json-schema";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "packages", "shared-types", "schemas");
mkdirSync(outDir, { recursive: true });

for (const [name, schema] of Object.entries(buildJsonSchemas())) {
  const file = join(outDir, `${name}.schema.json`);
  writeFileSync(file, `${JSON.stringify(schema, null, 2)}\n`);
  console.log(`wrote ${file}`);
}
