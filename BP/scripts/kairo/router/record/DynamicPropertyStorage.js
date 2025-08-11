import { world } from "@minecraft/server";
export class DynamicPropertyStorage {
    /**
     * オブジェクトをDynamicPropertyに保存
     */
    static save(keyPrefix, data) {
        const json = JSON.stringify(data);
        const totalChunks = Math.ceil(json.length / this.CHUNK_SIZE);
        for (let i = 0; i < totalChunks; i++) {
            const chunk = json.slice(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE);
            world.setDynamicProperty(`${keyPrefix}_${i}`, chunk);
        }
        world.setDynamicProperty(`${keyPrefix}_count`, totalChunks);
    }
    /**
     * DynamicPropertyからオブジェクトを読み込み
     */
    static load(keyPrefix) {
        const count = world.getDynamicProperty(`${keyPrefix}_count`);
        if (!count || count <= 0)
            return null;
        let json = "";
        for (let i = 0; i < count; i++) {
            json += world.getDynamicProperty(`${keyPrefix}_${i}`) || "";
        }
        return JSON.parse(json);
    }
    /**
     * DynamicPropertyからデータを削除
     */
    static delete(keyPrefix) {
        const count = world.getDynamicProperty(`${keyPrefix}_count`);
        if (count && count > 0) {
            for (let i = 0; i < count; i++) {
                world.setDynamicProperty(`${keyPrefix}_${i}`, undefined);
            }
        }
        world.setDynamicProperty(`${keyPrefix}_count`, undefined);
    }
}
DynamicPropertyStorage.CHUNK_SIZE = 30000;
