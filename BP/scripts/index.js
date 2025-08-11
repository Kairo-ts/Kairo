import { Kairo } from "./Kairo/index";
async function main() {
    Kairo.init(); // client
    Kairo.initRouter();
    await Kairo.awaitRegistration();
    Kairo.unsubscribeInitializeHooks();
    Kairo.initSaveAddons();
    Kairo.initActivateAddons();
}
main();
