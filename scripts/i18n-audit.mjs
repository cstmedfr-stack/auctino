import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const EXTENSIONS = new Set([".ts", ".tsx"]);

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
]);

const IGNORE_PATH_PARTS = [
  "src\\i18n\\messages\\",
  "src/i18n/messages/",
  "src\\constants\\locations.ts",
  "src/constants/locations.ts",
  "src\\constants\\categories.ts",
  "src/constants/categories.ts",
  "src\\config\\market.ts",
  "src/config/market.ts",
  "src\\i18n\\config.ts",
"src/i18n/config.ts",
"src\\i18n\\LocaleProvider.tsx",
"src/i18n/LocaleProvider.tsx",
];

const CHECKS = [
  {
    name: "Romanian diacritics / hardcoded RO text",
    regex: /[ăâîșțĂÂÎȘȚ]/,
  },
  {
    name: "Possible emoji in UI",
    regex:
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
  },
  {
    name: "alert(...) usage",
    regex: /\balert\s*\(/,
  },
  {
    name: "window.confirm(...) usage",
    regex: /\bwindow\.confirm\s*\(/,
  },
  {
    name: "console.log(...) usage",
    regex: /\bconsole\.log\s*\(/,
  },
  {
    name: "Hardcoded ro-RO locale",
    regex:
      /toLocale(String|DateString|TimeString)\s*\(\s*["']ro-RO["']/,
  },
  {
    name: "Hardcoded Romanian loading/action text",
    regex:
      /(Se încarcă|Se salvează|Se actualizează|Eroare|Nu ai|Înapoi|Vezi|Trimite|Salvează|Șterge|Renunță|Confirmă)/,
  },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (
      entry.isFile() &&
      EXTENSIONS.has(path.extname(entry.name))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(filePath) {
  return path.relative(ROOT, filePath);
}

function shouldIgnore(filePath) {
  const normalized = relative(filePath);

  return IGNORE_PATH_PARTS.some((ignoredPath) =>
    normalized.includes(ignoredPath)
  );
}

function isCommentOnly(line) {
  const trimmed = line.trim();

  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*")
  );
}

const files = walk(SRC_DIR).filter(
  (file) => !shouldIgnore(file)
);

const findings = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed || isCommentOnly(trimmed)) {
      return;
    }

    for (const check of CHECKS) {
      if (check.regex.test(line)) {
        findings.push({
          file: relative(file),
          line: index + 1,
          check: check.name,
          text:
            trimmed.length > 180
              ? `${trimmed.slice(0, 180)}...`
              : trimmed,
        });
      }
    }
  });
}

if (findings.length === 0) {
  console.log("No obvious hardcoded i18n issues found.");
  process.exit(0);
}

const grouped = new Map();

for (const finding of findings) {
  if (!grouped.has(finding.file)) {
    grouped.set(finding.file, []);
  }

  grouped.get(finding.file).push(finding);
}

console.log(
  `Found ${findings.length} potential i18n issues in ${grouped.size} files.\n`
);

for (const [file, fileFindings] of grouped) {
  console.log(`\n## ${file}`);

  for (const finding of fileFindings) {
    console.log(
      `  L${finding.line} [${finding.check}] ${finding.text}`
    );
  }
}