import { z } from "zod";
import { EXPORTED_SCHEMAS } from "./schemas";
import { SCHEMA_VERSION } from "./versions";

export type ExportedSchemaName = keyof typeof EXPORTED_SCHEMAS;

/**
 * Builds the JSON Schema documents for every exported contract. Refinements that JSON
 * Schema cannot express (e.g. "null value <=> unavailable source") are enforced only by
 * the zod schemas; each document says so in its description.
 */
export function buildJsonSchemas(): Record<ExportedSchemaName, Record<string, unknown>> {
  const out = {} as Record<ExportedSchemaName, Record<string, unknown>>;
  for (const [name, schema] of Object.entries(EXPORTED_SCHEMAS) as [ExportedSchemaName, z.ZodType][]) {
    const json = z.toJSONSchema(schema, { target: "draft-2020-12", unrepresentable: "any" }) as Record<
      string,
      unknown
    >;
    out[name] = {
      $id: `https://golf-launch-monitor.local/schemas/${SCHEMA_VERSION}/${name}.schema.json`,
      title: name,
      description:
        `Generated from @glm/shared-types (${SCHEMA_VERSION}). Cross-field invariants ` +
        "(e.g. a null measurement value requires source 'unavailable') are enforced by the " +
        "runtime zod schemas and are not all expressible in JSON Schema.",
      ...json,
    };
  }
  return out;
}
