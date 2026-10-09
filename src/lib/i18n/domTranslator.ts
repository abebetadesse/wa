/**
 * In-page translator backed by the local phrase catalogue (src/lib/i18n/phrases).
 *
 * Pages keep rendering their English source text; this module swaps each piece of displayed
 * text for its catalogued translation directly in the document, and puts the English back
 * when it is switched off. It never adds or removes nodes — only text values and a few
 * attributes change — so React keeps full ownership of the tree.
 */

/** Must match normalize() in scripts/i18n.mjs. */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

const LATIN_WORD = /[A-Za-z]{2,}/;
const SKIP_SELECTOR =
  'script, style, noscript, textarea, code, pre, kbd, samp, [contenteditable=""], [contenteditable="true"], .notranslate, [translate="no"], [data-no-translate]';
const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"] as const;
const MAX_MASK_NODES = 7;
const MAX_CACHE = 6000;
const MAX_MISSING = 4000;
/** Passes that pick up content React hydrates late (hydration changes nothing in the document, so nothing announces it). */
const RESCAN_DELAYS = [0, 120, 400, 1000, 2200, 4500];
/** If React's node tags cannot be found by then, translate without the hydration guard. */
const GUARD_TIMEOUT_MS = 4000;
/**
 * Content that arrives from a slow server is hydrated long after the page opens. It is looked at
 * again every quarter second for 10 s, every second for the next 50 s, then every 3 s; after about
 * three minutes whatever is still untagged does not belong to React and is translated as it stands.
 */
const PENDING_FAST_TRIES = 40;
const PENDING_STEADY_TRIES = 90;
const PENDING_MAX_TRIES = 130;

interface Applied {
  source: string;
  applied: string;
}

interface Template {
  regex: RegExp;
  anchor: string;
  translation: string;
}

type FiberLike = { memoizedProps?: Record<string, unknown> | null; pendingProps?: Record<string, unknown> | null };

