#!/usr/bin/env node
// Local Amharic phrase catalogue, used by the in-page translator (src/lib/i18n/domTranslator.ts).
//
// Every piece of interface text written in the source is collected as an English phrase, and
// src/lib/i18n/phrases/am/<section>.json maps each one to Amharic. A section is a top-level
// route (case, business, foods, ...); "common" holds what several routes share.
//
//   node scripts/i18n.mjs sync              rescan the source, regroup phrases by section, report what is missing
//   node scripts/i18n.mjs check             exit 1 when a phrase has no Amharic translation
//   node scripts/i18n.mjs todo <dir>        write the missing phrases as numbered work files
//   node scripts/i18n.mjs apply <dir>       merge translated work files (lines of "id|Amharic")
//   node scripts/i18n.mjs add <file.json>   merge { "English": "Amharic" } pairs found outside the source scan
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const PHRASE_DIR = path.join(ROOT, "src/lib/i18n/phrases");
const AM_DIR = path.join(PHRASE_DIR, "am");
const EXTRA_FILE = path.join(AM_DIR, "_extra.json");
const LOADER_FILE = path.join(PHRASE_DIR, "sections.ts");

// Interface code: every displayed string is collected.
const UI_ROOTS = ["src/app", "src/components", "src/features", "src/hooks"];
// Server and library code: only text that reaches the screen through an API (labels, questions, messages).
const DATA_ROOTS = ["src/server", "src/app/api", "src/lib"];
// Reference databases and generated catalogues are content, not interface text.
const DATA_SKIP = [
  /^src\/lib\/i18n\//,
  /^src\/lib\/nutrition\//,
  /^src\/lib\/location\//,
  /^src\/lib\/knowledge\//,
  /^src\/lib\/christian\//,
  /^src\/lib\/literature\//,
  /^src\/lib\/db\//,
  /^src\/lib\/engines\//,
  /^src\/lib\/profiling\/naming\//,
  /^src\/lib\/cultural\//,
  /^src\/lib\/hexacore\//,
  /^src\/lib\/wellbeing\//,
  /^src\/tests\//,
];
// Reference content that is translated in full. Add a file here, run `todo`, translate, `apply`.
const CONTENT_FILES = [
  "src/lib/cultural/ethiopianHeritage.ts",
  "src/lib/cultural/worldTraditions.ts",
];

const toPosix = (p) => p.split(path.sep).join("/");
const rel = (p) => toPosix(path.relative(ROOT, p));

function listFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Text rules

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–", hellip: "…",
  rarr: "→", larr: "←", uarr: "↑", darr: "↓", middot: "·", bull: "•", copy: "©", reg: "®", trade: "™",
  times: "×", deg: "°", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", check: "✓", laquo: "«", raquo: "»",
};

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body] ?? whole;
  });
}

// The text React receives for a JSX text child (same rule as the JSX transform).
function jsxTextValue(raw) {
  const lines = raw.split(/\r\n|\n|\r/);
  let lastNonEmpty = 0;
  lines.forEach((line, index) => {
    if (/[^ \t]/.test(line)) lastNonEmpty = index;
  });
  let out = "";
  lines.forEach((line, index) => {
    let trimmed = line.replace(/\t/g, " ");
    if (index !== 0) trimmed = trimmed.replace(/^ +/, "");
    if (index !== lines.length - 1) trimmed = trimmed.replace(/ +$/, "");
    if (trimmed) {
      if (index !== lastNonEmpty) trimmed += " ";
      out += trimmed;
    }
  });
  return decodeEntities(out);
}

// Must match normalizeText() in src/lib/i18n/domTranslator.ts.
const normalize = (text) => text.replace(/\s+/g, " ").trim();

const ETHIOPIC = /[ሀ-᎟ⶀ-⷟]/;
const letterCount = (text) => (text.match(/[A-Za-z]/g) || []).length;
const hasWord = (text) => /[A-Za-z]{2,}/.test(text);

const UTILITY_WORDS = new Set(
  ("flex grid hidden block inline relative absolute fixed sticky static truncate italic underline uppercase lowercase " +
    "capitalize border rounded shadow transition container group peer antialiased contents table isolate invisible " +
    "visible resize outline ring blur grayscale invert filter transform prose grow shrink").split(" "),
);

