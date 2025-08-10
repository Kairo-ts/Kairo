import { ScoreboardObjective, world } from "@minecraft/server";
export class ScoreboardManager {
    static ensureObjective(objectiveId) {
        return world.scoreboard.getObjective(objectiveId) ?? world.scoreboard.addObjective(objectiveId);
    }
}