function fillTemplate(translation: string, values: string[]): string {
  return translation.replace(/\{(\d+)\}/g, (whole, index: string) => values[Number(index)] ?? whole);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class DomTranslator {
  private phrases = new Map<string, string>();
  private templates: Template[] | null = null;
  private cache = new Map<string, string | null>();
  private textState = new WeakMap<Text, Applied>();
  private attributeState = new WeakMap<Element, Map<string, Applied>>();
  private observer: MutationObserver | null = null;
  private timers: number[] = [];
  private active = false;
  private startedAt = 0;
  private fiberKey: string | null = null;
  private missing = new Set<string>();
  /** Elements whose text React has not hydrated yet. */
  private pending = new Set<Element>();
  private pendingTimer: number | null = null;
  private pendingTries = 0;
  private polling = false;
  private force = false;

  /** Adds phrases (English → translation). Keys containing "{}" are templates with holes. */
  addPhrases(entries: Record<string, string>): void {
    let changed = false;
    for (const key in entries) {
      const value = entries[key];
      if (typeof value !== "string" || !value || this.phrases.get(key) === value) continue;
      this.phrases.set(key, value);
      changed = true;
    }
    if (!changed) return;
    this.templates = null;
    this.cache.clear();
    this.missing.clear();
    if (this.active) this.scheduleRescans();
  }

  start(): void {
    if (this.active || typeof document === "undefined") return;
    this.active = true;
    this.startedAt = Date.now();
    this.observer = new MutationObserver((records) => this.onMutations(records));
    this.observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTES],
    });
    this.scheduleRescans();
  }

  /** Stops translating and puts the source text back. */
  stop(): void {
    if (!this.active) return;
    this.active = false;
    this.observer?.disconnect();
    this.observer = null;
    this.clearTimers();
    this.clearPending();
    this.restore(document.documentElement);
  }

  /** Call after a client-side navigation: new content may hydrate without touching the document. */
  refresh(): void {
    if (this.active) this.scheduleRescans();
  }

  /** English text seen on screen that the catalogue does not cover yet. */
  missingPhrases(): string[] {
    return [...this.missing].sort();
  }

  // ---- scheduling ----------------------------------------------------------------------------

  private clearTimers(): void {
    for (const timer of this.timers) window.clearTimeout(timer);
    this.timers = [];
  }

  private scheduleRescans(): void {
    this.clearTimers();
    for (const delay of RESCAN_DELAYS) {
      this.timers.push(window.setTimeout(() => this.scan(document.documentElement), delay));
    }
  }

  private clearPending(): void {
    if (this.pendingTimer !== null) window.clearTimeout(this.pendingTimer);
    this.pendingTimer = null;
    this.pending.clear();
    this.pendingTries = 0;
  }

  /** Remembers an element that could not be translated yet and keeps coming back to it. */
  private waitFor(element: Element): void {
    this.pending.add(element);
    // Newly arrived content starts the clock again; the poll itself does not.
    if (!this.polling) this.pendingTries = 0;
    if (this.pendingTimer !== null) return;
    const delay = this.pendingTries < PENDING_FAST_TRIES ? 250 : this.pendingTries < PENDING_STEADY_TRIES ? 1000 : 3000;
    this.pendingTimer = window.setTimeout(() => this.retryPending(), delay);
  }

  private retryPending(): void {
    this.pendingTimer = null;
    if (!this.active) return;
    const elements = [...this.pending];
    this.pending.clear();
    this.pendingTries++;
    this.polling = true;
    this.force = this.pendingTries >= PENDING_MAX_TRIES;
    try {
      for (const element of elements) {
        if (!element.isConnected) continue;
        this.scanElementRuns(element);
        this.translateAttributes(element);
      }
    } finally {
      this.polling = false;
      this.force = false;
    }
    this.observer?.takeRecords();
    if (this.pendingTries >= PENDING_MAX_TRIES) this.clearPending();
  }

  private onMutations(records: MutationRecord[]): void {
    if (!this.active) return;
    const added = new Set<Node>();
    const touched = new Set<Node>();
    for (const record of records) {
      if (record.type === "characterData") {
        const node = record.target;
        if (node.nodeType !== Node.TEXT_NODE) continue;
        const state = this.textState.get(node as Text);
        if (state && state.applied === node.nodeValue) continue; // our own write
        if (node.parentNode) touched.add(node.parentNode);
      } else if (record.type === "attributes") {
        if (record.target.nodeType === Node.ELEMENT_NODE) this.translateAttributes(record.target as Element);
      } else {
        // A removed or added text node changes what its neighbours spell together.
        touched.add(record.target);
        for (const node of record.addedNodes) if (node.nodeType === Node.ELEMENT_NODE) added.add(node);
      }
    }
    for (const node of added) if (node.isConnected) this.scan(node);
    for (const node of touched) if (node.isConnected && !added.has(node)) this.scan(node, true);
    // Drop the records produced by our own writes.
    this.observer?.takeRecords();
  }

  // ---- hydration guard -----------------------------------------------------------------------

  private findFiberKey(node: Node): string | null {
    if (this.fiberKey) return this.fiberKey;
    for (const key of Object.keys(node)) {
      if (key.startsWith("__reactFiber$")) {
        this.fiberKey = key;
        return key;
      }
    }
    return null;
  }

  /**
   * Looks for the nearest element React has tagged and reports whether what sits below it is safe
   * to change: a lone string child (written with textContent, so it has no tag of its own), raw
   * HTML, or an element React renders empty that something else fills (a chart, a widget).
   * Anything else below a tagged element is server-rendered content still waiting for hydration.
   */
  private ownerSettled(start: Element | null, key: string, loneText: boolean): boolean {
    let element = start;
    let direct = true;
    while (element) {
      const fiber = (element as unknown as Record<string, FiberLike | undefined>)[key];
      if (fiber) {
        const props = fiber.memoizedProps ?? fiber.pendingProps ?? null;
        if (!props) return false;
        const children = props.children;
        if (direct && loneText && (typeof children === "string" || typeof children === "number" || typeof children === "bigint")) return true;
        return props.dangerouslySetInnerHTML != null || children == null || children === false;
      }
      direct = false;
      element = element.parentElement;
    }
    return false;
  }

  /**
   * React compares server-rendered text against its own render while hydrating, so text must not
   * change before then. Hydrated and client-created nodes carry a React tag; untagged ones wait.
   */
  private isSettled(node: Text, parent: Element): boolean {
    if (this.force) return true;
    // The document title and the rest of <head> are not compared against a client render.
    if (parent.tagName === "TITLE" || parent.closest("head")) return true;
    const key = this.findFiberKey(node) ?? this.findFiberKey(parent) ?? this.findFiberKey(document.body);
    if (!key) {
      // No React tag anywhere yet: either hydration has not begun, or this React build names its tags differently.
      return Date.now() - this.startedAt > GUARD_TIMEOUT_MS;
    }
    if ((node as unknown as Record<string, unknown>)[key]) return true;
    return this.ownerSettled(parent, key, true);
  }

  /** The same guard for an element's attributes. */
  private isElementSettled(element: Element): boolean {
    if (this.force || element.closest("head")) return true;
    const key = this.findFiberKey(element) ?? this.findFiberKey(document.body);
    if (!key) return Date.now() - this.startedAt > GUARD_TIMEOUT_MS;
    if ((element as unknown as Record<string, unknown>)[key]) return true;
    return this.ownerSettled(element.parentElement, key, false);
  }

  // ---- lookup --------------------------------------------------------------------------------

  private compileTemplates(): Template[] {
    const templates: Template[] = [];
    for (const [key, translation] of this.phrases) {
      if (!key.includes("{}")) continue;
      const parts = key.split("{}");
      const letters = parts.join("").replace(/[^A-Za-z]/g, "").length;
      if (letters < 2) continue;
      // Templates with little fixed text only accept numbers in their holes, so ordinary prose never matches by accident.
      const hole = letters < 6 ? "([-+]?\\d[\\d.,:/%]*)" : "(.+?)";
      const anchor = parts.reduce((longest, part) => (part.length > longest.length ? part : longest), "");
      templates.push({ regex: new RegExp(`^${parts.map(escapeRegExp).join(hole)}$`), anchor, translation });
    }
    return templates;
  }

  /** Translates one normalized string, or returns null when the catalogue has nothing for it. */
  private lookup(text: string): string | null {
    const exact = this.phrases.get(text);
    if (exact !== undefined) return exact;
    const cached = this.cache.get(text);
    if (cached !== undefined) return cached;
    let result: string | null = null;
    // "Email address *" and "Notes:" reuse the entry of their label.
    const suffix = /^(.*[A-Za-z)])(\s*[:*…]+)$/.exec(text);
    if (suffix) {
      const base = this.phrases.get(suffix[1]);
      if (base !== undefined) result = base + suffix[2];
    }
    if (result === null) {
      this.templates ??= this.compileTemplates();
      for (const template of this.templates) {
        if (template.anchor && !text.includes(template.anchor)) continue;
        const match = template.regex.exec(text);
        if (!match) continue;
        result = fillTemplate(template.translation, match.slice(1).map((value) => this.phrases.get(value) ?? value));
        break;
      }
    }
    if (this.cache.size >= MAX_CACHE) this.cache.clear();
    this.cache.set(text, result);
    return result;
  }

  private translateString(source: string): string | null {
    if (!LATIN_WORD.test(source)) return null;
    const text = normalizeText(source);
    const translated = this.lookup(text);
    if (translated === null) {
      this.noteMissing(text);
      return null;
    }
    const lead = /^\s*/.exec(source)?.[0] ?? "";
    const trail = /\s*$/.exec(source)?.[0] ?? "";
    return lead + translated + (text.length === 0 ? "" : trail);
  }

  private noteMissing(text: string): void {
    // Text that already carries Ethiopic script is translated content with a Latin name inside it.
    if (/[ሀ-᎟]/.test(text)) return;
    if (this.missing.size < MAX_MISSING && text.length <= 600) this.missing.add(text);
  }

  /**
   * A run is a sequence of neighbouring text nodes: `Showing {count} results` renders as three.
   * Returns the new value for each node, or null to leave the run alone.
   */
  private translateRun(sources: string[]): Array<string | null> | null {
    const joined = sources.join("");
    if (!LATIN_WORD.test(joined)) return null;
    if (sources.length === 1) {
      const single = this.translateString(joined);
      return single === null ? null : [single];
    }
    const lead = /^\s*/.exec(joined)?.[0] ?? "";
    const trail = /\s*$/.exec(joined)?.[0] ?? "";
    const whole = (translated: string) => [lead + translated + trail, ...sources.slice(1).map(() => "")];
    const exact = this.phrases.get(normalizeText(joined));
    if (exact !== undefined) return whole(exact);
    if (sources.length <= MAX_MASK_NODES) {
      // Try each way of reading some nodes as fixed text and the rest as values, fewest values first.
      const count = sources.length;
      const masks: number[] = [];
      for (let mask = 1; mask < (1 << count) - 1; mask++) masks.push(mask);
      const bits = (mask: number) => {
        let total = 0;
        for (let value = mask; value; value >>= 1) total += value & 1;
        return total;
      };
      masks.sort((a, b) => bits(a) - bits(b));
      for (const mask of masks) {
        let key = "";
        let fixedLatin = false;
        const values: string[] = [];
        for (let index = 0; index < count; index++) {
          if (mask & (1 << index)) {
            key += "{}";
            values.push(sources[index]);
          } else {
            key += sources[index];
            if (LATIN_WORD.test(sources[index])) fixedLatin = true;
          }
        }
        if (!fixedLatin) continue;
        const template = this.phrases.get(normalizeText(key));
        if (template === undefined) continue;
        const filled = values.map((value) => {
          const trimmed = normalizeText(value);
          return LATIN_WORD.test(trimmed) ? (this.phrases.get(trimmed) ?? trimmed) : trimmed;
        });
        return whole(fillTemplate(template, filled));
      }
    }
    // No entry for the whole run: translate the pieces that have one.
    let any = false;
    const each = sources.map((source) => {
      if (!LATIN_WORD.test(source)) return null;
      const text = normalizeText(source);
      const translated = this.lookup(text);
      if (translated === null) return null;
      any = true;
      return (/^\s*/.exec(source)?.[0] ?? "") + translated + (/\s*$/.exec(source)?.[0] ?? "");
    });
    if (!any) {
      this.noteMissing(normalizeText(joined));
      return null;
    }
    return each;
  }

  // ---- document ------------------------------------------------------------------------------

  private sourceOf(node: Text): string {
    const state = this.textState.get(node);
    const current = node.nodeValue ?? "";
    return state && state.applied === current ? state.source : current;
  }

  private writeText(node: Text, source: string, value: string | null): void {
    const target = value ?? source;
    if (value === null || value === source) this.textState.delete(node);
    else this.textState.set(node, { source, applied: value });
    if (node.nodeValue !== target) node.nodeValue = target;
  }

  private processRun(nodes: Text[], parent: Element): void {
    if (parent.closest(SKIP_SELECTOR)) return;
    const sources = nodes.map((node) => this.sourceOf(node));
    if (!sources.some((source) => LATIN_WORD.test(source))) {
      // Nothing to translate; make sure nothing stale stays applied.
      nodes.forEach((node, index) => {
        if (this.textState.has(node)) this.writeText(node, sources[index], null);
      });
      return;
    }
    if (!nodes.every((node) => this.isSettled(node, parent))) {
      this.waitFor(parent);
      return;
    }
    const isTitle = parent.tagName === "TITLE";
    const result = isTitle ? this.translateTitle(sources) : this.translateRun(sources);
    nodes.forEach((node, index) => this.writeText(node, sources[index], result ? result[index] : null));
  }

  /** "Page | Site name": each part is looked up on its own. */
  private translateTitle(sources: string[]): Array<string | null> | null {
    const joined = sources.join("");
    const whole = this.lookup(normalizeText(joined));
    if (whole !== null) return [whole, ...sources.slice(1).map(() => "")];
    let any = false;
    const parts = joined.split(" | ").map((part) => {
      const translated = this.lookup(normalizeText(part));
      if (translated === null) return part;
      any = true;
      return translated;
    });
    return any ? [parts.join(" | "), ...sources.slice(1).map(() => "")] : null;
  }

  private translateAttributes(element: Element): void {
    if (element.closest(SKIP_SELECTOR)) return;
    if (!ATTRIBUTES.some((name) => element.hasAttribute(name))) return;
    if (!this.isElementSettled(element)) {
      this.waitFor(element);
      return;
    }
    for (const name of ATTRIBUTES) {
      const current = element.getAttribute(name);
      const states = this.attributeState.get(element);
      const state = states?.get(name);
      if (current === null) {
        states?.delete(name);
        continue;
      }
      const source = state && state.applied === current ? state.source : current;
      const translated = this.translateString(source);
      if (translated === null || translated === source) {
        states?.delete(name);
        if (current !== source) element.setAttribute(name, source);
        continue;
      }
      const map = states ?? new Map<string, Applied>();
      if (!states) this.attributeState.set(element, map);
      map.set(name, { source, applied: translated });
      if (current !== translated) element.setAttribute(name, translated);
    }
  }

  private scanElementRuns(element: Element): void {
    let run: Text[] = [];
    for (let child = element.firstChild; child; child = child.nextSibling) {
      if (child.nodeType === Node.TEXT_NODE) run.push(child as Text);
      else if (child.nodeType !== Node.COMMENT_NODE) {
        if (run.length) this.processRun(run, element);
        run = [];
      }
    }
    if (run.length) this.processRun(run, element);
  }

  /** Translates `root` and, unless `shallow`, everything below it. */
  private scan(root: Node, shallow = false): void {
    if (!this.active) return;
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const start = root as Element;
    if (start.closest(SKIP_SELECTOR)) return;
    this.scanElementRuns(start);
    this.translateAttributes(start);
    if (shallow) return;
    const walker = document.createTreeWalker(start, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => ((node as Element).matches(SKIP_SELECTOR) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const element = node as Element;
      if (element.firstChild) this.scanElementRuns(element);
      if (element.attributes.length) this.translateAttributes(element);
    }
    this.observer?.takeRecords();
  }

  private restore(root: Element): void {
    const texts = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = texts.nextNode(); node; node = texts.nextNode()) {
      const state = this.textState.get(node as Text);
      if (!state) continue;
      if (node.nodeValue === state.applied) node.nodeValue = state.source;
      this.textState.delete(node as Text);
    }
    const elements = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    for (let node = elements.nextNode(); node; node = elements.nextNode()) {
      const states = this.attributeState.get(node as Element);
      if (!states) continue;
      for (const [name, state] of states) {
        if ((node as Element).getAttribute(name) === state.applied) (node as Element).setAttribute(name, state.source);
      }
      this.attributeState.delete(node as Element);
    }
  }
}

let instance: DomTranslator | null = null;

export function getDomTranslator(): DomTranslator {
  instance ??= new DomTranslator();
  return instance;
}
