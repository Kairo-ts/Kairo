import { Kairo } from "./Kairo/index";
async function main() {
    Kairo.init(); // client
    Kairo.initRouter();
    await Kairo.awaitRegistration();
    Kairo.unsubscribeInitializeHooks();
}
main();
