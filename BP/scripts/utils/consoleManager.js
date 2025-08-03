import { properties } from "../properties";
export class ConsoleManager {
    static log(message) {
        console.log(`[${properties.header.name}][Log] ${message}`);
    }
    static warn(message) {
        console.warn(`[${properties.header.name}][Warning] ${message}`);
    }
    static error(message) {
        console.error(`[${properties.header.name}][Error] ${message}`);
    }
}
