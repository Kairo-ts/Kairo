import { system } from "@minecraft/server";
import { SCRIPT_EVENT_COMMAND_TYPES, SCRIPT_EVENT_ID_PREFIX } from "../constants/scriptevent";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../constants/system";
import { properties } from "../../properties";
export class KairoUtils {
    static async sendKairoCommand(targetAddonId, commandType, data = {}, timeoutTicks = 20) {
        return this.sendInternal(targetAddonId, commandType, data, timeoutTicks, false);
    }
    static async sendKairoCommandAndWaitResponse(targetAddonId, commandType, data = {}, timeoutTicks = 20) {
        return this.sendInternal(targetAddonId, commandType, data, timeoutTicks, true);
    }
    static buildKairoResponse(data = {}, success = true, errorMessage) {
        return {
            sourceAddonId: properties.id,
            commandId: this.generateRandomId(16),
            commandType: SCRIPT_EVENT_COMMAND_TYPES.KAIRO_RESPONSE,
            data,
            success,
            ...(errorMessage !== undefined ? { errorMessage } : {}),
        };
    }
    static generateRandomId(length = 8) {
        return Array.from({ length }, () => this.charset[Math.floor(Math.random() * this.charset.length)]).join("");
    }
    static async getPlayerKairoData(playerId) {
        const kairoResponse = await KairoUtils.sendKairoCommandAndWaitResponse(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO, SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYER_KAIRO_DATA, {
            playerId,
        });
        return kairoResponse.data.playerKairoData;
    }
    static async getPlayersKairoData() {
        const kairoResponse = await KairoUtils.sendKairoCommandAndWaitResponse(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO, SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYERS_KAIRO_DATA);
        return kairoResponse.data.playerKairoData;
    }
    static async saveToDataVault(key, value) {
        const type = value === null ? "null" : typeof value;
        if (type === "object" && !this.isVector3(value)) {
            throw new Error(`Invalid value type for saveToDataVault: expected Vector3 for object, got ${JSON.stringify(value)}`);
        }
        return KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT, SCRIPT_EVENT_COMMAND_TYPES.SAVE_DATA, {
            type,
            key,
            value: JSON.stringify(value),
        });
    }
    static async loadFromDataVault(key) {
        const kairoResponse = await KairoUtils.sendKairoCommandAndWaitResponse(KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT, SCRIPT_EVENT_COMMAND_TYPES.LOAD_DATA, {
            key,
        });
        return kairoResponse.data.dataLoaded;
    }
    static resolvePendingRequest(commandId, response) {
        const pending = this.pendingRequests.get(commandId);
        if (!pending)
            return;
        this.pendingRequests.delete(commandId);
        if (pending.expectResponse && response === undefined) {
            pending.reject(new Error(`Kairo response expected but none received (commandId=${commandId})`));
            return;
        }
        pending.resolve(response);
    }
    static rejectPendingRequest(commandId, error) {
        const pending = this.pendingRequests.get(commandId);
        if (!pending)
            return;
        this.pendingRequests.delete(commandId);
        pending.reject(error ?? new Error("Kairo request rejected"));
    }
    static async sendInternal(targetAddonId, commandType, data, timeoutTicks, expectResponse) {
        const kairoCommand = {
            sourceAddonId: properties.id,
            commandId: this.generateRandomId(16),
            commandType,
            data,
        };
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(kairoCommand.commandId, {
                expectResponse,
                resolve,
                reject,
                timeoutTick: system.currentTick + timeoutTicks,
            });
            system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${targetAddonId}`, JSON.stringify(kairoCommand));
        });
    }
    static onTick() {
        if (this.lastTick === system.currentTick)
            return;
        this.lastTick = system.currentTick;
        for (const [requestId, pending] of this.pendingRequests) {
            if (system.currentTick >= pending.timeoutTick) {
                this.pendingRequests.delete(requestId);
                pending.reject(new Error("Kairo command timeout"));
            }
        }
    }
    static isRawMessage(value) {
        if (value === null || typeof value !== "object")
            return false;
        const v = value;
        // -------- rawtext: RawMessage[] --------
        if (v.rawtext !== undefined) {
            if (!Array.isArray(v.rawtext))
                return false;
            for (const item of v.rawtext) {
                if (!this.isRawMessage(item))
                    return false;
            }
        }
        // -------- score: RawMessageScore --------
        if (v.score !== undefined) {
            const s = v.score;
            if (s === null || typeof s !== "object")
                return false;
            if (s.name !== undefined && typeof s.name !== "string")
                return false;
            if (s.objective !== undefined && typeof s.objective !== "string")
                return false;
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
                if (!w.every((item) => typeof item === "string"))
                    return false;
            }
            // RawMessage
            else if (!this.isRawMessage(w)) {
                return false;
            }
        }
        return true;
    }
    static isVector3(value) {
        return (typeof value === "object" &&
            value !== null &&
            typeof value.x === "number" &&
            typeof value.y === "number" &&
            typeof value.z === "number" &&
            Object.keys(value).length === 3);
    }
}
KairoUtils.pendingRequests = new Map();
KairoUtils.charset = [
    ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
];
