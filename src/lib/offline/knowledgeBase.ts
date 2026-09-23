/**
 * Offline Knowledge Base
 * Domain A — Scientific reference data cached locally for offline use.
 *
 * Uses IndexedDB to persist the Ethiopian Food Composition Table (EFCT),
 * ETM-DB herb safety data, and regional health atlas data for offline access.
 * Data is refreshed via the PWA background sync mechanism when online.
 */

const DB_NAME = "ethio-wellness-kb";
const DB_VERSION = 1;

export type KBStore = "foods" | "herbs" | "atlas" | "emergencyProtocols";

interface KBRecord {
  key: string;
  data: unknown;
  cachedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const stores: KBStore[] = ["foods", "herbs", "atlas", "emergencyProtocols"];
      for (const store of stores) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "key" });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function kbGet<T>(store: KBStore, key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => {
      const record = req.result as KBRecord | undefined;
      resolve(record ? (record.data as T) : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function kbSet(store: KBStore, key: string, data: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const record: KBRecord = { key, data, cachedAt: new Date().toISOString() };
    const req = tx.objectStore(store).put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function kbGetAll<T>(store: KBStore): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => {
      const records = req.result as KBRecord[];
      resolve(records.map((r) => r.data as T));
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Sync knowledge base from API into IndexedDB.
 * Called on app load when online, and by background sync when reconnecting.
 */
export async function syncKnowledgeBase(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Sync foods
    const foodsRes = await fetch("/api/foods");
    if (foodsRes.ok) {
      const foods = await foodsRes.json();
      await kbSet("foods", "all", foods);
    }

    // Sync atlas
    const atlasRes = await fetch("/api/atlas");
    if (atlasRes.ok) {
      const atlas = await atlasRes.json();
      await kbSet("atlas", "regions", atlas);
    }
  } catch {
    // Offline — silently skip; cached data remains available
  }
}

/**
 * Get foods with offline fallback.
 */
export async function getFoodsWithFallback(): Promise<unknown[]> {
  try {
    const res = await fetch("/api/foods");
    if (res.ok) {
      const data = await res.json();
      await kbSet("foods", "all", data);
      return data as unknown[];
    }
  } catch {
    // Network unavailable
  }
  return (await kbGet<unknown[]>("foods", "all")) ?? [];
}

/**
 * Get atlas data with offline fallback.
 */
export async function getAtlasWithFallback(): Promise<unknown> {
  try {
    const res = await fetch("/api/atlas");
    if (res.ok) {
      const data = await res.json();
      await kbSet("atlas", "regions", data);
      return data;
    }
  } catch {
    // Network unavailable
  }
  return (await kbGet<unknown>("atlas", "regions")) ?? {};
}

// Ethiopian emergency protocols — hardcoded for guaranteed offline availability
export const EMERGENCY_PROTOCOLS = {
  anemia: {
    title: "Severe Anemia Response",
    immediate: [
      "Ensure patient is lying down in a safe position",
      "Keep patient warm — blanket if available",
      "If unconscious, place in recovery position (left side)",
      "Do NOT give iron tablets without medical supervision",
    ],
    call: "Ethiopian Emergency: 907 (Ambulance) | 911 (Police)",
    herbs: "⚠️ Do NOT administer herbal remedies during acute crisis",
  },
  hypoglycemia: {
    title: "Low Blood Sugar Response",
    immediate: [
      "Give 15g fast-acting carbohydrate: 3–4 tsp sugar dissolved in water",
      "Traditional option: 1 tsp honey (ማር) in warm water",
      "Recheck in 15 minutes — repeat if not improved",
      "Seek medical help if unresponsive",
    ],
    call: "Ethiopian Emergency: 907",
    herbs: "Kosso/Gesho contraindicated — avoid all herbs during hypoglycemia",
  },
  allergicReaction: {
    title: "Severe Allergic Reaction (Anaphylaxis)",
    immediate: [
      "Identify and remove allergen source immediately",
      "Lie patient flat — legs elevated unless breathing is difficult",
      "If prescribed epinephrine auto-injector is available, use it",
      "Call emergency services immediately",
    ],
    call: "Ethiopian Emergency: 907",
    herbs: "Do NOT administer any herbs — proceed to hospital only",
  },
};
