import { getVM } from "./get-vm";

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

const vmFunctions: Partial<VmFunctionsCallbackType> = {};

/* 
* not documented well, got this value from:
* https://github.com/LuanRT/BgUtils/issues/7 and 
* https://kuangbyte.medium.com/exploring-the-system-design-of-youtube-music-by-requests-from-a-browser-8567fbdbe999
*/
const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo"; 

// getter of the snapshot function
async function syncSnapshotFunction() {
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
async function snapshot(args: any) {
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

// TODO: make the integrity token fetcher function
// async function getPoIntegrityToken(requestKey: string, botguardResponse: string): Promise<PoIntegrityTokenResponse> {}

/*
* === NEXT PROCESSES ===
* 1.) get integrity token
* 2.) use webPoSignalOutput (an array of getters) and access the first item in the array and set it to a var
* 3.) make a fetch to that variable to get the minter function
* 4.) use that minter function and pass the integrity token to get the po token
*/