import * as fs from "node:fs";
import * as path from "node:path";

const APOLOGY_LINE: string =
  "I apologize for chewing your resume into origami, though frankly, you weren't getting that job with Calibri anyway.";

const MAX_LENGTH: number = 120;
const DEFAULT_OUTPUT_DIR: string = "/output";
const ENTRY_FILENAME: string = "entry.txt";

function validateApology(text: string): void {
  const charCount: number = [...text].length;
  if (charCount < 1 || charCount > MAX_LENGTH) {
    throw new Error(`Entry length ${charCount} is outside 1..${MAX_LENGTH} characters.`);
  }
  if (text.trim().length === 0) {
    throw new Error("Entry must not be whitespace only.");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("Entry must be a single line with no newline characters.");
  }
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    throw new Error("Entry must be valid UTF-8 text.");
  }
}

function resolveOutputDir(): string {
  const configured: string | undefined = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_OUTPUT_DIR;
}

function writeEntry(outputDir: string, text: string): void {
  const expected: Buffer = Buffer.from(text, "utf8");
  const outputPath: string = path.join(outputDir, ENTRY_FILENAME);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, expected, { mode: 0o644 });
  fs.chmodSync(outputPath, 0o644);

  const written: Buffer = fs.readFileSync(outputPath);
  if (Buffer.compare(written, expected) !== 0) {
    throw new Error("Written entry bytes do not match expected UTF-8 output.");
  }
}

function main(): void {
  try {
    validateApology(APOLOGY_LINE);
    const outputDir: string = resolveOutputDir();
    writeEntry(outputDir, APOLOGY_LINE);
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Failed to write entry: ${message}\n`);
    process.exitCode = 1;
  }
}

main();