function looksLikeClassList(text) {
  const tokens = text.split(" ");
  let utility = 0;
  for (const token of tokens) {
    if (UTILITY_WORDS.has(token)) utility++;
    else if (/^!?-?(?:[a-z0-9-]+:)*-?[a-z]+(?:-[a-z0-9.[\]/%#()_,]+)+$/.test(token)) utility++;
    else if (/[[\]]/.test(token) && /^[a-z!-]/.test(token)) utility++;
  }
  return utility * 2 >= tokens.length;
}

function looksLikeCode(text) {
  if (/^(https?:|mailto:|tel:|data:|blob:|\/|\.\.?\/|#|@\/|\$)/.test(text)) return true;
  // A semicolon followed by a space is punctuation in a sentence; anywhere else it is code.
  if (/=>|[{}<>`\\]|;(?! )|\|\||&&|==|\(\)|::|\$\{/.test(text)) return true;
  if (/^[\w.-]+\.(tsx?|jsx?|json|css|png|jpe?g|svg|webp|pdf|csv|md|mp3|mp4|woff2?)$/i.test(text)) return true;
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\s/.test(text)) return true;
  if (/^[a-z]+(\/[a-z0-9.+*-]+)+$/i.test(text)) return true; // paths and MIME types
  if (/^(rgba?|hsla?|var|calc|url|linear-gradient|radial-gradient|translate|scale|rotate|cubic-bezier)\(/.test(text)) return true;
  if (/^\d+(\.\d+)?(px|rem|em|ms|s|%|vh|vw|deg)( \d+(\.\d+)?(px|rem|em|ms|s|%|vh|vw|deg))*$/.test(text)) return true;
  if (/^[MmLlHhVvCcSsQqTtAaZz][\d\s.,MmLlHhVvCcSsQqTtAaZz-]+$/.test(text) && /\d/.test(text)) return true; // SVG path data
  if (/\b(sans-serif|monospace|ease-in-out|no-referrer|same-origin|utf-8)\b/i.test(text)) return true;
  if (/^[\w-]+=[^ ]/.test(text)) return true;
  if (/^\((?:min-|max-|prefers-|pointer|hover|display-mode|orientation)[^)]*\)$/.test(text)) return true; // media queries
  if (/^[\w$]+(?:[._:][\w$]*)+$/.test(text.replace(/\{\}/g, "x"))) return true; // dotted keys such as app.setting.name
  return false;
}

// Several words that read as a sentence or a label.
function isSentence(text) {
  if (!text.includes(" ") || !hasWord(text)) return false;
  if (ETHIOPIC.test(text) && letterCount(text) < 4) return false;
  if (looksLikeCode(text)) return false;
  if (looksLikeClassList(text)) return false;
  const words = text.split(" ");
  if (/^[A-Z0-9“"'‘(¿¡[•✓⚠→]/.test(text)) return true;
  if (/[.?!…:,]( |$)/.test(text)) return true;
  // lower-case fragments such as "no results found"
  return words.length >= 2 && words.every((word) => /^[a-z'’()/,-]+$/i.test(word)) && !words.some((word) => /_/.test(word));
}

// A single displayed word such as "Overview" or "Pending".
function isLabelWord(text) {
  if (text.includes(" ")) return false;
  return /^[A-Z][a-z]{2,}(?:[-’'][A-Za-z]+)*[.:!?…]*$/.test(text);
}

// ---------------------------------------------------------------------------------------------
// Source scan

const SKIP_ATTRIBUTES = new Set([
  "className", "class", "id", "href", "src", "srcSet", "type", "name", "key", "role", "htmlFor", "rel", "target", "method",
  "action", "style", "variant", "size", "color", "tone", "intent", "kind", "mode", "as", "d", "viewBox", "fill", "stroke",
  "strokeLinecap", "strokeLinejoin", "strokeWidth", "transform", "points", "xmlns", "autoComplete", "inputMode", "pattern",
  "accept", "loading", "decoding", "dir", "lang", "align", "side", "position", "tabIndex", "value", "defaultValue",
  "dataKey", "format", "encType", "crossOrigin", "referrerPolicy", "sizes", "media", "charSet", "httpEquiv", "property",
  "slot", "is", "form", "list", "wrap", "scope", "shape", "coords", "sandbox", "allow", "capture", "preload", "strategy",
  "fontFamily", "textAnchor", "dominantBaseline", "gradientUnits", "clipPath", "mask", "filter", "offset", "stopColor",
  "icon", "layout", "animation", "easing", "trigger", "theme", "width", "height", "x", "y", "cx", "cy", "r", "rx", "ry",
  "x1", "x2", "y1", "y2", "dx", "dy", "in", "result", "values", "attributeName", "dur", "repeatCount", "begin",
]);

const SKIP_PROPERTIES = new Set([
  "className", "class", "href", "src", "url", "path", "pathname", "id", "key", "type", "variant", "icon", "color", "tone",
  "slug", "code", "method", "accent", "gradient", "bg", "ring", "border", "fill", "stroke", "background", "shadow",
  "fontFamily", "font", "transition", "animation", "easing", "ease", "position", "display", "cursor", "transform",
  "filter", "backdropFilter", "boxShadow", "textShadow", "backgroundImage", "mixBlendMode", "contentType", "mime",
  "mimeType", "accept", "locale", "timeZone", "encoding", "credentials", "cache", "mode", "regex", "selector", "query",
  "sql", "route", "endpoint", "api", "table", "column", "field", "event", "channel", "topic", "queue", "env", "model",
]);

const CLASS_FUNCTIONS = new Set(["cn", "clsx", "cva", "twMerge", "classNames", "cx"]);
const SILENT_FUNCTIONS = new Set([
  "log", "warn", "error", "info", "debug", "trace", "time", "timeEnd", "group", "groupEnd", "assert", "fetch", "push",
  "replace", "prefetch", "redirect", "get", "set", "has", "append", "delete", "getItem", "setItem", "removeItem",
  "addEventListener", "removeEventListener", "dispatchEvent", "querySelector", "querySelectorAll", "getElementById",
  "createElement", "createElementNS", "matchMedia", "toLocaleString", "toLocaleDateString", "toLocaleTimeString",
  "setAttribute", "getAttribute", "removeAttribute", "startsWith", "endsWith", "includes", "indexOf", "split",
  "replaceAll", "match", "test", "padStart", "padEnd", "localeCompare", "getContext", "require", "closest", "matches",
  "toggle", "add", "remove", "contains", "postMessage", "open", "revalidatePath", "revalidateTag", "notFound", "cookies",
  "getPropertyValue", "setProperty", "emit", "on", "off", "once", "subscribe", "publish", "encodeURIComponent", "mark",
  "measure", "span", "startSpan", "execute", "query", "raw", "prepare", "exec", "createHash", "createHmac", "update",
  "digest", "toString", "from", "encode", "decode", "readFileSync", "writeFileSync", "existsSync", "join", "resolve",
]);
const SILENT_CONSTRUCTORS = new Set(["Date", "URL", "URLSearchParams", "RegExp", "CustomEvent", "Event", "Intl", "Headers", "Blob", "File", "Worker", "TextDecoder", "Set", "Map"]);

function calleeName(expression) {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return "";
}

function calleeRoot(expression) {
  let node = expression;
  while (ts.isPropertyAccessExpression(node) || ts.isCallExpression(node)) node = node.expression;
  return ts.isIdentifier(node) ? node.text : "";
}

function containsJsx(node) {
  let found = false;
  const visit = (child) => {
    if (found) return;
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child)) found = true;
    else ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
}

function createScanner(checker) {
  /** phrase -> { files:Set<string>, ctx:string|null, ui:boolean } */
  const phrases = new Map();

  const add = (text, file, { ctx = null, ui = true } = {}) => {
    const phrase = normalize(text);
    if (!phrase || !hasWord(phrase)) return;
    if (ETHIOPIC.test(phrase) && letterCount(phrase) < 4) return;
    let entry = phrases.get(phrase);
    if (!entry) phrases.set(phrase, (entry = { files: new Set(), ctx: null, ui: false }));
    entry.files.add(file);
    if (ctx && !entry.ctx) entry.ctx = ctx;
    if (ui) entry.ui = true;
  };

  // What a `{expression}` child becomes in the page: text ("hole"), an element ("break"), or nothing.
  function childKind(expression) {
    if (containsJsx(expression)) return "break";
    if (ts.isStringLiteralLike(expression)) return "text";
    let type;
    try {
      type = checker.getTypeAtLocation(expression);
    } catch {
      return "hole";
    }
    const members = type.isUnion() ? type.types : [type];
    let texty = false;
    let nodey = false;
    for (const member of members) {
      const flags = member.flags;
      if (flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.BooleanLike | ts.TypeFlags.Void | ts.TypeFlags.Never)) continue;
      if (flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike)) texty = true;
      else if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        const source = expression.getText();
        if (/children|icon|node|element|content|render|slot|badge|action/i.test(source)) nodey = true;
        else texty = true;
      } else nodey = true;
    }
    if (nodey) return "break";
    return texty ? "hole" : "none";
  }

  function scanJsxChildren(children, file) {
    const runs = [[]];
    const outline = [];
    for (const child of children) {
      if (ts.isJsxText(child)) {
        const value = jsxTextValue(child.text);
        if (value) {
          runs[runs.length - 1].push({ text: value });
          outline.push(value);
        }
      } else if (ts.isJsxExpression(child)) {
        if (!child.expression) continue;
        const kind = childKind(child.expression);
        if (kind === "text") {
          // Inline CSS or markup passed as a string child; short pieces such as ">" are real text.
          if (child.expression.text.length > 40 && /[{};]/.test(child.expression.text)) continue;
          runs[runs.length - 1].push({ text: child.expression.text });
          outline.push(child.expression.text);
        } else if (kind === "hole") {
          runs[runs.length - 1].push({ hole: true });
          outline.push("{}");
        } else if (kind === "break") {
          runs.push([]);
          outline.push("<…>");
        }
      } else {
        runs.push([]);
        outline.push("<…>");
      }
    }
    const pieces = runs.filter((run) => run.some((part) => part.text && hasWord(part.text)));
    if (!pieces.length) return;
    const ctx = runs.length > 1 && pieces.length > 1 ? normalize(outline.join("")) : null;
    for (const run of pieces) {
      const key = normalize(run.map((part) => (part.hole ? "{}" : part.text)).join(""));
      if (letterCount(key.replace(/\{\}/g, "")) < 2) continue;
      add(key, file, { ctx: ctx && ctx !== key ? ctx.slice(0, 220) : null });
    }
  }

  // `Showing ${count} results` and "Hello " + name become "Showing {} results" and "Hello {}".
  function templateKey(node) {
    if (ts.isTemplateExpression(node)) {
      let key = node.head.text;
      for (const span of node.templateSpans) key += "{}" + span.literal.text;
      return key;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const parts = [];
      const flatten = (expression) => {
        if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
          flatten(expression.left);
          flatten(expression.right);
        } else if (ts.isParenthesizedExpression(expression)) flatten(expression.expression);
        else parts.push(expression);
      };
      flatten(node);
      if (!parts.some((part) => ts.isStringLiteralLike(part))) return null;
      return parts.map((part) => (ts.isStringLiteralLike(part) ? part.text : "{}")).join("");
    }
    return null;
  }

  function literalIsSilent(node) {
    let child = node;
    let parent = node.parent;
    while (parent) {
      if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isExternalModuleReference(parent)) return true;
      if (ts.isLiteralTypeNode(parent) || ts.isTypeNode(parent)) return true;
      if (ts.isTaggedTemplateExpression(parent)) return true;
      if (ts.isCaseClause(parent) && parent.expression === child) return true;
      if (ts.isElementAccessExpression(parent) && parent.argumentExpression === child) return true;
      if ((ts.isPropertyAssignment(parent) || ts.isPropertyDeclaration(parent) || ts.isEnumMember(parent)) && parent.name === child) return true;
      if (ts.isComputedPropertyName(parent)) return true;
      if (ts.isBinaryExpression(parent)) {
        const operator = parent.operatorToken.kind;
        if (
          operator === ts.SyntaxKind.EqualsEqualsEqualsToken || operator === ts.SyntaxKind.ExclamationEqualsEqualsToken ||
          operator === ts.SyntaxKind.EqualsEqualsToken || operator === ts.SyntaxKind.ExclamationEqualsToken ||
          operator === ts.SyntaxKind.InKeyword || operator === ts.SyntaxKind.InstanceOfKeyword
        ) return true;
      }
      if (ts.isJsxAttribute(parent)) return SKIP_ATTRIBUTES.has(parent.name.getText()) || /^(data-|aria-(?!label|description|placeholder|valuetext|roledescription))/.test(parent.name.getText());
      if (ts.isPropertyAssignment(parent) && parent.initializer === child) {
        const name = parent.name.getText().replace(/['"]/g, "");
        if (SKIP_PROPERTIES.has(name) || /(Class|ClassName|Classes|Color|Colour|Href|Url|Src|Path|Icon|Key|Id|Slug|Style|Gradient|Selector|Regex|Pattern)$/.test(name)) return true;
      }
      if (ts.isVariableDeclaration(parent) && parent.initializer === child && ts.isIdentifier(parent.name)) {
        if (/(class|classname|classes|color|href|url|path|style|selector|regex|pattern|query|sql|key|id)$/i.test(parent.name.text)) return true;
      }
      if (ts.isCallExpression(parent) && parent.expression !== child) {
        const name = calleeName(parent.expression);
        if (CLASS_FUNCTIONS.has(name)) return true;
        if (parent.expression.kind === ts.SyntaxKind.ImportKeyword) return true;
        const root = calleeRoot(parent.expression);
        if (root === "console" || root === "sql" || root === "logger" || root === "log") return true;
        if (SILENT_FUNCTIONS.has(name) && parent.arguments.includes(child)) return "word";
      }
      if (ts.isNewExpression(parent) && parent.expression !== child) {
        if (SILENT_CONSTRUCTORS.has(calleeName(parent.expression))) return true;
      }
      if (ts.isExpressionStatement(parent) && ts.isSourceFile(parent.parent)) return true; // "use client"
      if (ts.isFunctionLike(parent) || ts.isSourceFile(parent)) break;
      child = parent;
      parent = parent.parent;
    }
    return false;
  }

  function scanFile(sourceFile, file, ui) {
    const visit = (node) => {
      if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
        // <style> and <script> hold code, not text for the reader.
        const tag = ts.isJsxElement(node) ? node.openingElement.tagName.getText() : "";
        if (tag === "style" || tag === "script") return;
        if (ui) scanJsxChildren(node.children, file);
      } else if (ts.isStringLiteralLike(node)) {
        const silent = literalIsSilent(node);
        if (silent !== true) {
          const text = normalize(node.text);
          const inJsxAttribute = node.parent && ts.isJsxAttribute(node.parent);
          if (ui) {
            if (isSentence(text)) add(text, file);
            else if (silent !== "word" && isLabelWord(text)) add(text, file);
            else if (inJsxAttribute && /^[A-Z][A-Z]{2,}[.:!?…]*$/.test(text)) add(text, file);
          } else if (dataLiteralIsDisplayed(node) && isSentence(text)) {
            add(text, file, { ui: false });
          }
        }
      } else if (ts.isTemplateExpression(node) || (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken && !(ts.isBinaryExpression(node.parent) && node.parent.operatorToken.kind === ts.SyntaxKind.PlusToken))) {
        const key = templateKey(node);
        if (key && literalIsSilent(node) !== true) {
          const text = normalize(key);
          const fixed = text.replace(/\{\}/g, "");
          if (text.includes("{}") && letterCount(fixed) >= 4 && isSentence(fixed.trim() + " .") && !looksLikeCode(fixed) && !looksLikeClassList(normalize(fixed))) {
            if (ui || dataLiteralIsDisplayed(node)) add(text, file, { ui });
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  return { phrases, scanFile };
}

const DISPLAYED_PROPERTIES = /^(label|title|name|heading|subtitle|description|summary|hint|help|helper|helpText|placeholder|question|prompt|message|error|warning|notice|note|caption|text|body|detail|details|reason|guidance|instruction|instructions|tooltip|cta|badge|eyebrow|tagline|intro|outro|disclaimer|caution|advice|explanation|rationale|recommendation|options|choices|steps|items|bullets|examples|shortLabel|longLabel|displayName|empty|emptyText)$/;

// In server and library code only labelled text is collected: `label: "..."`, `error: "..."`, thrown errors, schema messages.
function dataLiteralIsDisplayed(node) {
  let child = node;
  let parent = node.parent;
  let depth = 0;
  while (parent && depth < 6) {
    if (ts.isPropertyAssignment(parent) && parent.initializer === child) {
      return DISPLAYED_PROPERTIES.test(parent.name.getText().replace(/['"]/g, ""));
    }
    if (ts.isNewExpression(parent) && /Error$/.test(calleeName(parent.expression))) return true;
    if (ts.isCallExpression(parent)) {
      const name = calleeName(parent.expression);
      if (/^(min|max|length|email|regex|refine|url|nonempty|uuid|int|positive|nonnegative|describe|fail|badRequest|unauthorized|forbidden|notFound|conflict|apiError|jsonError|errorResponse|json)$/.test(name)) return name !== "describe";
      return false;
    }
    if (ts.isArrayLiteralExpression(parent) || ts.isConditionalExpression(parent) || ts.isParenthesizedExpression(parent) || ts.isAsExpression(parent) || ts.isSatisfiesExpression(parent) || (ts.isBinaryExpression(parent) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.PlusToken].includes(parent.operatorToken.kind)) || ts.isTemplateSpan(parent) || ts.isTemplateExpression(parent)) {
      child = parent;
      parent = parent.parent;
      depth++;
      continue;
    }
    return false;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
// Sections: which route needs which phrase

function resolveImport(fromFile, specifier, known) {
  let base;
  if (specifier.startsWith("@/")) base = path.join(ROOT, "src", specifier.slice(2));
  else if (specifier.startsWith(".")) base = path.resolve(path.dirname(fromFile), specifier);
  else return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (known.has(candidate)) return candidate;
  }
  return null;
}

function buildImportGraph(sourceFiles) {
  const known = new Set(sourceFiles.keys());
  const graph = new Map();
  for (const [file, sourceFile] of sourceFiles) {
    const targets = new Set();
    const visit = (node) => {
      let specifier = null;
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        if (!(ts.isImportDeclaration(node) && node.importClause?.isTypeOnly)) specifier = node.moduleSpecifier.text;
      } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
        specifier = node.arguments[0].text;
      }
      if (specifier) {
        const target = resolveImport(file, specifier, known);
        if (target) targets.add(target);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    graph.set(file, targets);
  }
  return graph;
}

function reachableFrom(entries, graph) {
  const seen = new Set();
  const stack = [...entries];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const next of graph.get(file) ?? []) stack.push(next);
  }
  return seen;
}

function assignSections(phrases, sourceFiles) {
  const graph = buildImportGraph(sourceFiles);
  const appDir = path.join(ROOT, "src/app");
  const routeEntries = new Map(); // section -> entry files
  const shellEntries = [];
  for (const file of sourceFiles.keys()) {
    const relative = toPosix(path.relative(appDir, file));
    if (relative.startsWith("..")) continue;
    const segments = relative.split("/");
    if (segments.length === 1) shellEntries.push(file);
    else if (segments[0] !== "api") {
      if (!routeEntries.has(segments[0])) routeEntries.set(segments[0], []);
      routeEntries.get(segments[0]).push(file);
    }
  }
  // The home page is part of the first load everywhere, so it counts as shared.
  const shell = reachableFrom(shellEntries, graph);
  const fileSections = new Map(); // relative file -> Set(section)
  for (const [section, entries] of routeEntries) {
    for (const file of reachableFrom(entries, graph)) {
      if (shell.has(file)) continue;
      const key = rel(file);
      if (!fileSections.has(key)) fileSections.set(key, new Set());
      fileSections.get(key).add(section);
    }
  }
  const result = new Map(); // phrase -> string[] sections
  for (const [phrase, entry] of phrases) {
    const sections = new Set();
    let shared = false;
    for (const file of entry.files) {
      const owners = fileSections.get(file);
      // Not imported by any page: server text that arrives through an API, or shell code.
      if (!owners) shared = true;
      else for (const owner of owners) sections.add(owner);
    }
    result.set(phrase, shared || sections.size === 0 || sections.size > 2 ? ["common"] : [...sections].sort());
  }
  return result;
}

// ---------------------------------------------------------------------------------------------
// Catalogue files

const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {});

function writeJson(file, data) {
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + "\n");
}

function loadTranslations() {
  const translations = new Map();
  if (!fs.existsSync(AM_DIR)) return translations;
  for (const name of fs.readdirSync(AM_DIR)) {
    if (!name.endsWith(".json")) continue;
    for (const [phrase, amharic] of Object.entries(readJson(path.join(AM_DIR, name)))) {
      if (typeof amharic === "string" && amharic) translations.set(phrase, amharic);
    }
  }
  return translations;
}

function scanSource() {
  const configPath = path.join(ROOT, "tsconfig.json");
  const config = ts.parseJsonConfigFileContent(ts.readConfigFile(configPath, ts.sys.readFile).config, ts.sys, ROOT);
  const uiFiles = [
    ...UI_ROOTS.flatMap((dir) => listFiles(path.join(ROOT, dir))).filter((file) => !rel(file).startsWith("src/app/api/")),
    ...CONTENT_FILES.map((file) => path.join(ROOT, file)).filter((file) => fs.existsSync(file)),
  ];
  const dataFiles = DATA_ROOTS.flatMap((dir) => listFiles(path.join(ROOT, dir))).filter((file) => !DATA_SKIP.some((rule) => rule.test(rel(file))));
  const program = ts.createProgram({ rootNames: [...new Set([...uiFiles, ...dataFiles])], options: { ...config.options, noEmit: true, incremental: false } });
  const checker = program.getTypeChecker();
  const scanner = createScanner(checker);
  const sourceFiles = new Map();
  const uiSet = new Set(uiFiles);
  for (const file of new Set([...uiFiles, ...dataFiles])) {
    const sourceFile = program.getSourceFile(file);
    if (!sourceFile) continue;
    sourceFiles.set(file, sourceFile);
    scanner.scanFile(sourceFile, rel(file), uiSet.has(file));
  }
  // The import graph needs every project file, not only the scanned ones.
  for (const sourceFile of program.getSourceFiles()) {
    const file = path.normalize(sourceFile.fileName);
    if (!file.includes("node_modules") && !sourceFiles.has(file)) sourceFiles.set(file, sourceFile);
  }
  return { phrases: scanner.phrases, sections: assignSections(scanner.phrases, sourceFiles) };
}

// A translation may drop a hole (an English plural "s") but must not use one the phrase lacks.
function placeholdersMatch(phrase, amharic) {
  const holes = (phrase.match(/{}/g) || []).length;
  if (/{}/.test(amharic)) return false;
  for (const token of amharic.match(/{(d+)}/g) || []) if (Number(token.slice(1, -1)) >= holes) return false;
  return true;
}

function sync({ quiet = false } = {}) {
  const { phrases, sections } = scanSource();
  const translations = loadTranslations();
  const extra = readJson(EXTRA_FILE);
  const files = new Map([["common", {}]]);
  const missing = [];
  for (const phrase of phrases.keys()) {
    const amharic = translations.get(phrase);
    if (!amharic) {
      missing.push(phrase);
      continue;
    }
    for (const section of sections.get(phrase)) {
      if (!files.has(section)) files.set(section, {});
      files.get(section)[phrase] = amharic;
    }
  }
  const stale = [...translations.keys()].filter((phrase) => !phrases.has(phrase) && !(phrase in extra)).length;
  if (fs.existsSync(AM_DIR)) {
    for (const name of fs.readdirSync(AM_DIR)) if (name.endsWith(".json") && name !== "_extra.json") fs.rmSync(path.join(AM_DIR, name));
  }
  for (const [section, data] of files) writeJson(path.join(AM_DIR, `${section}.json`), data);
  writeJson(EXTRA_FILE, extra);
  const names = [...files.keys()].filter((name) => name !== "common").sort();
  const loader = [
    "// Generated by `node scripts/i18n.mjs sync`. Do not edit by hand.",
    "type PhraseModule = { default: Record<string, string> };",
    "",
    "/** Phrases every page needs: the shell, shared components, and text that arrives from the server. */",
    "export const COMMON_PHRASES: Array<() => Promise<PhraseModule>> = [",
    '  () => import("./am/common.json"),',
    '  () => import("./am/_extra.json"),',
    "];",
    "",
    "/** Phrases of one top-level route, keyed by the first segment of the path. */",
    "export const ROUTE_PHRASES: Record<string, () => Promise<PhraseModule>> = {",
    ...names.map((name) => `  ${JSON.stringify(name)}: () => import(${JSON.stringify(`./am/${name}.json`)}),`),
    "};",
    "",
  ].join("\n");
  fs.writeFileSync(LOADER_FILE, loader);
  const total = phrases.size;
  if (!quiet) {
    const done = total - missing.length;
    console.log(`${total} phrases, ${done} translated (${total ? ((done / total) * 100).toFixed(1) : "100.0"}%), ${missing.length} missing, ${stale} stale dropped, ${Object.keys(extra).length} extra.`);
  }
  return { phrases, sections, missing, translations };
}

function todo(dir, size = 150) {
  const { phrases, sections, missing } = sync();
  fs.mkdirSync(dir, { recursive: true });
  for (const name of fs.readdirSync(dir)) if (/^(todo|done)-\d+\.tsv$/.test(name) || name === "ids.json") fs.rmSync(path.join(dir, name));
  // Shared and client-facing text first, staff consoles and server messages last; related phrases stay together.
  const LATE = ["business", "professional", "provider", "admin"];
  const rank = (phrase) => {
    const entry = phrases.get(phrase);
    const section = sections.get(phrase)[0];
    if (!entry.ui) return 9;
    if (section === "common") return 0;
    const late = LATE.indexOf(section);
    return late < 0 ? 1 : 2 + late;
  };
  const order = (phrase) => `${rank(phrase)}|${sections.get(phrase)[0]}|${[...phrases.get(phrase).files][0]}`;
  missing.sort((a, b) => (order(a) < order(b) ? -1 : order(a) > order(b) ? 1 : 0));
  const tally = {};
  for (const phrase of missing) {
    const name = phrases.get(phrase).ui ? sections.get(phrase)[0] : "(server text)";
    tally[name] = (tally[name] || 0) + 1;
  }
  console.log(Object.entries(tally).sort((x, y) => y[1] - x[1]).map(([name, count]) => `${name} ${count}`).join(", "));
  const ids = {};
  let chunk = [];
  let chunkIndex = 0;
  const flush = () => {
    if (!chunk.length) return;
    chunkIndex++;
    fs.writeFileSync(path.join(dir, `todo-${String(chunkIndex).padStart(3, "0")}.tsv`), chunk.join("\n") + "\n");
    chunk = [];
  };
  missing.forEach((phrase, index) => {
    const id = index + 1;
    ids[id] = phrase;
    const entry = phrases.get(phrase);
    chunk.push(`${id}\t${phrase}${entry.ctx ? `\t⟦${entry.ctx}⟧` : ""}`);
    if (chunk.length >= size) flush();
  });
  flush();
  fs.writeFileSync(path.join(dir, "ids.json"), JSON.stringify(ids));
  console.log(`${missing.length} phrases in ${chunkIndex} work files under ${dir}`);
}

function apply(dir) {
  const ids = readJson(path.join(dir, "ids.json"));
  const extra = readJson(EXTRA_FILE);
  const pending = readJson(path.join(AM_DIR, "common.json"));
  let merged = 0;
  const problems = [];
  for (const name of fs.readdirSync(dir).sort()) {
    if (!/^done-.*\.tsv$/.test(name)) continue;
    const lines = fs.readFileSync(path.join(dir, name), "utf8").split(/\r?\n/);
    lines.forEach((line, lineIndex) => {
      if (!line.trim()) return;
      const cut = line.indexOf("|");
      const id = line.slice(0, cut).trim();
      const amharic = line.slice(cut + 1).trim();
      const phrase = ids[id];
      if (cut < 1 || !phrase) return problems.push(`${name}:${lineIndex + 1} unknown id "${id}"`);
      if (!amharic) return problems.push(`${name}:${lineIndex + 1} empty translation for ${id}`);
      if (!placeholdersMatch(phrase, amharic)) return problems.push(`${name}:${lineIndex + 1} placeholders differ for ${id}: ${phrase} -> ${amharic}`);
      pending[phrase] = amharic;
      merged++;
    });
  }
  // Parked in common.json; sync then moves each phrase to the section that uses it.
  writeJson(path.join(AM_DIR, "common.json"), pending);
  writeJson(EXTRA_FILE, extra);
  console.log(`${merged} translations merged.`);
  if (problems.length) console.log(`${problems.length} lines skipped:\n  ${problems.join("\n  ")}`);
  sync();
}

function addExtra(file) {
  const extra = readJson(EXTRA_FILE);
  const incoming = readJson(file);
  let added = 0;
  for (const [phrase, amharic] of Object.entries(incoming)) {
    const key = normalize(phrase);
    if (!key || typeof amharic !== "string" || !amharic.trim()) continue;
    if (!placeholdersMatch(key, amharic)) {
      console.log(`placeholders differ, skipped: ${key}`);
      continue;
    }
    extra[key] = amharic.trim();
    added++;
  }
  writeJson(EXTRA_FILE, extra);
  console.log(`${added} extra phrases stored.`);
}

const [command, argument] = process.argv.slice(2);
if (command === "sync") sync();
else if (command === "check") {
  const { missing } = sync();
  if (missing.length) {
    console.log(missing.slice(0, 40).map((phrase) => `  - ${phrase}`).join("\n"));
    if (missing.length > 40) console.log(`  … and ${missing.length - 40} more`);
    process.exit(1);
  }
} else if (command === "todo" && argument) todo(argument, Number(process.argv[5]) || 150);
else if (command === "apply" && argument) apply(argument);
else if (command === "add" && argument) addExtra(argument);
else {
  console.log("Usage: node scripts/i18n.mjs <sync | check | todo <dir> | apply <dir> | add <file.json>>");
  process.exit(command ? 1 : 0);
}
