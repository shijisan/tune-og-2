import { getPlayer } from "../singleton";

/*
* === PROCESS ===
* 1.) request challenge
* 2.) access interpreter inside challenge response
* 3.) make request to interpreter
* 4.) the interpreter response is the obfuscated javascript
* 5.) create the javascript where the interpreter response text will go
* 6.) now we can call the VM to retrieve the integrity token
* 
*/

export async function getVM() {
    const innertube = await getPlayer();

    const challengerRes = await innertube.getAttestationChallenge("ENGAGEMENT_TYPE_UNBOUND");

    if (!challengerRes) throw new Error("No challenger response");

    const interpreterUrl = challengerRes.bg_challenge?.interpreter_url.private_do_not_access_or_else_trusted_resource_url_wrapped_value;

    const bgScriptResponse = await fetch(`https:${interpreterUrl}`);
    const interpreterJavascript = await bgScriptResponse.text();

    if (interpreterJavascript) {
        new Function(interpreterJavascript)();
    } else throw new Error("Could not load VM");
    
    if (!challengerRes.bg_challenge?.global_name) throw new Error("No global name for VM");

    const globalName = challengerRes.bg_challenge.global_name;
    const program = challengerRes.bg_challenge.program;

    const globalObject: any = globalThis;
    const vm = globalObject[globalName]; // now defined

    return {vm, program};

}