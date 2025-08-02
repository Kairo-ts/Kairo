export class ConsoleManager {
    static log(message) {
        console.log(`[Werewolf][Log] ${message}`);
    }
    static warn(message) {
        console.warn(`[Werewolf][Warning] ${message}`);
    }
    static error(message) {
        console.error(`[Werewolf][Error] ${message}`);
    }
    static info(tag = "Info", message) {
        console.log(`[Werewolf][${tag}] ${message}`);
    }
}
