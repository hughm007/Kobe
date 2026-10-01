import type { StoreName } from "./errors";
import { rawShotLink, type ShotLinkField } from "./record-codec";
import { BackendRepository, type CascadeSpec, type RawEntry, type RecordBackend } from "./repository";

/**
 * The raw maps behind an InMemoryRepository. Values are whatever was stored: the
 * repository writes validated plain copies, but a caller that owns the store (an importer,
 * or a test simulating corruption) may place anything here, and loads re-validate it.
 */
export type InMemoryStore = {
  readonly players: Map<string, unknown>;
  readonly sessions: Map<string, unknown>;
  readonly shots: Map<string, unknown>;
};

export function createInMemoryStore(): InMemoryStore {
  return { players: new Map(), sessions: new Map(), shots: new Map() };
}

class InMemoryBackend implements RecordBackend {
  constructor(private readonly store: InMemoryStore) {}

  async get(store: StoreName, key: string): Promise<RawEntry | null> {
    const map = this.store[store];
    return map.has(key) ? entry(key, map.get(key)) : null;
  }

  async getAll(store: StoreName): Promise<RawEntry[]> {
    return [...this.store[store]].map(([key, value]) => entry(key, value));
  }

  async getShotsByLink(field: ShotLinkField, value: string): Promise<RawEntry[]> {
    return (await this.getAll("shots")).filter((e) => rawShotLink(e.value, field) === value);
  }

  async put(store: StoreName, key: string, value: object): Promise<void> {
    this.store[store].set(key, structuredClone(value));
  }

  async deleteWithCascade(
    store: StoreName,
    key: string,
    cascade: CascadeSpec | null,
  ): Promise<{ existed: boolean; cascaded: number }> {
    let cascaded = 0;
    if (cascade !== null) {
      for (const [shotKey, raw] of [...this.store.shots]) {
        if (rawShotLink(raw, cascade.field) === cascade.value) {
          this.store.shots.delete(shotKey);
          cascaded += 1;
        }
      }
    }
    const existed = this.store[store].delete(key);
    return { existed, cascaded };
  }

  async clear(): Promise<void> {
    this.store.players.clear();
    this.store.sessions.clear();
    this.store.shots.clear();
  }
}

function entry(key: string, value: unknown): RawEntry {
  // Hand out a clone so that nothing downstream can alias backend state.
  let cloned: unknown;
  try {
    cloned = structuredClone(value);
  } catch (error) {
    return { key, value: undefined, decodeError: `value is not cloneable: ${(error as Error).message}` };
  }
  return { key, value: cloned, decodeError: null };
}

/** Volatile repository (lost when the page/process ends). Same contract as the durable ones. */
export class InMemoryRepository extends BackendRepository {
  constructor(options: { store?: InMemoryStore } = {}) {
    super(new InMemoryBackend(options.store ?? createInMemoryStore()));
  }
}
