import { system } from "@minecraft/server";
import { SCRIPT_EVENT_ID_PREFIX } from "../constants/scriptevent";

export interface KairoCommand {
    commandId: string;
    addonId: string;
    [key: string]: any;
}

export class KairoUtils {
    public static sendKairoCommand(targetAddonId: string, data: KairoCommand) {
        system.sendScriptEvent(
            `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${targetAddonId}`,
            JSON.stringify(data),
        );
    }
}
