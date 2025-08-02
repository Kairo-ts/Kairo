import { BehaviorInitializeResponse } from "./behaviorInitializeResponse";
/**
 * 各アドオンが、ルーターからのリクエストを受け取るためのクラス
 * 受け取った initializeRequest を、そのまま BehaviorInitializeResponseへ流します
 *
 * A class responsible for receiving requests from the router in each addon.
 * Forwards the received initializeRequest directly to BehaviorInitializeResponse.
 */
export class BehaviorInitializeReceive {
    static handleScriptEventReceive(ev) {
        const { id, message } = ev;
        if (id !== "router:initializeRequest")
            return;
        this.forwardRequest();
    }
    static forwardRequest() {
        BehaviorInitializeResponse.sendResponse();
    }
}
