import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonRouter } from "../../AddonRouter";
import { SCRIPT_EVENT_IDS } from "../../constants";
import { ScoreboardManager } from "../../../utils/scoreboardManager";

/**
 * 各アドオンが、ルーターからのリクエストを受け取るためのクラス
 * 受け取った initializeRequest を、そのまま BehaviorInitializeResponseへ流します
 * 
 * A class responsible for receiving requests from the router in each addon.
 * Forwards the received initializeRequest directly to BehaviorInitializeResponse.
 */
export class BehaviorInitializeReceive {
    private constructor(private readonly addonRouter: AddonRouter) {}

    public static create(addonRouter: AddonRouter): BehaviorInitializeReceive {
        return new BehaviorInitializeReceive(addonRouter);
    }

    public handleScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message } = ev;

        switch (id) {
            case SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_REQUEST:
                this.handleInitializeRequest();
                break;
            case SCRIPT_EVENT_IDS.REQUEST_RESEED_SESSION_ID:
                this.handleRequestReseedId(message);
                break;
            case SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE:
                this.addonRouter.unsubscribeClientHooks();
                break;
        }
    }

    private handleInitializeRequest(): void {
        const addonCounter = ScoreboardManager.ensureObjective("AddonCounter");
        addonCounter.addScore("AddonCounter", 1);
        this.addonRouter.setRegistrationNum(addonCounter.getScore("AddonCounter") ?? 0);

        this.addonRouter.sendResponse();
    }

    private handleRequestReseedId(message: string): void {
        const registrationNum = this.addonRouter.getRegistrationNum();
        if (message !== registrationNum.toString()) return;

        this.addonRouter.refreshSessionId();
        this.addonRouter.sendResponse();
    }
}