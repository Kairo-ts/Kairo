import { Kairo } from "./Kairo/index";

async function main(): Promise<void> {
    /**
     * DynamicPropertyをすべてクリアするメソッド (開発用)
     * アンコメントで使用してください
     * A method to clear all DynamicProperties (for development use)
     * Use by uncommenting
     */
    // DynamicPropertyStorage.clear();

    Kairo.init(); // client
    Kairo.initRouter();

    await Kairo.awaitRegistration();
    Kairo.unsubscribeInitializeHooks();

    Kairo.initSaveAddons();
    Kairo.initActivateAddons();
}

main();