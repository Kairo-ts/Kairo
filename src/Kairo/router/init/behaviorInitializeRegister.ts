import type { AddonRouter } from "../../AddonRouter";

/**
 * 応答したアドオンを登録するためのクラス
 * 前提アドオンの有無などを調べて、追加するかどうかの判定もする
 * ※現在は応答を受け取る機能のみ実装
 * 
 * A class responsible for registering addons that have responded.
 * It checks for the presence of required addons and determines whether to add them.
 * *Currently, only the functionality for receiving responses is implemented.*
 */
export class BehaviorInitializeRegister {
    private constructor(private readonly addonRouter: AddonRouter) {}

    public static create(addonRouter: AddonRouter): BehaviorInitializeRegister {
        return new BehaviorInitializeRegister(addonRouter);
    }

    public registerAddon(): void {
        console.log(this.addonRouter.requestGetAllPendingAddons().map(addon => addon.sessionId).join(", "));
    }
}