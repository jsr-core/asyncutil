import { test } from "@cross/test";
import { assertArrayIncludes } from "@std/assert";
import { basename, globToRegExp, join } from "@std/path";
import { ensure, is } from "@core/unknownutil";
import { parse } from "@std/jsonc";

const excludes = [
  "mod.ts",
  "_*.ts",
  "*_test.ts",
  "*_bench.ts",
];

test("mod.ts must exports all exports in public modules", async () => {
  const modExports = await listModExports("./mod.ts");
  const pubExports = [];
  for await (const name of iterPublicModules(".")) {
    pubExports.push(...await listModExports(`./${name}.ts`));
  }
  assertArrayIncludes(modExports, pubExports);
}, { skip: !("Deno" in globalThis) });

test("JSR exports must have all exports in mod.ts", async () => {
  const jsrExportEntries = await listJsrExportEntries();
  const modExportEntries: [string, string][] = [];
  for await (const name of iterPublicModules(".")) {
    modExportEntries.push([`./${name.replaceAll("_", "-")}`, `./${name}.ts`]);
  }
  assertArrayIncludes(jsrExportEntries, modExportEntries);
}, { skip: !("Deno" in globalThis) });

async function* iterPublicModules(relpath: string): AsyncIterable<string> {
  const patterns = excludes.map((p) => globToRegExp(p));
  const root = join(import.meta.dirname!, relpath);
  for await (const entry of Deno.readDir(root)) {
    if (!entry.isFile || !entry.name.endsWith(".ts")) continue;
    if (patterns.some((p) => p.test(entry.name))) continue;
    yield basename(entry.name, ".ts");
  }
}

async function listModExports(path: string): Promise<string[]> {
  const mod = await import(import.meta.resolve(path));
  return Array.from(Object.keys(mod));
}

async function listJsrExportEntries(): Promise<[string, string][]> {
  const text = await Deno.readTextFile(
    new URL(import.meta.resolve("./deno.jsonc")),
  );
  const json = ensure(
    parse(text),
    is.ObjectOf({
      exports: is.RecordOf(is.String, is.String),
    }),
  );
  return Object.entries(json.exports);
}
