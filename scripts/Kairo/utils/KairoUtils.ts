import { system, type Vector3 } from "@minecraft/server";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_ID_PREFIX } from "../constants/scriptevent";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../constants/system";
import { properties } from "../../properties";
import type { PlayerKairoData } from "../system/PlayerKairoData";

export interface KairoCommand {
    commandId: string;
    addonId: string;
    requestId?: string;

    [key: string]: any;
}

export type AllowedDynamicValue = boolean | number | string | Vector3 | null;

export class KairoUtils {
    public static async sendKairoCommand(targetAddonId: string, data: KairoCommand): Promise<void> {
        system.sendScriptEvent(
            `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${targetAddonId}`,
            JSON.stringify(data),
        );

        await
    }

    public static async sendKairoCommandForResponse(
        targetAddonId: string,
        commandId: string,
        data: any = undefined,
    ): Promise<KairoCommand> {}

    public static saveToDataVault(
        key: string,
        value: boolean | number | string | Vector3 | null,
    ): void {
        const type = value === null ? "null" : typeof value;
        if (type === "object" && !this.isVector3(value)) {
            throw new Error(
                `Invalid value type for saveToDataVault: expected Vector3 for object, got ${JSON.stringify(value)}`,
            );
        }

        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT, {
            commandId: SCRIPT_EVENT_COMMAND_IDS.SAVE_DATA,
            addonId: properties.id,
            type,
            key,
            value: JSON.stringify(value),
        });
    }

    public static loadFromDataVault(key: string): void {
        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT, {
            commandId: SCRIPT_EVENT_COMMAND_IDS.LOAD_DATA,
            addonId: properties.id,
            key,
        });
    }

    public static getPlayerKairoData(playerId: string): PlayerKairoData {
        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO, {
            commandId: SCRIPT_EVENT_COMMAND_IDS.GET_PLAYER_KAIRO_DATA,
            addonId: properties.id,
        });
    }

    public static getPlayersKairoData(): PlayerKairoData[] {}

    private static readonly chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static readonly charsLength = KairoUtils.chars.length;

    /**
     * ランダムな requestId を生成します。
     * 文字種: a-z, A-Z, 0-9
     * 長さ: 48
     */
    public static generate(length: number = 48): string {
        let result = "";
        const chars = KairoUtils.chars;
        const n = KairoUtils.charsLength;

        for (let i = 0; i < length; i++) {
            const rand = (Math.random() * n) | 0;
            result += chars[rand];
        }

        return result;
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

    private static isVector3(value: any): value is Vector3 {
        return (
            typeof value === "object" &&
            value !== null &&
            typeof value.x === "number" &&
            typeof value.y === "number" &&
            typeof value.z === "number" &&
            Object.keys(value).length === 3
        );
    }
}
