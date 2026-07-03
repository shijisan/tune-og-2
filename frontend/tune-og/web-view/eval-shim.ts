// eval-shim.ts
import { Platform, Types } from "youtubei.js/web";

Platform.shim.eval = async (data: Types.BuildScriptResult) => {
    return new Function(data.output)();
};