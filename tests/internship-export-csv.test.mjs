import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("src/lib/internships/export-csv.ts", "utf8");
const js = ts.transpile(source, { module: ts.ModuleKind.ESNext });
const { csvCell } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("spreadsheet formulas and quotes are escaped", () => {
  for (const value of ["=1+1", "+cmd", "-1", "@cmd", "\tcmd", "\rcmd"]) assert.equal(csvCell(value), `"'${value}"`);
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.equal(csvCell("first\nsecond"), '"first\nsecond"');
});
