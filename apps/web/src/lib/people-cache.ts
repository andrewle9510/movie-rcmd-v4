const PEOPLE_CACHE_KEY = "people-cache";

export type PeopleCacheEntry = {
  tmdb_person_id: number;
  name: string;
  profile_path: string | null;
  department: string | null;
  character: string | null;
  updated_at: string;
};

export type PeopleCache = Record<number, PeopleCacheEntry>;

export const getPeopleMapFromCache = (): PeopleCache => {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(PEOPLE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as PeopleCache;
  } catch {
    return {};
  }
};

export const getPeopleFromCache = (ids: number[]): PeopleCache => {
  const map = getPeopleMapFromCache();
  const subset: PeopleCache = {};
  for (const id of ids) {
    const entry = map[id];
    if (entry) subset[id] = entry;
  }
  return subset;
};

export const savePeopleToCache = (people: any[]): void => {
  try {
    if (typeof window === "undefined") return;
    if (!Array.isArray(people) || people.length === 0) return;

    const existing = getPeopleMapFromCache();
    const merged: PeopleCache = { ...existing };

    for (const p of people) {
      const id = p?.tmdb_person_id;
      if (typeof id !== "number") continue;

      merged[id] = {
        tmdb_person_id: id,
        name: typeof p?.name === "string" ? p.name : "",
        profile_path: p?.profile_path ?? null,
        department: p?.department ?? null,
        character: p?.character ?? null,
        updated_at: typeof p?.updated_at === "string" ? p.updated_at : new Date().toISOString(),
      };
    }

    localStorage.setItem(PEOPLE_CACHE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
};
