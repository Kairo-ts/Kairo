import { system, type Vector3 } from "@minecraft/server";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_ID_PREFIX } from "../constants/scriptevent";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../constants/system";
import { properties } from "../../properties";

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

    public static saveToDataVault(
        key: string,
        value: boolean | number | string | Vector3 | null,
    ): void {
        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT, {
            commandId: SCRIPT_EVENT_COMMAND_IDS.SAVE_DATA,
            addonId: properties.id,
            key,
            value,
        });
    }

    public static loadFromDataVault(key: string): void {
        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT, {
            commandId: SCRIPT_EVENT_COMMAND_IDS.LOAD_DATA,
            addonId: properties.id,
            key,
        });
    }

    public static isRawMessage(value: unknown): boolean {
        if (value === null || typeof value !== "object") return false;
        const v: any = value;

        // -------- rawtext: RawMessage[] --------
        if (v.rawtext !== undefined) {
            if (!Array.isArray(v.rawtext)) return false;
            for (const item of v.rawtext) {
                if (!this.isRawMessage(item)) return false;
            }
        }

        // -------- score: RawMessageScore --------
        if (v.score !== undefined) {
            const s = v.score;
            if (s === null || typeof s !== "object") return false;

            if (s.name !== undefined && typeof s.name !== "string") return false;
            if (s.objective !== undefined && typeof s.objective !== "string") return false;
        }

        // -------- text: string --------
        if (v.text !== undefined && typeof v.text !== "string") {
            return false;
        }

        // -------- translate: string --------
        if (v.translate !== undefined && typeof v.translate !== "string") {
            return false;
        }

        // -------- with: string[] | RawMessage --------
        if (v.with !== undefined) {
            const w = v.with;

            // string[]
            if (Array.isArray(w)) {
                if (!w.every((item) => typeof item === "string")) return false;
            }
            // RawMessage
            else if (!this.isRawMessage(w)) {
                return false;
            }
        }

        return true;
    }
}
