import { base64ToU8 } from "./codec-helper";
import { getVM } from "./get-vm";

// === TYPES ===

type VmFunctionsCallbackType = {
    asyncSnapshotFunction: (
        callback: (response: any) => void,
        args: any[]
    ) => Promise<void>;
}

type PoIntegrityTokenResponse = {
    integrityToken?: string;
    estimatedTtlSecs: number;
    mintRefreshThreshold: number;
    websafeFallbackToken?: string;
};

type WebPoMinter = {
    mintAsWebsafeString(contentBinding: string): Promise<string>;
}

type getPoTokenMinterReturn = {
    mintCallback: WebPoMinter;
    integrityTokenData: PoIntegrityTokenResponse
}

type SnapshotArgs = {
    contentBinding: string;
    signedTimestamp?: number;
    webPoSignalOutput: any[];
    skipPrivacyBuffer?: boolean;
};

type SyncSnapshotFn = (...args: any[]) => any;


// === GLOBAL DECS ===
const vmFunctions: Partial<VmFunctionsCallbackType> = {};


// === CONSTANTS ===

/* 
* not documented well, got this value from:
* https://github.com/LuanRT/BgUtils/issues/7 and 
* https://kuangbyte.medium.com/exploring-the-system-design-of-youtube-music-by-requests-from-a-browser-8567fbdbe999
*/
const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";
const GOOGLE_IT_GEN_URL = "https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT";
const GOOGLE_API_KEY = "AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw";
const USER_AGENT = "grpc-web-javascript/0.1";


// === PRIVATE METHODS ===

// getter of the snapshot function
async function syncSnapshotFunction(): Promise<SyncSnapshotFn> {
    const { vm, program } = await getVM();
    let syncSnapshotFunction;

    if (!vm) throw new Error('[BotGuardClient] VM not found in the global object');

    if (!vm.a) throw new Error('[BotGuardClient] Cannot load program');


    const vmFunctionsCallback = (
        asyncSnapshotFunction: VmFunctionsCallbackType["asyncSnapshotFunction"],
    ) => {
        Object.assign(vmFunctions, { asyncSnapshotFunction });
    }

    try {
        syncSnapshotFunction = await vm.a(program, vmFunctionsCallback, true, undefined, () => { /** no-op */ }, [[], []])[0];
    } catch (error) {
        throw new Error(`[BotGuardClient] Failed to load program (${(error as Error).message})`);
    }

    return syncSnapshotFunction;

}

// takes and passes a snapshot of the vm and botguard responds the attestation proof string and resolves the functions in the callback array
async function snapshot(args: SnapshotArgs): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!vmFunctions.asyncSnapshotFunction)
            return reject(new Error('[BotGuardClient]: Async snapshot function not found'));

        vmFunctions.asyncSnapshotFunction((response) => resolve(response), [
            args.contentBinding,
            args.signedTimestamp,
            args.webPoSignalOutput,
            args.skipPrivacyBuffer,
        ]);
    });
}

// integrity token fetcher function
async function getPoIntegrityToken(requestKey: string, botguardResponse: string): Promise<PoIntegrityTokenResponse> {
    const payload = [requestKey, botguardResponse];

    const integrityTokenResponse = await fetch(GOOGLE_IT_GEN_URL, {
        method: "POST",
        headers: {
            'Content-type': 'application/json+protobuf',
            'x-goog-api-key': GOOGLE_API_KEY,
            'x-user-agent': USER_AGENT,
        },
        body: JSON.stringify(payload),
    });

    const integrityTokenJson = await integrityTokenResponse.json() as [string, number, number, string];

    const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] = integrityTokenJson;

    return {
        integrityToken,
        estimatedTtlSecs,
        mintRefreshThreshold,
        websafeFallbackToken
    }
}

async function getPoTokenMinter(contentBinding: string): Promise<getPoTokenMinterReturn> {
    await syncSnapshotFunction();

    const webPoSignalOutput: any[] = [];

    const botguardResponse = await snapshot({
        contentBinding,
        webPoSignalOutput,
        skipPrivacyBuffer: true,
    }) as string;

    const integrityTokenData = await getPoIntegrityToken(REQUEST_KEY, botguardResponse);

    if (!integrityTokenData.integrityToken) {
        throw new Error('[BotGuardClient] Failed to get integrity token');
    }

    const getMinter = webPoSignalOutput[0];
    if (!getMinter) throw new Error('[BotGuardClient] Minter getter (PMD) undefined');

    // pass the integrity token (as bytes) to get the actual minter object/fn
    const mintCallback = await getMinter(base64ToU8(integrityTokenData.integrityToken));
    if (!mintCallback) throw new Error('[BotGuardClient] Failed to get mint callback');

    return { mintCallback, integrityTokenData };
}


// === PUBLIC METHODS ===

export async function getPoToken(videoId: string): Promise<string> {
    const { mintCallback } = await getPoTokenMinter(videoId);
    const poToken = await mintCallback.mintAsWebsafeString(videoId);
    return poToken;
}

