// Type declarations for the shared entry scanner (vite.entries.mjs).
export interface ScanResult {
    /** vite rollup input map: "tools/<slug>/<locale>" -> absolute entry path */
    entries: Record<string, string>;
    /** slugs having entries for every locale */
    migratedTools: string[];
}

export declare const LOCALES: readonly string[];
export declare function scanToolEntries(): ScanResult;
