import { SCRIPT_EVENT_COMMAND_IDS } from "../constants/scriptevent";
import type { KairoCommand } from "../utils/KairoUtils";
import { SystemManager } from "./SystemManager";

export interface PlayerKairoDataResponse {
    requestId: string;
    playerId: string;
    states: string[];
}

export interface PlayersKairoDataResponse {
    requestId: string;
    players: Array<{
        playerId: string;
        states: string[];
    }>;
}

interface PlayerWaiter {
    requestId: string;
    resolve: (value: PlayerKairoDataResponse) => void;
}

interface PlayersWaiter {
    requestId: string;
    resolve: (value: PlayersKairoDataResponse) => void;
}

export class systemEventReceiver {
    private playerWaiters: PlayerWaiter[] = [];
    private playersWaiters: PlayersWaiter[] = [];

    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): systemEventReceiver {
        return new systemEventReceiver(systemManager);
    }

    public handleScriptEvent(data: KairoCommand): void {
        switch (data.commandId) {
            case SCRIPT_EVENT_COMMAND_IDS.GET_PLAYER_KAIRO_DATA_RESPONSE: {
                const response: PlayerKairoDataResponse = {
                    requestId: data.requestId,
                    playerId: data.playerId,
                    states: data.states ?? [],
                };

                for (let i = this.playerWaiters.length - 1; i >= 0; i--) {
                    const waiter = this.playerWaiters[i];
                    if (!waiter) continue;

                    if (waiter.requestId === response.requestId) {
                        waiter.resolve(response);
                        this.playerWaiters.splice(i, 1);
                    }
                }

                break;
            }

            case SCRIPT_EVENT_COMMAND_IDS.GET_PLAYERS_KAIRO_DATA_RESPONSE: {
                const response: PlayersKairoDataResponse = {
                    requestId: data.requestId,
                    players: data.players ?? [],
                };

                for (let i = this.playersWaiters.length - 1; i >= 0; i--) {
                    const waiter = this.playersWaiters[i];
                    if (!waiter) continue;

                    if (waiter.requestId === response.requestId) {
                        waiter.resolve(response);
                        this.playersWaiters.splice(i, 1);
                    }
                }

                break;
            }
        }
    }

    public waitForGetPlayerKairoDataResponse(requestId: string): Promise<PlayerKairoDataResponse> {
        return new Promise((resolve) => {
            this.playerWaiters.push({ requestId, resolve });
        });
    }

    public waitForGetPlayersKairoDataResponse(
        requestId: string,
    ): Promise<PlayersKairoDataResponse> {
        return new Promise((resolve) => {
            this.playersWaiters.push({ requestId, resolve });
        });
    }
}
