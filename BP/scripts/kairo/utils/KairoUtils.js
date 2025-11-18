import { system } from "@minecraft/server";
import { SCRIPT_EVENT_ID_PREFIX } from "../constants/scriptevent";
export class KairoUtils {
    static sendKairoCommand(targetAddonId, data) {
        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${targetAddonId}`, JSON.stringify(data));
    }
}
