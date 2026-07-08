export function u8ToBase64(u8: Uint8Array, urlSafe: boolean = false): string {
    const result = btoa(String.fromCharCode(...u8));

    return urlSafe
        ? result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        : result;
}

export function base64ToU8(base64: string): Uint8Array {
    // handle URL-safe base64 (BotGuard responses sometimes use - and _ instead of + and /)
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(normalized);

    const u8 = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        u8[i] = binaryString.charCodeAt(i);
    }

    return u8;
}