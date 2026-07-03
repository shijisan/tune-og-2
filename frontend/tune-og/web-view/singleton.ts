import "./eval-shim";
import Innertube, { ClientType } from "youtubei.js/web";
import { generatePoToken } from "./po-tokens";

let ytPromise: Promise<Innertube> | null = null;

export function getPlayer() {
    if (!ytPromise) {
        ytPromise = (async () => {
            // bootstrap session just to get visitor_data + solve the BotGuard challenge
            const bootstrap = await Innertube.create({ client_type: ClientType.MUSIC, cache: undefined });
            const visitorData = bootstrap.session.context.client.visitorData;

            if (!visitorData) throw new Error("No visitor data"); // BUG: this gets hit

            const poToken = await generatePoToken(bootstrap, visitorData);

            return Innertube.create({
                client_type: ClientType.MUSIC,
                cache: undefined,
                visitor_data: visitorData,
                po_token: poToken,
                fetch: (input, init) => globalThis.fetch(input, init),
            });
        })();
    }
    return ytPromise;
}