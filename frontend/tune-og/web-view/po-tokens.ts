// TODO: use bgUtils by LuanRT instead of manually defining logic

function base64ToU8(base64: string): Uint8Array {
    const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function u8ToBase64(bytes: Uint8Array, urlSafe = false): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    let base64 = btoa(binary);
    if (urlSafe) base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return base64;
}

const WAA_API_KEY = "AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw";

async function getIntegrityToken(requestKey: string, botguardResponse: string) {
    const res = await fetch("https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT", {
        method: "POST",
        headers: {
            "Content-Type": "application/json+protobuf",
            "x-goog-api-key": WAA_API_KEY,
            "x-user-agent": "grpc-web-javascript/0.1",
        },
        body: JSON.stringify([requestKey, botguardResponse]),
    });
    const [integrityToken] = (await res.json()) as [string, number, number, string];
    return integrityToken;
}

export async function generatePoToken(innertube: any, identifier: string): Promise<string> {
    const challengeResponse = await innertube.getAttestationChallenge("ENGAGEMENT_TYPE_UNBOUND");
    if (!challengeResponse.bg_challenge) throw new Error("Could not get BotGuard challenge");

    // DEBUG: uncomment once to confirm actual field names before trusting the below —
    // youtubei.js's parsed shape here isn't fully pinned down in public docs.
    // console.log(JSON.stringify(challengeResponse.bg_challenge, null, 2));

    const bg = challengeResponse.bg_challenge;
    const interpreterUrl = bg.interpreter_url.private_do_not_access_or_else_trusted_resource_url_wrapped_value;
    const program = bg.program;
    const globalName = bg.global_name;
    const requestKey = bg.request_key ?? challengeResponse.request_key;

    const scriptRes = await fetch(`https:${interpreterUrl}`);
    const interpreterJavascript = await scriptRes.text();
    if (!interpreterJavascript) throw new Error("Could not load BotGuard VM script");
    new Function(interpreterJavascript)();

    const vm = (globalThis as any)[globalName];
    if (!vm) throw new Error("BotGuard VM not found in global scope");

    const vmFunctions: any = {};
    const vmFunctionsCallback = (asyncSnapshotFunction: any, shutdownFunction: any, passEventFunction: any, checkCameraFunction: any) => {
        Object.assign(vmFunctions, { asyncSnapshotFunction, shutdownFunction, passEventFunction, checkCameraFunction });
    };

    await vm.a(program, vmFunctionsCallback, true, undefined, () => {}, [[], []]);
    if (!vmFunctions.asyncSnapshotFunction) throw new Error("BotGuard: asyncSnapshotFunction not found");

    const webPoSignalOutput: any[] = [];
    const botguardResponse: string = await new Promise((resolve, reject) => {
        vmFunctions.asyncSnapshotFunction(
            (response: string) => resolve(response),
            [undefined, undefined, webPoSignalOutput, undefined]
        );
    });

    const integrityToken = await getIntegrityToken(requestKey, botguardResponse);

    const getMinter = webPoSignalOutput[0];
    if (!getMinter) throw new Error("PO Token: minter function not found");

    const mintCallback = await getMinter(base64ToU8(integrityToken));
    if (!(mintCallback instanceof Function)) throw new Error("PO Token: failed to acquire mint function");

    const tokenBytes = await mintCallback(new TextEncoder().encode(identifier));
    if (!(tokenBytes instanceof Uint8Array)) throw new Error("PO Token: invalid mint result");

    return u8ToBase64(tokenBytes, true);
}