import { Kairo } from "./Kairo/index";
async function main() {
    Kairo.init(); // client
    Kairo.initRouter();
    await Kairo.pendingReady();
    Kairo.registerAddon();
}
main();
