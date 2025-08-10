import { Kairo } from "./Kairo/index";

async function main(): Promise<void> {
    Kairo.init(); // client
    Kairo.initRouter();

    await Kairo.awaitRegistration();
    Kairo.unsubscribeInitializeHooks();
}

main();