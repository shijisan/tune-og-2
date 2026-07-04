import "./eval-shim";
import Innertube, { ClientType } from "youtubei.js/web";

let ytPromise: Promise<Innertube> | null = null;

export function getPlayer() {
    if (!ytPromise) {
        ytPromise = (async () => {
            
            // bootstrap session just to get visitor_data + solve the BotGuard challenge
            const bootstrap = await Innertube.create({ client_type: ClientType.MUSIC, cache: undefined });
            const visitorData = bootstrap.session.context.client.visitorData;

            if (!visitorData) throw new Error("No visitor data"); // BUG: this gets hit

            // TODO: complete po_token minting utils
            // const poToken = await generatePoToken(bootstrap, visitorData);

            return Innertube.create({
                client_type: ClientType.MUSIC,
                cache: undefined,
                visitor_data: visitorData,
                
                // TODO: clarify this
                // fetch: (input, init) => globalThis.fetch(input, init),

                // TODO: pass po_token
                // po_token: poToken,
            });
        })();
    }
    return ytPromise;
}