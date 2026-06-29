// CRITICAL: This must run BEFORE importing 'youtubei.js'
if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function(...args: any[]) {
        // Use .apply() with type assertion to circumvent the strict parameter mismatch
        return originalFetch.apply(window, args as [RequestInfo, RequestInit?]);
    };
}

if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    const originalGlobalFetch = globalThis.fetch;
    globalThis.fetch = function(...args: any[]) {
        return originalGlobalFetch.apply(globalThis, args as [RequestInfo, RequestInit?]);
    };
}

// Now safely import
import Innertube, { ClientType } from "youtubei.js";

let ytPromise: Promise<Innertube> | null = null;

export function getPlayer() {
    if (!ytPromise) {
        ytPromise = Innertube.create({
            client_type: ClientType.ANDROID,
            cache: undefined,
            // Keep this fallback just in case
            fetch: (input, init) => globalThis.fetch(input, init), 
        });
    }
    return ytPromise;
}