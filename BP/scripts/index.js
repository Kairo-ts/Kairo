// scripts/index.ts
import { system as system12 } from "@minecraft/server";

// scripts/Kairo/index.ts
import { system as system11 } from "@minecraft/server";

// scripts/properties.ts
var properties = {
  id: "kairo",
  // a-z & 0-9 - _
  metadata: {
    /** 製作者の名前 */
    authors: ["shizuku86"]
  },
  header: {
    name: "Kairo",
    description: "Enables communication between multiple behavior packs by leveraging the ScriptAPI as a communication layer.",
    version: {
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: "dev.40"
      // build: "abc123",
    },
    min_engine_version: [1, 21, 100],
    uuid: "45826daa-bf9f-4443-b746-944a0970bfef"
  },
  resourcepack: {
    name: "Use BP Name",
    description: "Use BP Description",
    uuid: "5586bc68-ca19-4d34-9b8d-0cf522ff421d",
    module_uuid: "f9cf1b9e-5d91-477a-b9d8-b1cc6f64c335"
  },
  modules: [
    {
      type: "script",
      language: "javascript",
      entry: "scripts/index.js",
      version: "header.version",
      uuid: "1d3bfdf2-7456-435b-bacf-c94c0d7b7c64"
    }
  ],
  dependencies: [
    {
      module_name: "@minecraft/server",
      version: "2.1.0"
    },
    {
      module_name: "@minecraft/server-ui",
      version: "2.0.0"
    }
  ],
  /** 前提アドオン */
  requiredAddons: {
    /**
     * id: version (string) // "kairo": "1.0.0"
     */
  },
  tags: ["official", "stable"]
};
var supportedTags = ["official", "approved", "stable", "experimental"];

// scripts/Kairo/utils/KairoUtils.ts
import { system } from "@minecraft/server";

// scripts/Kairo/constants/scriptevent.ts
var SCRIPT_EVENT_ID_PREFIX = {
  KAIRO: "kairo"
};
var SCRIPT_EVENT_ID_SUFFIX = {
  BROADCAST: "_kBroadcast"
};
var SCRIPT_EVENT_IDS = {
  BEHAVIOR_REGISTRATION_REQUEST: "kairo:registrationRequest",
  BEHAVIOR_REGISTRATION_RESPONSE: "kairo:registrationResponse",
  BEHAVIOR_INITIALIZE_REQUEST: "kairo:initializeRequest",
  BEHAVIOR_INITIALIZATION_COMPLETE_RESPONSE: "kairo:initializationCompleteResponse",
  UNSUBSCRIBE_INITIALIZE: "kairo:unsubscribeInitialize",
  REQUEST_RESEED_SESSION_ID: "kairo:reseedSessionId",
  SHOW_ADDON_LIST: "kairo:showAddonList"
};
var SCRIPT_EVENT_MESSAGES = {
  NONE: "",
  ACTIVATE_REQUEST: "activate request",
  DEACTIVATE_REQUEST: "deactivate request"
};
var SCRIPT_EVENT_COMMAND_TYPES = {
  KAIRO_ACK: "kairo_ack",
  KAIRO_RESPONSE: "kairo_response",
  SAVE_DATA: "save_data",
  LOAD_DATA: "load_data",
  DATA_LOADED: "data_loaded",
  GET_PLAYER_KAIRO_DATA: "getPlayerKairoData",
  GET_PLAYERS_KAIRO_DATA: "getPlayersKairoData"
};

// scripts/Kairo/constants/system.ts
var KAIRO_COMMAND_TARGET_ADDON_IDS = {
  BROADCAST: "_kBroadcast",
  KAIRO: "kairo",
  KAIRO_DATAVAULT: "kairo-datavault"
};
var KAIRO_DATAVAULT_KEYS = {
  KAIRO_PLAYERS_DATA: "KairoPlayersData"
};

// scripts/Kairo/utils/KairoUtils.ts
var _KairoUtils = class _KairoUtils {
  static async sendKairoCommand(targetAddonId, commandType, data = {}, timeoutTicks = 20) {
    return this.sendInternal(targetAddonId, commandType, data, timeoutTicks, false);
  }
  static async sendKairoCommandAndWaitResponse(targetAddonId, commandType, data = {}, timeoutTicks = 20) {
    return this.sendInternal(targetAddonId, commandType, data, timeoutTicks, true);
  }
  static buildKairoResponse(data = {}, success = true, errorMessage) {
    return {
      sourceAddonId: properties.id,
      commandId: this.generateRandomId(16),
      commandType: SCRIPT_EVENT_COMMAND_TYPES.KAIRO_RESPONSE,
      data,
      success,
      ...errorMessage !== void 0 ? { errorMessage } : {}
    };
  }
  static generateRandomId(length = 8) {
    return Array.from(
      { length },
      () => this.charset[Math.floor(Math.random() * this.charset.length)]
    ).join("");
  }
  static async getPlayerKairoData(playerId) {
    const kairoResponse = await _KairoUtils.sendKairoCommandAndWaitResponse(
      KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO,
      SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYER_KAIRO_DATA,
      {
        playerId
      }
    );
    return kairoResponse.data.playerKairoData;
  }
  static async getPlayersKairoData() {
    const kairoResponse = await _KairoUtils.sendKairoCommandAndWaitResponse(
      KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO,
      SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYERS_KAIRO_DATA
    );
    return kairoResponse.data.playersKairoData;
  }
  static async saveToDataVault(key, value) {
    const type = value === null ? "null" : typeof value;
    if (type === "object" && !this.isVector3(value)) {
      throw new Error(
        `Invalid value type for saveToDataVault: expected Vector3 for object, got ${JSON.stringify(value)}`
      );
    }
    return _KairoUtils.sendKairoCommand(
      KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT,
      SCRIPT_EVENT_COMMAND_TYPES.SAVE_DATA,
      {
        type,
        key,
        value: JSON.stringify(value)
      }
    );
  }
  static async loadFromDataVault(key) {
    const kairoResponse = await _KairoUtils.sendKairoCommandAndWaitResponse(
      KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT,
      SCRIPT_EVENT_COMMAND_TYPES.LOAD_DATA,
      {
        key
      }
    );
    return kairoResponse.data.dataLoaded;
  }
  static resolvePendingRequest(commandId, response) {
    const pending = this.pendingRequests.get(commandId);
    if (!pending) return;
    this.pendingRequests.delete(commandId);
    if (pending.expectResponse && response === void 0) {
      pending.reject(
        new Error(`Kairo response expected but none received (commandId=${commandId})`)
      );
      return;
    }
    pending.resolve(response);
  }
  static rejectPendingRequest(commandId, error) {
    const pending = this.pendingRequests.get(commandId);
    if (!pending) return;
    this.pendingRequests.delete(commandId);
    pending.reject(error ?? new Error("Kairo request rejected"));
  }
  static async sendInternal(targetAddonId, commandType, data, timeoutTicks, expectResponse) {
    const kairoCommand = {
      sourceAddonId: properties.id,
      commandId: this.generateRandomId(16),
      commandType,
      data
    };
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(kairoCommand.commandId, {
        expectResponse,
        resolve,
        reject,
        timeoutTick: system.currentTick + timeoutTicks
      });
      system.sendScriptEvent(
        `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${targetAddonId}`,
        JSON.stringify(kairoCommand)
      );
    });
  }
  static onTick() {
    if (this.lastTick === system.currentTick) return;
    this.lastTick = system.currentTick;
    for (const [requestId, pending] of this.pendingRequests) {
      if (system.currentTick >= pending.timeoutTick) {
        this.pendingRequests.delete(requestId);
        pending.reject(new Error("Kairo command timeout"));
      }
    }
  }
  static isRawMessage(value) {
    if (value === null || typeof value !== "object") return false;
    const v = value;
    if (v.rawtext !== void 0) {
      if (!Array.isArray(v.rawtext)) return false;
      for (const item of v.rawtext) {
        if (!this.isRawMessage(item)) return false;
      }
    }
    if (v.score !== void 0) {
      const s = v.score;
      if (s === null || typeof s !== "object") return false;
      if (s.name !== void 0 && typeof s.name !== "string") return false;
      if (s.objective !== void 0 && typeof s.objective !== "string") return false;
    }
    if (v.text !== void 0 && typeof v.text !== "string") {
      return false;
    }
    if (v.translate !== void 0 && typeof v.translate !== "string") {
      return false;
    }
    if (v.with !== void 0) {
      const w = v.with;
      if (Array.isArray(w)) {
        if (!w.every((item) => typeof item === "string")) return false;
      } else if (!this.isRawMessage(w)) {
        return false;
      }
    }
    return true;
  }
  static isVector3(value) {
    return typeof value === "object" && value !== null && typeof value.x === "number" && typeof value.y === "number" && typeof value.z === "number" && Object.keys(value).length === 3;
  }
};
_KairoUtils.pendingRequests = /* @__PURE__ */ new Map();
_KairoUtils.charset = [
  ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
];
var KairoUtils = _KairoUtils;

// scripts/Kairo/addons/AddonPropertyManager.ts
var AddonPropertyManager = class _AddonPropertyManager {
  constructor(kairo) {
    this.kairo = kairo;
    this.self = {
      id: properties.id,
      name: properties.header.name,
      description: properties.header.description,
      sessionId: KairoUtils.generateRandomId(8),
      version: properties.header.version,
      dependencies: properties.dependencies,
      requiredAddons: properties.requiredAddons,
      tags: properties.tags
    };
  }
  static create(kairo) {
    return new _AddonPropertyManager(kairo);
  }
  getSelfAddonProperty() {
    return this.self;
  }
  refreshSessionId() {
    this.self.sessionId = KairoUtils.generateRandomId(8);
  }
};

// scripts/Kairo/addons/router/init/AddonInitializer.ts
import { system as system6, world as world5 } from "@minecraft/server";

// scripts/Kairo/utils/ScoreboardManager.ts
import { world } from "@minecraft/server";
var ScoreboardManager = class {
  static ensureObjective(objectiveId) {
    return world.scoreboard.getObjective(objectiveId) ?? world.scoreboard.addObjective(objectiveId);
  }
};

// scripts/Kairo/constants/scoreboard.ts
var SCOREBOARD_NAMES = {
  ADDON_COUNTER: "AddonCounter"
};

// scripts/Kairo/addons/router/init/AddonInitializeReceive.ts
var AddonInitializeReceive = class _AddonInitializeReceive {
  constructor(addonInitializer) {
    this.addonInitializer = addonInitializer;
    this.handleScriptEvent = (ev) => {
      const { id, message } = ev;
      const registrationNum = this.addonInitializer.getRegistrationNum();
      const isOwnMessage = message === registrationNum.toString();
      switch (id) {
        case SCRIPT_EVENT_IDS.BEHAVIOR_REGISTRATION_REQUEST:
          this.handleRegistrationRequest();
          break;
        case SCRIPT_EVENT_IDS.REQUEST_RESEED_SESSION_ID:
          if (isOwnMessage) {
            this.handleRequestReseedId();
          }
          break;
        case SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_REQUEST:
          if (isOwnMessage) {
            this.subscribeReceiverHooks();
            this.addonInitializer.sendInitializationCompleteResponse();
          }
          break;
        case SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE:
          this.addonInitializer.unsubscribeClientHooks();
          break;
      }
    };
  }
  static create(addonInitializer) {
    return new _AddonInitializeReceive(addonInitializer);
  }
  handleRegistrationRequest() {
    const addonCounter = ScoreboardManager.ensureObjective(SCOREBOARD_NAMES.ADDON_COUNTER);
    addonCounter.addScore(SCOREBOARD_NAMES.ADDON_COUNTER, 1);
    this.addonInitializer.setRegistrationNum(
      addonCounter.getScore(SCOREBOARD_NAMES.ADDON_COUNTER) ?? 0
    );
    this.addonInitializer.sendResponse();
  }
  handleRequestReseedId() {
    this.addonInitializer.refreshSessionId();
    this.addonInitializer.sendResponse();
  }
  subscribeReceiverHooks() {
    this.addonInitializer.subscribeReceiverHooks();
  }
};

// scripts/Kairo/addons/router/init/AddonInitializeRegister.ts
import { system as system2, world as world2 } from "@minecraft/server";

// scripts/Kairo/utils/ConsoleManager.ts
var ConsoleManager = class {
  static log(message) {
    console.log(`[${properties.header.name}][Log] ${message}`);
  }
  static warn(message) {
    console.warn(`[${properties.header.name}][Warning] ${message}`);
  }
  static error(message) {
    console.error(`[${properties.header.name}][Error] ${message}`);
  }
};

// scripts/Kairo/utils/VersionManager.ts
var VersionManager = class {
  static toVersionString(v) {
    let s = `${v.major}.${v.minor}.${v.patch}`;
    if (v.prerelease) s += `-${v.prerelease}`;
    if (v.build) s += `+${v.build}`;
    return s;
  }
  static toTriple(v) {
    return [v.major, v.minor, v.patch];
  }
  static fromString(ver) {
    const semverRegex = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>[0-9A-Za-z.-]+))?(?:\+(?<build>[0-9A-Za-z.-]+))?$/;
    const m = semverRegex.exec(ver);
    if (!m || !m.groups) {
      throw new Error(`Invalid semver: ${ver}`);
    }
    const g = m.groups;
    return {
      major: parseInt(g.major, 10),
      minor: parseInt(g.minor, 10),
      patch: parseInt(g.patch, 10),
      prerelease: g.prerelease,
      // string | undefined でOK
      build: g.build
      // string | undefined でOK
    };
  }
  static compare(a, b) {
    const va = this.fromString(a);
    const vb = this.fromString(b);
    if (va.major !== vb.major) return va.major - vb.major;
    if (va.minor !== vb.minor) return va.minor - vb.minor;
    if (va.patch !== vb.patch) return va.patch - vb.patch;
    if (va.prerelease && !vb.prerelease) return -1;
    if (!va.prerelease && vb.prerelease) return 1;
    if (va.prerelease && vb.prerelease) {
      return va.prerelease.localeCompare(vb.prerelease, void 0, { numeric: true });
    }
    return 0;
  }
};

// scripts/Kairo/addons/router/init/AddonInitializeRegister.ts
var AddonInitializeRegister = class _AddonInitializeRegister {
  constructor(addonInitializer) {
    this.addonInitializer = addonInitializer;
    this.registeredAddons = /* @__PURE__ */ new Map();
    this._resolveReady = null;
    this.ready = new Promise((resolve) => {
      this._resolveReady = resolve;
    });
    this.initializationCompleteCounter = 0;
    this.handleScriptEventReceive = (ev) => {
      const { id, message } = ev;
      const addonCount = world2.scoreboard.getObjective(SCOREBOARD_NAMES.ADDON_COUNTER)?.getScore(SCOREBOARD_NAMES.ADDON_COUNTER) ?? 0;
      switch (id) {
        case SCRIPT_EVENT_IDS.BEHAVIOR_REGISTRATION_RESPONSE:
          this.add(message);
          break;
        case SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZATION_COMPLETE_RESPONSE:
          this.initializationCompleteCounter += 1;
          console.log(
            `${this.initializationCompleteCounter} / ${addonCount} addons have completed initialization.`
          );
          if (this.initializationCompleteCounter === addonCount) {
            this._resolveReady?.();
            this._resolveReady = null;
            world2.scoreboard.removeObjective(SCOREBOARD_NAMES.ADDON_COUNTER);
            ConsoleManager.log("All addons initialized. Ready!");
          }
          break;
        default:
          break;
      }
    };
  }
  static create(addonInitializer) {
    return new _AddonInitializeRegister(addonInitializer);
  }
  add(message) {
    const [addonProperties, registrationNum] = JSON.parse(message);
    if (this.registeredAddons.has(addonProperties.sessionId)) {
      system2.sendScriptEvent(
        SCRIPT_EVENT_IDS.REQUEST_RESEED_SESSION_ID,
        registrationNum.toString()
      );
      return;
    }
    ConsoleManager.log(
      `Registering addon: ${addonProperties.name} - ver.${VersionManager.toVersionString(addonProperties.version)}`
    );
    this.registeredAddons.set(addonProperties.sessionId, addonProperties);
    system2.sendScriptEvent(
      SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_REQUEST,
      registrationNum.toString()
    );
  }
  has(sessionId) {
    return this.registeredAddons.has(sessionId);
  }
  get(sessionId) {
    return this.registeredAddons.get(sessionId);
  }
  getAll() {
    return Array.from(this.registeredAddons.values());
  }
};

// scripts/Kairo/addons/router/init/AddonInitializeRequest.ts
import { system as system3 } from "@minecraft/server";
var AddonInitializeRequest = class _AddonInitializeRequest {
  constructor(addonInitializer) {
    this.addonInitializer = addonInitializer;
    this.handleWorldLoad = (ev) => {
      this.sendRequest();
    };
  }
  static create(addonInitializer) {
    return new _AddonInitializeRequest(addonInitializer);
  }
  sendRequest() {
    ScoreboardManager.ensureObjective(SCOREBOARD_NAMES.ADDON_COUNTER).setScore(
      SCOREBOARD_NAMES.ADDON_COUNTER,
      0
    );
    ConsoleManager.log("World loaded. Sending core initialization request...");
    system3.sendScriptEvent(
      SCRIPT_EVENT_IDS.BEHAVIOR_REGISTRATION_REQUEST,
      SCRIPT_EVENT_MESSAGES.NONE
    );
  }
};

// scripts/Kairo/addons/router/init/AddonInitializeResponse.ts
import { system as system4, world as world3 } from "@minecraft/server";
var AddonInitializeResponse = class _AddonInitializeResponse {
  constructor(addonInitializer) {
    this.addonInitializer = addonInitializer;
  }
  static create(addonInitializer) {
    return new _AddonInitializeResponse(addonInitializer);
  }
  /**
   * scoreboard を使って登録用の識別番号も送信しておく
   * Also send the registration ID using the scoreboard
   */
  sendResponse(addonProperty) {
    system4.sendScriptEvent(
      SCRIPT_EVENT_IDS.BEHAVIOR_REGISTRATION_RESPONSE,
      JSON.stringify([
        addonProperty,
        world3.scoreboard.getObjective(SCOREBOARD_NAMES.ADDON_COUNTER)?.getScore(SCOREBOARD_NAMES.ADDON_COUNTER) ?? 0
      ])
    );
  }
  sendInitializationCompleteResponse() {
    system4.sendScriptEvent(
      SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZATION_COMPLETE_RESPONSE,
      SCRIPT_EVENT_MESSAGES.NONE
    );
  }
};

// scripts/Kairo/addons/record/DynamicPropertyStorage.ts
import { system as system5, world as world4 } from "@minecraft/server";
var DynamicPropertyStorage = class {
  /**
   * オブジェクトをDynamicPropertyに保存
   */
  static save(keyPrefix, data) {
    const json = JSON.stringify(data);
    const totalChunks = Math.ceil(json.length / this.CHUNK_SIZE);
    for (let i = 0; i < totalChunks; i++) {
      const chunk = json.slice(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE);
      world4.setDynamicProperty(`${keyPrefix}_${i}`, chunk);
    }
    world4.setDynamicProperty(`${keyPrefix}_count`, totalChunks);
  }
  /**
   * DynamicPropertyからオブジェクトを読み込み
   */
  static load(keyPrefix) {
    const count = world4.getDynamicProperty(`${keyPrefix}_count`);
    if (!count || count <= 0) return {};
    let json = "";
    for (let i = 0; i < count; i++) {
      json += world4.getDynamicProperty(`${keyPrefix}_${i}`) || "";
    }
    return JSON.parse(json);
  }
  /**
   * DynamicPropertyからデータを削除
   */
  static delete(keyPrefix) {
    const count = world4.getDynamicProperty(`${keyPrefix}_count`);
    if (count && count > 0) {
      for (let i = 0; i < count; i++) {
        world4.setDynamicProperty(`${keyPrefix}_${i}`, void 0);
      }
    }
    world4.setDynamicProperty(`${keyPrefix}_count`, void 0);
  }
  /**
   * DynamicPropertyからデータをすべて削除
   */
  static clear() {
    system5.run(() => {
      world4.clearDynamicProperties();
    });
  }
};
DynamicPropertyStorage.CHUNK_SIZE = 3e4;

// scripts/Kairo/constants/version_keywords.ts
var VERSION_KEYWORDS = {
  LATEST: "latest version",
  UNREGISTERED: "unregistered"
};

// scripts/Kairo/constants/storage.ts
var STORAGE_KEYWORDS = {
  ADDON_RECORDS: "AddonRecords"
};

// scripts/Kairo/addons/record/AddonRecord.ts
var AddonRecord = class _AddonRecord {
  constructor(addonInitializer) {
    this.addonInitializer = addonInitializer;
  }
  static create(addonInitializer) {
    return new _AddonRecord(addonInitializer);
  }
  saveAddon(addonData) {
    const addonRecords = this.loadAddons();
    const { id, name } = addonData;
    if (!addonRecords[id]) {
      addonRecords[id] = {
        name,
        description: ["0.0.0", ""],
        selectedVersion: VERSION_KEYWORDS.LATEST,
        versions: Object.keys(addonData?.versions),
        isActive: true
      };
    }
    addonRecords[id].description = addonData.description;
    addonRecords[id].selectedVersion = addonData.selectedVersion;
    addonRecords[id].isActive = addonData.isActive;
    DynamicPropertyStorage.save(STORAGE_KEYWORDS.ADDON_RECORDS, addonRecords);
  }
  saveAddons(addons) {
    const addonRecords = this.loadAddons();
    addons.forEach((addon) => {
      const { id, name, version } = addon;
      const vStr = VersionManager.toVersionString(version);
      if (!addonRecords[id]) {
        addonRecords[id] = {
          name,
          description: ["0.0.0", ""],
          selectedVersion: VERSION_KEYWORDS.LATEST,
          versions: [],
          isActive: true
        };
      }
      if (VersionManager.compare(addonRecords[id].description[0], vStr) === -1) {
        addonRecords[id].description[0] = vStr;
        addonRecords[id].description[1] = addon.description;
      }
      addonRecords[id].versions.push(vStr);
    });
    DynamicPropertyStorage.save(STORAGE_KEYWORDS.ADDON_RECORDS, addonRecords);
  }
  loadAddons() {
    return DynamicPropertyStorage.load(STORAGE_KEYWORDS.ADDON_RECORDS);
  }
};

// scripts/Kairo/addons/router/init/AddonInitializeActivator.ts
var AddonInitializeActivator = class _AddonInitializeActivator {
  constructor(addonInitializer) {
    this.addonInitializer = addonInitializer;
    this.pendingRegistration = /* @__PURE__ */ new Map();
    this.canRegisterAddons = /* @__PURE__ */ new Set();
    this.visiting = /* @__PURE__ */ new Set();
  }
  static create(addonInitializer) {
    return new _AddonInitializeActivator(addonInitializer);
  }
  initActivateAddons(addons) {
    const addonRecords = this.addonInitializer.getAddonRecords();
    Object.entries(addonRecords).forEach(([id, record]) => {
      this.initAddonData(
        id,
        record.name,
        record.description,
        record.selectedVersion,
        record.versions,
        record.isActive
      );
    });
    this.enqueuePendingRegistration(addons);
    this.updateAddonRegistrationState(addons);
    this.addonInitializer.getAddonsData().forEach((data, id) => {
      this.activateSelectedVersion(id);
      data.isEditable = !!Object.entries(data.versions).find(([version, data2]) => {
        return data2.isRegistered && data2.registrationState === "registered";
      });
      if (data.isActive) {
        const activeVersionData = data.versions[data.activeVersion];
        const sessionId = activeVersionData?.sessionId;
        if (!sessionId) return;
        this.addonInitializer.sendActiveRequest(sessionId);
      }
    });
    this.pendingRegistration.clear();
    this.canRegisterAddons.clear();
    this.visiting.clear();
  }
  initAddonData(id, name, description, selectedVersion, versions, isActive) {
    const sortedVersions = versions.sort((a, b) => VersionManager.compare(b, a));
    const addonData = {
      id,
      name,
      description,
      isActive,
      isEditable: false,
      selectedVersion,
      activeVersion: "",
      versions: {}
    };
    sortedVersions.forEach((version) => {
      addonData.versions[version] = {
        isRegistered: false,
        registrationState: "unregistered"
      };
    });
    this.addonInitializer.getAddonsData().set(id, addonData);
    const pendingData = {
      id,
      isActive,
      selectedVersion,
      versions: {}
    };
    this.pendingRegistration.set(id, pendingData);
  }
  enqueuePendingRegistration(addons) {
    addons.forEach((addon) => {
      const pendingData = this.pendingRegistration.get(addon.id);
      if (!pendingData) return;
      const version = VersionManager.toVersionString(addon.version);
      pendingData.versions[version] = {
        isRegistered: true,
        requiredAddons: addon.requiredAddons ?? {}
      };
    });
  }
  updateAddonRegistrationState(addons) {
    addons.forEach((addon) => {
      const addonData = this.addonInitializer.getAddonsData().get(addon.id);
      if (!addonData) return;
      const version = VersionManager.toVersionString(addon.version);
      const isRegisterable = this.checkRequiredAddons(
        addon.id,
        version,
        addon.requiredAddons
      );
      let registrationState = isRegisterable ? "registered" : "missing_requiredAddons";
      addonData.versions[version] = {
        isRegistered: isRegisterable,
        canInitActivate: this.checkRequiredAddonsForActivation(addon.requiredAddons),
        registrationState,
        sessionId: addon.sessionId,
        tags: addon.tags,
        dependencies: addon.dependencies,
        requiredAddons: addon.requiredAddons
      };
    });
  }
  checkRequiredAddons(id, version, requiredAddons) {
    const selfKey = this.makeKey(id, version);
    if (this.canRegisterAddons.has(selfKey)) return true;
    if (this.visiting.has(selfKey)) return false;
    this.visiting.add(selfKey);
    try {
      for (const [requiredId, requiredVersion] of Object.entries(requiredAddons)) {
        const requiredAddonData = this.pendingRegistration.get(requiredId);
        if (!requiredAddonData) return false;
        const isRequiredRegistered = Object.entries(requiredAddonData.versions).some(
          ([candidateVersion, data]) => {
            const requiredAddons2 = data.requiredAddons;
            if (!requiredAddons2) return false;
            if (!data.isRegistered) return false;
            return VersionManager.compare(candidateVersion, requiredVersion) >= 0 && this.checkRequiredAddons(
              requiredAddonData.id,
              candidateVersion,
              requiredAddons2
            );
          }
        );
        if (!isRequiredRegistered) return false;
      }
      this.canRegisterAddons.add(selfKey);
      return true;
    } finally {
      this.visiting.delete(selfKey);
    }
  }
  checkRequiredAddonsForActivation(requiredAddons) {
    for (const [requiredId, requiredVersion] of Object.entries(requiredAddons)) {
      const requiredAddonData = this.pendingRegistration.get(requiredId);
      if (!requiredAddonData) return false;
      if (!requiredAddonData.isActive) return false;
      const requiredSelectedVersion = requiredAddonData.selectedVersion === VERSION_KEYWORDS.LATEST ? this.getLatestPreferStableVersionInPending(requiredId) : requiredAddonData.selectedVersion;
      if (!requiredSelectedVersion) return false;
      const isVersionGreater = VersionManager.compare(requiredSelectedVersion, requiredVersion) >= 0;
      if (!isVersionGreater) return false;
    }
    return true;
  }
  makeKey(id, version) {
    return `${id}@${version}`;
  }
  getLatestPreferStableVersionInPending(id) {
    const addonData = this.pendingRegistration.get(id);
    if (!addonData) return void 0;
    const sorted = Object.keys(addonData.versions).filter((v) => addonData.versions[v]).sort((a, b) => VersionManager.compare(b, a));
    if (sorted.length === 0) return void 0;
    const stable = sorted.find((v) => !VersionManager.fromString(v).prerelease);
    return stable ?? sorted[0];
  }
  activateLatestVersion(id) {
    const addonData = this.addonInitializer.getAddonsData().get(id);
    if (!addonData) return;
    const sorted = Object.keys(addonData.versions).filter(
      (v) => addonData.versions[v]?.isRegistered && addonData.versions[v]?.canInitActivate
    ).sort((a, b) => VersionManager.compare(b, a));
    if (sorted.length === 0) return;
    const stable = sorted.find((v) => !VersionManager.fromString(v).prerelease);
    const activeVersion = stable ?? sorted[0];
    this.initActivation(addonData, activeVersion);
  }
  activateSelectedVersion(id) {
    const addonData = this.addonInitializer.getAddonsData().get(id);
    if (!addonData) return;
    if (!addonData.isActive) return;
    if (addonData.selectedVersion === VERSION_KEYWORDS.LATEST) {
      this.activateLatestVersion(id);
      return;
    }
    const selectedVersion = Object.keys(addonData.versions).find(
      (v) => v === addonData.selectedVersion && addonData.versions[v]?.isRegistered && addonData.versions[v]?.canInitActivate
    );
    if (!selectedVersion) return;
    this.initActivation(addonData, selectedVersion);
  }
  initActivation(addonData, activeVersion) {
    addonData.activeVersion = activeVersion;
    addonData.isActive = true;
  }
};

// scripts/Kairo/addons/router/init/AddonInitializer.ts
var AddonInitializer = class _AddonInitializer {
  constructor(kairo) {
    this.kairo = kairo;
    this.registrationNum = 0;
    this.activator = AddonInitializeActivator.create(this);
    this.receive = AddonInitializeReceive.create(this);
    this.register = AddonInitializeRegister.create(this);
    this.request = AddonInitializeRequest.create(this);
    this.response = AddonInitializeResponse.create(this);
    this.record = AddonRecord.create(this);
  }
  static create(kairo) {
    return new _AddonInitializer(kairo);
  }
  subscribeClientHooks() {
    system6.afterEvents.scriptEventReceive.subscribe(this.receive.handleScriptEvent);
  }
  unsubscribeClientHooks() {
    system6.afterEvents.scriptEventReceive.unsubscribe(this.receive.handleScriptEvent);
  }
  getSelfAddonProperty() {
    return this.kairo.getSelfAddonProperty();
  }
  refreshSessionId() {
    return this.kairo.refreshSessionId();
  }
  sendResponse() {
    const selfAddonProperty = this.getSelfAddonProperty();
    this.response.sendResponse(selfAddonProperty);
  }
  setRegistrationNum(num) {
    this.registrationNum = num;
  }
  getRegistrationNum() {
    return this.registrationNum;
  }
  sendInitializationCompleteResponse() {
    this.response.sendInitializationCompleteResponse();
  }
  /**
   * WorldLoadとScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
   * Add BehaviorInitialize handles to WorldLoad and ScriptEventReceive
   */
  subscribeCoreHooks() {
    world5.afterEvents.worldLoad.subscribe(this.request.handleWorldLoad);
    system6.afterEvents.scriptEventReceive.subscribe(this.register.handleScriptEventReceive);
  }
  unsubscribeCoreHooks() {
    world5.afterEvents.worldLoad.unsubscribe(this.request.handleWorldLoad);
    system6.afterEvents.scriptEventReceive.unsubscribe(this.register.handleScriptEventReceive);
  }
  getAllPendingAddons() {
    return this.register.getAll();
  }
  awaitRegistration() {
    return this.register.ready;
  }
  saveAddon(addonData) {
    this.record.saveAddon(addonData);
  }
  saveAddons() {
    this.record.saveAddons(this.register.getAll());
  }
  getAddonsData() {
    return this.kairo.getAddonsData();
  }
  getAddonRecords() {
    return this.record.loadAddons();
  }
  getRegisteredAddons() {
    return this.register.getAll();
  }
  subscribeReceiverHooks() {
    this.kairo.subscribeReceiverHooks();
  }
  sendActiveRequest(sessionId) {
    this.kairo.sendActiveRequest(sessionId);
  }
  sendDeactiveRequest(sessionId) {
    this.kairo.sendDeactiveRequest(sessionId);
  }
  initActivateAddons(addons) {
    this.activator.initActivateAddons(addons);
  }
};

// scripts/Kairo/addons/router/AddonActivator.ts
import { system as system7, world as world6 } from "@minecraft/server";

// scripts/Kairo/constants/translate.ts
var KAIRO_TRANSLATE_IDS = {
  ADDON_ACTIVE: "kairo.addon.active",
  ADDON_DEACTIVE: "kairo.addon.deactive",
  ADDON_CHANGE_VERSION: "kairo.addon.changeVersion",
  ADDON_LIST_TITLE: "kairo.addonList.title",
  ADDON_LIST_ACTIVE: "kairo.addonList.active",
  ADDON_LIST_INACTIVE: "kairo.addonList.inactive",
  ADDON_SETTING_LATEST_VERSION: "kairo.addonSetting.latestVersion",
  ADDON_SETTING_REQUIRED: "kairo.addonSetting.required",
  ADDON_SETTING_NONE_REQUIRED: "kairo.addonSetting.noneRequired",
  ADDON_SETTING_ACTIVE: "kairo.addonSetting.active",
  ADDON_SETTING_SELECTED: "kairo.addonSetting.selected",
  ADDON_SETTING_UNINSTALLED: "kairo.addonSetting.uninstalled",
  ADDON_SETTING_MISSING_REQUIRED: "kairo.addonSetting.missing.required",
  ADDON_SETTING_REGISTERED_ADDON_LIST: "kairo.addonSetting.registeredAddonList",
  ADDON_SETTING_SELECT_VERSION: "kairo.addonSetting.selectVersion",
  ADDON_SETTING_ACTIVATE: "kairo.addonSetting.activate",
  ADDON_SETTING_SUBMIT: "kairo.addonSetting.submit",
  ADDON_SETTING_REQUIRED_TITLE: "kairo.addonSetting.required.title",
  ADDON_SETTING_REQUIRED_ACTIVATION_BODY: "kairo.addonSetting.required.activation.body",
  ADDON_SETTING_REQUIRED_DEACTIVATION_BODY: "kairo.addonSetting.required.deactivation.body",
  ADDON_SETTING_REQUIRED_ACTIVE_CONFIRM: "kairo.addonSetting.required.active.confirm",
  ADDON_SETTING_REQUIRED_DEACTIVE_CONFIRM: "kairo.addonSetting.required.deactive.confirm",
  ADDON_SETTING_REQUIRED_CANCEL: "kairo.addonSetting.required.cancel",
  ERROR_FORM_TITLE: "kairo.errorForm.title",
  ERROR_FORM_HEADER: "kairo.errorForm.header",
  ERROR_FORM_FOOTER: "kairo.errorForm.footer"
};

// scripts/Kairo/addons/router/AddonRequireValidator.ts
import "@minecraft/server";

// scripts/Kairo/utils/ErrorManager.ts
import { ActionFormData } from "@minecraft/server-ui";

// scripts/Kairo/constants/error.ts
var ErrorDetails = {
  kairo_error_not_found: {
    errorMessageId: "kairo.error.not.found.message",
    errorHintId: "kairo.error.not.found.hint",
    errorCode: "E000001"
  },
  kairo_resolve_for_activation_error: {
    errorMessageId: "kairo.error.resolve.for.activation.message",
    errorHintId: "kairo.error.resolve.for.activation.hint",
    errorCode: "E100001"
  },
  kairo_resolve_for_deactivation_error: {
    errorMessageId: "kairo.error.resolve.for.deactivation.message",
    errorHintId: "kairo.error.resolve.for.deactivation.hint",
    errorCode: "E100002"
  }
};

// scripts/Kairo/utils/ErrorManager.ts
var ErrorManager = class {
  static async showErrorDetails(player, errorId) {
    const errorDetail = ErrorDetails[errorId];
    if (!errorDetail) {
      return this.showErrorDetails(player, "kairo_error_not_found");
    }
    const errorForm = new ActionFormData().title({ translate: KAIRO_TRANSLATE_IDS.ERROR_FORM_TITLE }).header({ translate: KAIRO_TRANSLATE_IDS.ERROR_FORM_HEADER }).label({ text: `[ ${errorDetail.errorCode} ]` }).divider().label({
      rawtext: [
        { translate: errorDetail.errorMessageId },
        { text: "\n\n" },
        { translate: errorDetail.errorHintId }
      ]
    }).divider().label({
      translate: KAIRO_TRANSLATE_IDS.ERROR_FORM_FOOTER,
      with: [errorDetail.errorCode]
    });
    const { selection, canceled } = await errorForm.show(player);
    if (canceled) return;
  }
};

// scripts/Kairo/addons/router/AddonRequireValidatorForDeactivation.ts
import { MessageFormData } from "@minecraft/server-ui";
var AddonRequireValidatorForDeactivation = class _AddonRequireValidatorForDeactivation {
  constructor(requireValidator) {
    this.requireValidator = requireValidator;
    this.deactivationQueue = /* @__PURE__ */ new Map();
    this.visited = /* @__PURE__ */ new Set();
    this.visiting = /* @__PURE__ */ new Set();
  }
  static create(requireValidator) {
    return new _AddonRequireValidatorForDeactivation(requireValidator);
  }
  /**
   * length = 0: cancel or error
   * length > 0: success
   */
  async validateRequiredAddonsForDeactivation(player, addonData, newVersion = addonData.activeVersion) {
    this.clearDeactivationQueue();
    const isResolved = this.resolveRequiredAddonsForDeactivation(addonData, newVersion);
    try {
      if (!isResolved) {
        ErrorManager.showErrorDetails(player, "kairo_resolve_for_deactivation_error");
        return [];
      }
      if (this.deactivationQueue.size > 1) {
        const rootAddonId = addonData.id;
        const queueAddonList = Array.from(this.deactivationQueue.values()).filter((addonData2) => addonData2.id !== rootAddonId).map((addonData2) => `\u30FB${addonData2.name} (ver.${addonData2.activeVersion})`).join("\n");
        const messageForm = new MessageFormData().title({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_TITLE }).body({
          translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_DEACTIVATION_BODY,
          with: [queueAddonList]
        }).button1({
          translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_DEACTIVE_CONFIRM
        }).button2({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_CANCEL });
        const { selection, canceled } = await messageForm.show(player);
        if (canceled || selection === void 0 || selection === 1) {
          return [];
        }
        return [...this.deactivationQueue.keys()];
      }
      return [addonData.id];
    } finally {
      this.clearDeactivationQueue();
    }
  }
  resolveRequiredAddonsForDeactivation(addonData, newVersion = addonData.activeVersion) {
    if (VersionManager.compare(addonData.activeVersion, newVersion) < 0) {
      this.visited.add(addonData.id);
      return true;
    }
    if (this.visited.has(addonData.id)) return true;
    if (this.isInactive(addonData)) {
      this.visited.add(addonData.id);
      return true;
    }
    if (this.visiting.has(addonData.id)) {
      ConsoleManager.error(`Cycle detected while deactivating: ${addonData.id}`);
      return false;
    }
    this.visiting.add(addonData.id);
    try {
      const addonsData = this.requireValidator.getAddonsData();
      for (const data of addonsData.values()) {
        if (this.isInactive(data)) continue;
        const activeVersionData = data.versions[data.activeVersion];
        const requiredAddons = activeVersionData?.requiredAddons;
        if (!requiredAddons) {
          ConsoleManager.error(
            `Addon data corrupted: ${data.id}@${data.activeVersion}, missing required addons`
          );
          return false;
        }
        const requiredVersion = requiredAddons[addonData.id];
        if (requiredVersion !== void 0) {
          if (newVersion === addonData.activeVersion) {
            const isResolved = this.resolveRequiredAddonsForDeactivation(data);
            if (!isResolved) return false;
          } else if (VersionManager.compare(newVersion, requiredVersion) < 0) {
            const isResolved = this.resolveRequiredAddonsForDeactivation(data);
            if (!isResolved) return false;
          }
        }
      }
      this.visited.add(addonData.id);
      this.deactivationQueue.set(addonData.id, addonData);
      return true;
    } finally {
      this.visiting.delete(addonData.id);
    }
  }
  isInactive(addonData) {
    const queued = this.deactivationQueue.has(addonData.id);
    if (queued) return true;
    if (!addonData) return false;
    return !addonData.isActive;
  }
  clearDeactivationQueue() {
    this.deactivationQueue.clear();
    this.visited.clear();
    this.visiting.clear();
  }
};

// scripts/Kairo/addons/router/AddonRequireValidatorForActivation.ts
import { MessageFormData as MessageFormData2 } from "@minecraft/server-ui";
var AddonRequireValidatorForActivation = class _AddonRequireValidatorForActivation {
  constructor(requireValidator) {
    this.requireValidator = requireValidator;
    this.activationQueue = /* @__PURE__ */ new Map();
    this.visited = /* @__PURE__ */ new Map();
    this.visiting = /* @__PURE__ */ new Set();
  }
  static create(requireValidator) {
    return new _AddonRequireValidatorForActivation(requireValidator);
  }
  async validateRequiredAddonsForActivation(player, addonData, newVersion) {
    this.clearActivationQueue();
    const isResolved = this.resolveRequiredAddonsForActivation(addonData, newVersion);
    try {
      if (!isResolved) {
        ErrorManager.showErrorDetails(player, "kairo_resolve_for_activation_error");
        return [];
      }
      if (this.activationQueue.size > 1) {
        const rootAddonId = addonData.id;
        const queueAddonList = Array.from(this.activationQueue.values()).filter(({ addonData: addonData2 }) => addonData2.id !== rootAddonId).map(({ addonData: addonData2, version }) => `\u30FB${addonData2.name} (ver.${version})`).join("\n");
        const messageForm = new MessageFormData2().title({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_TITLE }).body({
          translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_ACTIVATION_BODY,
          with: [queueAddonList]
        }).button1({
          translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_ACTIVE_CONFIRM
        }).button2({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_CANCEL });
        const { selection, canceled } = await messageForm.show(player);
        if (canceled || selection === void 0 || selection === 1) {
          return [];
        }
        return [...this.activationQueue.keys()];
      }
      return [addonData.id];
    } finally {
      this.clearActivationQueue();
    }
  }
  resolveRequiredAddonsForActivation(addonData, newVersion) {
    const newActiveVersion = newVersion === VERSION_KEYWORDS.LATEST ? this.requireValidator.getLatestVersion(addonData.id) : newVersion;
    if (newActiveVersion === void 0) return false;
    if (this.visited.has(addonData.id)) {
      const visitedVersion = this.visited.get(addonData.id);
      if (visitedVersion && VersionManager.compare(visitedVersion, newActiveVersion) >= 0) {
        return true;
      }
    }
    if (this.visiting.has(addonData.id)) {
      ConsoleManager.error(`Cycle detected while activating: ${addonData.id}`);
      return false;
    }
    this.visiting.add(addonData.id);
    try {
      const newActiveVersionData = addonData.versions[newActiveVersion];
      if (!newActiveVersionData) return false;
      const requiredAddons = newActiveVersionData.requiredAddons ?? {};
      const addonsData = this.requireValidator.getAddonsData();
      for (const [id, version] of Object.entries(requiredAddons)) {
        const requiredAddon = addonsData.get(id);
        if (!requiredAddon) {
          ConsoleManager.error(
            `Addon data corrupted: parent=${addonData.id}@${newActiveVersion}, missing required=${id}@${version}`
          );
          return false;
        }
        if (!this.isAddonActive(requiredAddon, version)) {
          const requireLatestStableVersion = this.requireValidator.getLatestPreferStableVersion(id);
          if (!requireLatestStableVersion) {
            ConsoleManager.error(
              `Addon data corrupted: missing required=${id}@${version}`
            );
            return false;
          }
          if (VersionManager.compare(requireLatestStableVersion, version) < 0) {
            const requireLatestVersion = this.requireValidator.getLatestVersion(id);
            if (!requireLatestVersion || VersionManager.compare(requireLatestVersion, version) < 0) {
              ConsoleManager.error(
                `Addon data corrupted: missing required=${id}@${version}`
              );
              return false;
            }
            const isResolved = this.resolveRequiredAddonsForActivation(
              requiredAddon,
              requireLatestVersion
            );
            if (!isResolved) return false;
          } else {
            const isResolved = this.resolveRequiredAddonsForActivation(
              requiredAddon,
              requireLatestStableVersion
            );
            if (!isResolved) return false;
          }
        }
      }
      const prev = this.activationQueue.get(addonData.id);
      if (!prev || VersionManager.compare(newActiveVersion, prev.version) > 0) {
        this.activationQueue.set(addonData.id, { addonData, version: newActiveVersion });
      }
      this.visited.set(addonData.id, newActiveVersion);
      return true;
    } finally {
      this.visiting.delete(addonData.id);
    }
  }
  isAddonActive(addonData, version) {
    const queued = this.activationQueue.get(addonData.id);
    if (queued && VersionManager.compare(queued.version, version) >= 0) return true;
    if (!addonData) return false;
    if (!addonData.isActive) return false;
    return VersionManager.compare(addonData.activeVersion, version) >= 0;
  }
  clearActivationQueue() {
    this.activationQueue.clear();
    this.visited.clear();
    this.visiting.clear();
  }
};

// scripts/Kairo/addons/router/AddonRequireValidator.ts
var AddonRequireValidator = class _AddonRequireValidator {
  constructor(addonActivator) {
    this.addonActivator = addonActivator;
    this.forActivation = AddonRequireValidatorForActivation.create(this);
    this.forDeactivation = AddonRequireValidatorForDeactivation.create(this);
  }
  static create(addonActivator) {
    return new _AddonRequireValidator(addonActivator);
  }
  async validateRequiredAddonsForActivation(player, addonData, newVersion) {
    return this.forActivation.validateRequiredAddonsForActivation(
      player,
      addonData,
      newVersion
    );
  }
  async validateRequiredAddonsForDeactivation(player, addonData, newVersion = addonData.activeVersion) {
    return this.forDeactivation.validateRequiredAddonsForDeactivation(
      player,
      addonData,
      newVersion
    );
  }
  async validateRequiredAddons(player, addonData, newVersion, isActive) {
    if (isActive)
      this.forActivation.validateRequiredAddonsForActivation(player, addonData, newVersion);
    else this.forDeactivation.validateRequiredAddonsForDeactivation(player, addonData);
  }
  getAddonsData() {
    return this.addonActivator.getAddonsData();
  }
  getLatestPreferStableVersion(id) {
    return this.addonActivator.getLatestPreferStableVersion(id);
  }
  getLatestVersion(id) {
    return this.addonActivator.getLatestVersion(id);
  }
};

// scripts/Kairo/addons/router/AddonActivator.ts
var AddonActivator = class _AddonActivator {
  constructor(addonManager) {
    this.addonManager = addonManager;
    this.addonRequireValidator = AddonRequireValidator.create(this);
  }
  static create(addonManager) {
    return new _AddonActivator(addonManager);
  }
  async activateAddon(player, addonData, version) {
    const activateAddonIds = await this.addonRequireValidator.validateRequiredAddonsForActivation(
      player,
      addonData,
      version
    );
    if (activateAddonIds.length === 0) return;
    const addonsData = this.getAddonsData();
    for (const id of activateAddonIds) {
      const data = addonsData.get(id);
      if (data) {
        data.isActive = true;
        if (data.id === addonData.id) data.selectedVersion = version;
        else data.selectedVersion = VERSION_KEYWORDS.LATEST;
        const newActiveVersion = data.selectedVersion === VERSION_KEYWORDS.LATEST ? this.addonManager.getLatestPreferStableVersion(data.id) : data.selectedVersion;
        if (newActiveVersion === void 0) continue;
        const compare = VersionManager.compare(data.activeVersion, newActiveVersion);
        if (compare < 0) {
          const oldActiveVersionData = data.versions[data.activeVersion];
          const oldSessionId = oldActiveVersionData?.sessionId;
          if (oldSessionId) this.sendDeactiveRequest(oldSessionId);
        } else if (compare > 0) {
          const deactivateAddonIds = await this.addonRequireValidator.validateRequiredAddonsForDeactivation(
            player,
            data,
            newActiveVersion
          );
          this.deactivateAddons(deactivateAddonIds);
        }
        data.activeVersion = newActiveVersion;
        const newActiveVersionData = data.versions[data.activeVersion];
        const newSessionId = newActiveVersionData?.sessionId;
        if (newSessionId) this.sendActiveRequest(newSessionId);
        world6.sendMessage({
          translate: KAIRO_TRANSLATE_IDS.ADDON_ACTIVE,
          with: [data.name, newActiveVersion]
        });
        this.addonManager.saveAddon(data);
      }
    }
  }
  async deactivateAddon(player, addonData) {
    const deactivateAddonIds = await this.addonRequireValidator.validateRequiredAddonsForDeactivation(
      player,
      addonData
    );
    this.deactivateAddons(deactivateAddonIds);
  }
  deactivateAddons(addonIds) {
    const addonsData = this.getAddonsData();
    for (const id of addonIds) {
      const data = addonsData.get(id);
      if (data) {
        data.isActive = false;
        const activeVersionData = data.versions[data.activeVersion];
        const sessionId = activeVersionData?.sessionId;
        if (sessionId) this.sendDeactiveRequest(sessionId);
        world6.sendMessage({
          translate: KAIRO_TRANSLATE_IDS.ADDON_DEACTIVE,
          with: [data.name]
        });
        this.addonManager.saveAddon(data);
      }
    }
  }
  getAddonsData() {
    return this.addonManager.getAddonsData();
  }
  sendActiveRequest(sessionId) {
    system7.sendScriptEvent(
      `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${sessionId}`,
      SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST
    );
  }
  sendDeactiveRequest(sessionId) {
    system7.sendScriptEvent(
      `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${sessionId}`,
      SCRIPT_EVENT_MESSAGES.DEACTIVATE_REQUEST
    );
  }
  getLatestPreferStableVersion(id) {
    return this.addonManager.getLatestPreferStableVersion(id);
  }
  getLatestVersion(id) {
    return this.addonManager.getLatestVersion(id);
  }
};

// scripts/Kairo/addons/AddonManager.ts
import { system as system10 } from "@minecraft/server";

// scripts/Kairo/addons/ui/AddonList.ts
import { ActionFormData as ActionFormData2, ModalFormData } from "@minecraft/server-ui";
var AddonList = class _AddonList {
  constructor(addonManager) {
    this.addonManager = addonManager;
    this.handleScriptEvent = (ev) => {
      const { id, message, sourceEntity } = ev;
      if (sourceEntity?.typeId !== "minecraft:player") return;
      if (id === SCRIPT_EVENT_IDS.SHOW_ADDON_LIST) {
        this.showAddonList(sourceEntity);
      }
    };
  }
  static create(addonManager) {
    return new _AddonList(addonManager);
  }
  async showAddonList(player) {
    const addonsData = Array.from(this.addonManager.getAddonsData());
    const addonListForm = new ActionFormData2();
    addonListForm.title({ translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_TITLE });
    addonsData.forEach(([id, data]) => {
      const isActive = data.isActive ? { translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_ACTIVE } : { translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_INACTIVE };
      addonListForm.button(
        {
          rawtext: [
            { text: `\xA7l\xA78${data.name}\xA7r
` },
            isActive,
            { text: ` \xA78(${data.selectedVersion})\xA7r` }
          ]
        },
        `textures/${id}/pack_icon`
      );
    });
    const { selection, canceled: listFormCanceled } = await addonListForm.show(player);
    if (listFormCanceled || selection === void 0) return;
    const selectedAddon = addonsData[selection];
    if (!selectedAddon) return;
    this.formatAddonDataForDisplay(player, selectedAddon[1]);
  }
  async formatAddonDataForDisplay(player, addonData) {
    const entries = Object.entries(addonData.versions);
    const isActive = addonData.isActive ? { translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_ACTIVE } : { translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_INACTIVE };
    const selectedVersion = addonData.isEditable ? addonData.selectedVersion === VERSION_KEYWORDS.LATEST ? [
      { text: " \xA77|\xA7r " },
      { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_LATEST_VERSION },
      { text: ` (ver.${addonData.activeVersion})` }
    ] : [{ text: " \xA77|\xA7r " }, { text: `ver.${addonData.selectedVersion}` }] : [];
    const tags = addonData.versions[addonData.activeVersion]?.tags || [];
    const lineBreak = tags.length > 0 ? [{ text: "\n\xA77\xA7o" }] : [];
    const activeVersionTags = tags.flatMap((tag, index) => {
      const element = supportedTags.includes(tag) ? { translate: `kairo.tags.${tag}` } : { text: tag };
      if (index < tags.length - 1) {
        return [element, { text: ", " }];
      }
      return [element];
    });
    const requiredAddons = Object.entries(
      addonData.versions[addonData.activeVersion]?.requiredAddons || {}
    );
    const requiredAddonsRawtext = requiredAddons.length > 0 ? {
      rawtext: [
        { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED },
        { text: "\n" },
        ...requiredAddons.flatMap(([name, version], i, arr) => {
          const elements = [{ text: `\xA7f${name}\xA7r \xA77- (ver.${version})\xA7r` }];
          if (i < arr.length - 1) {
            elements.push({ text: "\n" });
          }
          return elements;
        })
      ]
    } : {
      rawtext: [
        { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED },
        { text: "\n" },
        { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_NONE_REQUIRED }
      ]
    };
    const versionListRawtext = entries.flatMap(([version, data]) => {
      let versionRawtext = [];
      switch (data.registrationState) {
        case "registered":
          versionRawtext.push({ text: `\xA7f${version}\xA7r ` });
          break;
        case "unregistered":
        case "missing_requiredAddons":
          versionRawtext.push({ text: `\xA77${version}\xA7r ` });
          break;
      }
      switch (version) {
        case addonData.activeVersion:
          versionRawtext.push({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_ACTIVE });
          break;
        case addonData.selectedVersion:
          versionRawtext.push({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_SELECTED });
          break;
      }
      switch (data.registrationState) {
        case "registered":
          break;
        case "unregistered":
          versionRawtext.push({
            translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_UNINSTALLED
          });
          break;
        case "missing_requiredAddons":
          versionRawtext.push({
            translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_MISSING_REQUIRED
          });
          break;
      }
      versionRawtext.push({ text: "\n" });
      return versionRawtext;
    });
    const addonDataRawtexts = {
      name: { translate: `${addonData.id}.name` },
      description: { translate: `${addonData.id}.description` },
      details: {
        rawtext: [
          isActive,
          ...selectedVersion,
          ...lineBreak,
          ...activeVersionTags,
          { text: "\xA7r" }
        ]
      },
      required: { rawtext: [requiredAddonsRawtext] },
      versionList: {
        rawtext: [
          { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REGISTERED_ADDON_LIST },
          { text: "\n" },
          ...versionListRawtext
        ]
      },
      selectVersion: { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_SELECT_VERSION },
      activate: { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_ACTIVATE },
      submit: { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_SUBMIT }
    };
    if (addonData.isEditable) this.settingAddonDataForm(player, addonData, addonDataRawtexts);
    else this.showAddonDataForm(player, addonDataRawtexts);
  }
  async settingAddonDataForm(player, addonData, addonDataRawtexts) {
    const entries = Object.entries(addonData.versions);
    const registeredVersions = [
      ...entries.filter(([version, data]) => data.isRegistered).map(([version]) => version)
    ];
    const selectableVersions = [VERSION_KEYWORDS.LATEST, ...registeredVersions];
    let selectedVersionIndex = selectableVersions.indexOf(addonData.selectedVersion);
    if (selectedVersionIndex === -1) selectedVersionIndex = 0;
    const selectableVersionsRawtexts = [
      { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_LATEST_VERSION },
      ...registeredVersions.map((version) => ({ text: version }))
    ];
    const currentActiveState = addonData.isActive;
    const addonDataForm = new ModalFormData().title(addonDataRawtexts.name).header(addonDataRawtexts.name).label(addonDataRawtexts.description).label(addonDataRawtexts.details).divider().label(addonDataRawtexts.versionList).divider().label(addonDataRawtexts.required).divider().dropdown(addonDataRawtexts.selectVersion, selectableVersionsRawtexts, {
      defaultValueIndex: selectedVersionIndex
    }).toggle(addonDataRawtexts.activate, { defaultValue: currentActiveState }).submitButton(addonDataRawtexts.submit);
    const { formValues, canceled } = await addonDataForm.show(player);
    if (canceled || formValues === void 0) return;
    const newVersionIndex = Number(formValues[8]);
    const newSelectedVersion = selectableVersions[newVersionIndex];
    if (newSelectedVersion === void 0) return;
    const newActiveState = formValues[9];
    if (currentActiveState === true && newActiveState === false) {
      this.addonManager.deactivateAddon(player, addonData);
    } else if (currentActiveState === false && newActiveState === true || newVersionIndex !== selectedVersionIndex) {
      this.addonManager.activateAddon(player, addonData, newSelectedVersion);
    }
  }
  async showAddonDataForm(player, addonDataRawtexts) {
    const addonDataForm = new ActionFormData2().title(addonDataRawtexts.name).header(addonDataRawtexts.name).label(addonDataRawtexts.description).label(addonDataRawtexts.details).divider().label(addonDataRawtexts.versionList).divider().label(addonDataRawtexts.required);
    const { selection, canceled } = await addonDataForm.show(player);
    if (canceled || selection === void 0) return;
  }
};

// scripts/Kairo/addons/router/AddonReceiver.ts
import { system as system8 } from "@minecraft/server";
var AddonReceiver = class _AddonReceiver {
  constructor(addonManager) {
    this.addonManager = addonManager;
    this.handleScriptEvent = async (ev) => {
      const { id, message } = ev;
      const addonProperty = this.addonManager.getSelfAddonProperty();
      if (id !== `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${addonProperty.sessionId}`) return;
      if (this.addonManager.isActive === false) {
        if (message !== SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST) return;
      }
      switch (message) {
        case SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST:
          this.addonManager._activateAddon();
          break;
        case SCRIPT_EVENT_MESSAGES.DEACTIVATE_REQUEST:
          this.addonManager._deactivateAddon();
          break;
        default:
          let data;
          try {
            data = JSON.parse(message);
          } catch (e) {
            ConsoleManager.warn(`[ScriptEventReceiver] Invalid JSON: ${message}`);
            return;
          }
          if (typeof data.sourceAddonId !== "string") return;
          if (typeof data.commandType !== "string") return;
          if (data.ackFor && typeof data.ackFor === "string") {
            KairoUtils.resolvePendingRequest(data.ackFor, data.response);
            return;
          }
          if (typeof data.commandId !== "string") return;
          if (!data || typeof data !== "object") return;
          const command = data;
          const response = await this.addonManager._scriptEvent(command);
          system8.sendScriptEvent(
            `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${command.sourceAddonId}`,
            JSON.stringify({
              sourceAddonId: properties.id,
              commandType: SCRIPT_EVENT_COMMAND_TYPES.KAIRO_ACK,
              ackFor: command.commandId,
              response
            })
          );
          break;
      }
    };
  }
  static create(addonManager) {
    return new _AddonReceiver(addonManager);
  }
};

// scripts/Kairo/addons/router/AddonRouter.ts
import { system as system9 } from "@minecraft/server";
var AddonRouter = class _AddonRouter {
  constructor(addonManager) {
    this.addonManager = addonManager;
    this.handleScriptEvent = (ev) => {
      const { id, message } = ev;
      const splitId = id.split(":");
      if (splitId[0] !== SCRIPT_EVENT_ID_PREFIX.KAIRO) return;
      const suffix = splitId[1];
      if (suffix === void 0) return;
      if (suffix === SCRIPT_EVENT_ID_SUFFIX.BROADCAST) {
        this.sendToAllAddons(message);
        return;
      }
      const addonData = this.addonManager.getAddonsData().get(suffix);
      if (addonData === void 0) return;
      if (!addonData.isActive) return;
      const activeVersionData = addonData.versions[addonData.activeVersion];
      if (!activeVersionData) return;
      system9.sendScriptEvent(
        `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${activeVersionData.sessionId}`,
        message
      );
    };
  }
  static create(addonManager) {
    return new _AddonRouter(addonManager);
  }
  sendToAllAddons(message) {
    const addons = this.addonManager.getAddonsData();
    for (const [_, addonData] of addons) {
      if (!addonData.isActive) continue;
      const versionData = addonData.versions[addonData.activeVersion];
      if (!versionData) continue;
      const sessionId = versionData.sessionId;
      system9.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${sessionId}`, message);
    }
  }
};

// scripts/Kairo/addons/AddonManager.ts
var AddonManager = class _AddonManager {
  constructor(kairo) {
    this.kairo = kairo;
    this.addonsData = /* @__PURE__ */ new Map();
    this._isActive = false;
    this.handleAddonRouterScriptEvent = (ev) => {
      this.addonRouter.handleScriptEvent(ev);
    };
    this.handleAddonListScriptEvent = (ev) => {
      this.addonList.handleScriptEvent(ev);
    };
    this.activator = AddonActivator.create(this);
    this.receiver = AddonReceiver.create(this);
    this.addonRouter = AddonRouter.create(this);
    this.addonList = AddonList.create(this);
  }
  static create(kairo) {
    return new _AddonManager(kairo);
  }
  getAddonsData() {
    return this.addonsData;
  }
  getAddonRecords() {
    return this.kairo.getAddonRecords();
  }
  showAddonList(player) {
    this.addonList.showAddonList(player);
  }
  getSelfAddonProperty() {
    return this.kairo.getSelfAddonProperty();
  }
  subscribeReceiverHooks() {
    system10.afterEvents.scriptEventReceive.subscribe(this.receiver.handleScriptEvent);
  }
  _activateAddon() {
    this.kairo._activateAddon();
  }
  _deactivateAddon() {
    this.kairo._deactivateAddon();
  }
  async _scriptEvent(data) {
    return this.kairo._scriptEvent(data);
  }
  getLatestPreferStableVersion(id) {
    const addonData = this.getAddonsData().get(id);
    if (!addonData) return void 0;
    const sorted = Object.keys(addonData.versions).filter((v) => addonData.versions[v]?.isRegistered).sort((a, b) => VersionManager.compare(b, a));
    if (sorted.length === 0) {
      return void 0;
    }
    const stable = sorted.find((v) => !VersionManager.fromString(v).prerelease);
    return stable ?? sorted[0];
  }
  getLatestVersion(id) {
    const addonData = this.getAddonsData().get(id);
    if (!addonData) return void 0;
    const latestVersion = Object.keys(addonData.versions).filter((v) => addonData.versions[v]?.isRegistered).sort((a, b) => VersionManager.compare(b, a))[0];
    return latestVersion ?? void 0;
  }
  sendActiveRequest(sessionId) {
    this.activator.sendActiveRequest(sessionId);
  }
  sendDeactiveRequest(sessionId) {
    this.activator.sendDeactiveRequest(sessionId);
  }
  activateAddon(player, addonData, version) {
    this.activator.activateAddon(player, addonData, version);
  }
  deactivateAddon(player, addonData) {
    this.activator.deactivateAddon(player, addonData);
  }
  saveAddon(addonData) {
    this.kairo.saveAddon(addonData);
  }
  get isActive() {
    return this._isActive;
  }
  setActiveState(state) {
    this._isActive = state;
  }
};

// scripts/Kairo/constants/states.ts
var DEFAULT_KAIRO_STATES = [
  "Lobby",
  "Game",
  "Alive",
  "Dead",
  "Spectate",
  "DeveloperMode",
  "WorkMode"
];

// scripts/Kairo/system/events/BaseEventManager.ts
var BaseEventManager = class {
  constructor() {
  }
};

// scripts/Kairo/system/events/PlayerSpawn.ts
import { world as world7 } from "@minecraft/server";

// scripts/Kairo/system/events/BaseEventHandler.ts
var BaseEventHandler = class {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.isSubscribed = false;
    this.boundHandleBefore = void 0;
    this.boundHandleAfter = void 0;
  }
  subscribe() {
    if (this.isSubscribed) return;
    if (this.beforeEvent && this.handleBefore) {
      this.boundHandleBefore = this.handleBefore.bind(this);
      this.beforeEvent.subscribe(this.boundHandleBefore);
    }
    if (this.afterEvent && this.handleAfter) {
      this.boundHandleAfter = this.handleAfter.bind(this);
      this.afterEvent.subscribe(this.boundHandleAfter);
    }
    this.isSubscribed = true;
  }
  unsubscribe() {
    if (!this.isSubscribed) return;
    if (this.beforeEvent && this.boundHandleBefore) {
      this.beforeEvent.unsubscribe(this.boundHandleBefore);
      this.boundHandleBefore = void 0;
    }
    if (this.afterEvent && this.boundHandleAfter) {
      this.afterEvent.unsubscribe(this.boundHandleAfter);
      this.boundHandleAfter = void 0;
    }
    this.isSubscribed = false;
  }
};

// scripts/Kairo/system/events/PlayerSpawn.ts
var PlayerSpawnHandler = class _PlayerSpawnHandler extends BaseEventHandler {
  constructor(systemEventManager) {
    super(systemEventManager);
    this.systemEventManager = systemEventManager;
    this.afterEvent = world7.afterEvents.playerSpawn;
  }
  static create(systemEventManager) {
    return new _PlayerSpawnHandler(systemEventManager);
  }
  handleAfter(ev) {
    const { initialSpawn, player } = ev;
    if (initialSpawn) {
      this.systemEventManager.getSystemManager().addOrRestorePlayerKairoData(player);
    }
  }
};

// scripts/Kairo/system/events/SystemEventManager.ts
var SystemEventManager = class _SystemEventManager extends BaseEventManager {
  constructor(systemManager) {
    super();
    this.systemManager = systemManager;
    this.playerSpawn = PlayerSpawnHandler.create(this);
  }
  static create(systemManager) {
    return new _SystemEventManager(systemManager);
  }
  subscribeAll() {
    this.playerSpawn.subscribe();
  }
  unsubscribeAll() {
    this.playerSpawn.unsubscribe();
  }
  getSystemManager() {
    return this.systemManager;
  }
};

// scripts/Kairo/system/PlayerKairoDataManager.ts
import { world as world8 } from "@minecraft/server";

// scripts/Kairo/system/PlayerKairoData.ts
var PlayerKairoData = class {
  constructor(manager, JoinOrder, initialStates) {
    this.manager = manager;
    this.JoinOrder = 0;
    this.JoinOrder = JoinOrder;
    this.kairoState = new Set(initialStates);
  }
  getJoinOrder() {
    return this.JoinOrder;
  }
  setJoinOrder(order) {
    this.JoinOrder = order;
  }
  addState(newState) {
    const validated = this.manager.validateOrThrow(newState);
    this.kairoState.add(validated);
  }
  removeState(state) {
    this.kairoState.delete(state);
  }
  hasState(state) {
    return this.kairoState.has(state);
  }
  getStates() {
    return [...this.kairoState];
  }
  clearStates() {
    this.kairoState.clear();
  }
};

// scripts/Kairo/system/PlayerKairoDataManager.ts
var PlayerKairoDataManager = class _PlayerKairoDataManager {
  constructor(systemManager, initialStates = []) {
    this.systemManager = systemManager;
    this.playersKairoData = /* @__PURE__ */ new Map();
    this.lastSavedPlayersKairoData = /* @__PURE__ */ new Map();
    this.validStates = /* @__PURE__ */ new Set();
    this.joinOrder = 0;
    this.initPromise = null;
    this.initialized = false;
    for (const s of initialStates) {
      this.registerState(s);
    }
  }
  static create(systemManager, initialStates) {
    return new _PlayerKairoDataManager(systemManager, initialStates);
  }
  async init() {
    if (this.initialized) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        KairoUtils.loadFromDataVault(KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA);
        const dataLoaded = await KairoUtils.loadFromDataVault(
          KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA
        );
        let playersDataSerializedMap = /* @__PURE__ */ new Map();
        if (typeof dataLoaded === "string" && dataLoaded.length > 0) {
          try {
            const playersDataSerialized = JSON.parse(
              dataLoaded
            );
            playersDataSerializedMap = new Map(
              playersDataSerialized.map((item) => [item.playerId, item])
            );
          } catch {
            playersDataSerializedMap = /* @__PURE__ */ new Map();
          }
        }
        const players = world8.getPlayers();
        for (const player of players) {
          const playerDataSerialized = playersDataSerializedMap.get(player.id);
          const initialStates = playerDataSerialized !== void 0 ? playerDataSerialized.states : [];
          const playerKairoData = new PlayerKairoData(
            this,
            this.joinOrder++,
            initialStates
          );
          this.playersKairoData.set(player.id, playerKairoData);
        }
        this.savePlayersKairoDataToDataVault();
        this.initialized = true;
      })();
    }
    await this.initPromise;
  }
  addOrRestorePlayerKairoData(player) {
    const existing = this.playersKairoData.get(player.id);
    if (existing) {
      existing.setJoinOrder(this.joinOrder++);
      this.savePlayersKairoDataToDataVault();
      return;
    }
    const past = this.lastSavedPlayersKairoData.get(player.id);
    let initialStates = [];
    if (past) {
      initialStates = past.states ?? [];
    }
    const playerData = new PlayerKairoData(this, this.joinOrder++, initialStates);
    this.playersKairoData.set(player.id, playerData);
    this.savePlayersKairoDataToDataVault();
  }
  savePlayersKairoDataToDataVault() {
    const serialized = Array.from(
      this.playersKairoData,
      ([playerId, kairoData]) => ({
        playerId,
        states: [...kairoData.getStates()]
      })
    );
    this.lastSavedPlayersKairoData = new Map(serialized.map((item) => [item.playerId, item]));
    const json = JSON.stringify(serialized);
    KairoUtils.saveToDataVault(KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA, json);
  }
  registerState(state) {
    this.validStates.add(state);
    return state;
  }
  validateOrThrow(state) {
    if (!this.validStates.has(state)) {
      throw new Error(`State "${state}" is not registered in PlayerKairoDataManager.`);
    }
    return state;
  }
  hasState(state) {
    return this.validStates.has(state);
  }
  getAllStates() {
    return [...this.validStates];
  }
  async getPlayerKairoData(playerId) {
    await this.init();
    return this.playersKairoData.get(playerId);
  }
  async getPlayersKairoData() {
    await this.init();
    return this.playersKairoData;
  }
};

// scripts/Kairo/system/ScriptEventReceiver.ts
var ScriptEventReceiver = class _ScriptEventReceiver {
  constructor(systemManager) {
    this.systemManager = systemManager;
  }
  static create(systemManager) {
    return new _ScriptEventReceiver(systemManager);
  }
  async handleScriptEvent(command) {
    switch (command.commandType) {
      case SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYER_KAIRO_DATA: {
        const playerId = command.data.playerId;
        const playerKairoData = await this.systemManager.getPlayerKairoData(playerId);
        const playerKairoDataDTO = {
          playerId,
          joinOrder: playerKairoData.getJoinOrder(),
          states: playerKairoData.getStates()
        };
        return KairoUtils.buildKairoResponse({
          playerKairoData: playerKairoDataDTO
        });
      }
      case SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYERS_KAIRO_DATA: {
        const playersKairoData = await this.systemManager.getPlayersKairoData();
        const playersKairoDataDTO = Array.from(
          playersKairoData.entries()
        ).map(([playerId, kairoData]) => ({
          playerId,
          joinOrder: kairoData.getJoinOrder(),
          states: kairoData.getStates()
        }));
        return KairoUtils.buildKairoResponse({
          playersKairoData: playersKairoDataDTO
        });
      }
      default:
        return;
    }
  }
};

// scripts/Kairo/system/SystemManager.ts
var SystemManager = class _SystemManager {
  constructor(kairo) {
    this.kairo = kairo;
    this.handleOnScriptEvent = async (data) => {
      return this.scriptEventReceiver.handleScriptEvent(data);
    };
    this.systemEventManager = SystemEventManager.create(this);
    this.scriptEventReceiver = ScriptEventReceiver.create(this);
    this.playerKairoDataManager = PlayerKairoDataManager.create(this, DEFAULT_KAIRO_STATES);
  }
  static create(kairo) {
    return new _SystemManager(kairo);
  }
  initialize() {
    this.playerKairoDataManager.init();
  }
  subscribeEvents() {
    this.systemEventManager.subscribeAll();
  }
  unsubscribeEvents() {
    this.systemEventManager.unsubscribeAll();
  }
  addOrRestorePlayerKairoData(player) {
    this.playerKairoDataManager.addOrRestorePlayerKairoData(player);
  }
  async getPlayerKairoData(playerId) {
    return this.playerKairoDataManager.getPlayerKairoData(playerId);
  }
  async getPlayersKairoData() {
    return this.playerKairoDataManager.getPlayersKairoData();
  }
};

// scripts/Kairo/index.ts
var _Kairo = class _Kairo {
  constructor() {
    this.initialized = false;
    this.addonManager = AddonManager.create(this);
    this.addonPropertyManager = AddonPropertyManager.create(this);
    this.addonInitializer = AddonInitializer.create(this);
    this.systemManager = SystemManager.create(this);
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new _Kairo();
    }
    return this.instance;
  }
  static init() {
    const inst = this.getInstance();
    if (inst.initialized) return;
    inst.initialized = true;
    inst.addonInitializer.subscribeClientHooks();
  }
  static initRouter() {
    this.getInstance().addonInitializer.subscribeCoreHooks();
  }
  getSelfAddonProperty() {
    return this.addonPropertyManager.getSelfAddonProperty();
  }
  refreshSessionId() {
    this.addonPropertyManager.refreshSessionId();
  }
  static awaitRegistration() {
    return this.getInstance().addonInitializer.awaitRegistration();
  }
  subscribeReceiverHooks() {
    this.addonManager.subscribeReceiverHooks();
  }
  static unsubscribeInitializeHooks() {
    system11.sendScriptEvent(SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE, "");
  }
  static initSaveAddons() {
    this.getInstance().addonInitializer.saveAddons();
  }
  static initActivateAddons() {
    const inst = this.getInstance();
    inst.addonInitializer.initActivateAddons(inst.addonInitializer.getRegisteredAddons());
  }
  getAddonsData() {
    return this.addonManager.getAddonsData();
  }
  getAddonRecords() {
    return this.addonInitializer.getAddonRecords();
  }
  static showAddonList(player) {
    this.getInstance().addonManager.showAddonList(player);
  }
  sendActiveRequest(sessionId) {
    this.addonManager.sendActiveRequest(sessionId);
  }
  sendDeactiveRequest(sessionId) {
    this.addonManager.sendDeactiveRequest(sessionId);
  }
  static set onActivate(val) {
    if (typeof val === "function") this._pushSorted(this._initHooks, val);
    else this._pushSorted(this._initHooks, val.run, val.options);
  }
  static set onDeactivate(val) {
    if (typeof val === "function") this._pushSorted(this._deinitHooks, val);
    else this._pushSorted(this._deinitHooks, val.run, val.options);
  }
  static set onScriptEvent(val) {
    if (this._commandHandler) {
      throw new Error("CommandHandler already registered");
    }
    this._commandHandler = val;
  }
  static set onTick(fn) {
    this.addTick(fn);
  }
  static addActivate(fn, opt) {
    this._pushSorted(this._initHooks, fn, opt);
  }
  static addDeactivate(fn, opt) {
    this._pushSorted(this._deinitHooks, fn, opt);
  }
  static addScriptEvent(fn, opt) {
    this._pushSorted(this._seHooks, fn, opt);
  }
  static addTick(fn, opt) {
    this._pushSorted(this._tickHooks, fn, opt);
  }
  async _scriptEvent(data) {
    return _Kairo._runScriptEvent(data);
  }
  _activateAddon() {
    void _Kairo._runActivateHooks();
  }
  _deactivateAddon() {
    void _Kairo._runDeactivateHooks();
  }
  static _pushSorted(arr, fn, opt) {
    arr.push({ fn, priority: opt?.priority ?? 0 });
    arr.sort((a, b) => b.priority - a.priority);
  }
  static async _runActivateHooks() {
    for (const { fn } of this._initHooks) {
      try {
        await fn();
      } catch (e) {
        system11.run(
          () => console.warn(
            `[Kairo.onActivate] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
    this._enableTick();
    this.getInstance().addonManager.setActiveState(true);
  }
  static async _runDeactivateHooks() {
    for (const { fn } of [...this._deinitHooks].reverse()) {
      try {
        await fn();
      } catch (e) {
        system11.run(
          () => console.warn(
            `[Kairo.onDeactivate] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
    this._disableTick();
    this.getInstance().addonManager.setActiveState(false);
  }
  static async _runScriptEvent(data) {
    let response = void 0;
    if (this._commandHandler) {
      try {
        response = await this._commandHandler(data);
      } catch (e) {
        system11.run(
          () => console.warn(
            `[Kairo.CommandHandler] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
    for (const { fn } of this._seHooks) {
      try {
        await fn(data);
      } catch (e) {
        system11.run(
          () => console.warn(
            `[Kairo.onScriptEvent] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
    return response;
  }
  static async _runTick() {
    if (!this._tickEnabled) return;
    for (const { fn } of this._tickHooks) {
      try {
        await fn();
      } catch (e) {
        system11.run(
          () => console.warn(
            `[Kairo.onTick] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
  }
  static _enableTick() {
    if (this._tickIntervalId !== void 0) return;
    this._tickEnabled = true;
    this.addTick(
      () => {
        KairoUtils.onTick();
      },
      { priority: Number.MAX_SAFE_INTEGER }
    );
    this._tickIntervalId = system11.runInterval(() => {
      void this._runTick();
    }, 1);
  }
  static _disableTick() {
    if (this._tickIntervalId === void 0) return;
    system11.clearRun(this._tickIntervalId);
    this._tickIntervalId = void 0;
    this._tickEnabled = false;
  }
  saveAddon(addonData) {
    this.addonInitializer.saveAddon(addonData);
  }
};
_Kairo._initHooks = [];
_Kairo._deinitHooks = [];
_Kairo._seHooks = [];
_Kairo._tickHooks = [];
_Kairo._tickEnabled = false;
_Kairo.handleOnScriptEvent = async (data) => {
  return _Kairo.getInstance().systemManager.handleOnScriptEvent(data);
};
_Kairo.handleAddonRouterScriptEvent = (ev) => {
  _Kairo.getInstance().addonManager.handleAddonRouterScriptEvent(ev);
};
_Kairo.handleAddonListScriptEvent = (ev) => {
  _Kairo.getInstance().addonManager.handleAddonListScriptEvent(ev);
};
_Kairo.subscribeEvents = () => {
  _Kairo.getInstance().systemManager.subscribeEvents();
};
_Kairo.unsubscribeEvents = () => {
  _Kairo.getInstance().systemManager.unsubscribeEvents();
};
_Kairo.systemInitialize = () => {
  _Kairo.getInstance().systemManager.initialize();
};
var Kairo = _Kairo;

// scripts/index.ts
async function main() {
  Kairo.init();
  Kairo.initRouter();
  await Kairo.awaitRegistration();
  Kairo.unsubscribeInitializeHooks();
  Kairo.initSaveAddons();
  Kairo.initActivateAddons();
}
Kairo.onActivate = () => {
  system12.afterEvents.scriptEventReceive.subscribe(Kairo.handleAddonRouterScriptEvent);
  system12.afterEvents.scriptEventReceive.subscribe(Kairo.handleAddonListScriptEvent);
  Kairo.subscribeEvents();
  Kairo.systemInitialize();
};
Kairo.onDeactivate = () => {
  system12.afterEvents.scriptEventReceive.unsubscribe(Kairo.handleAddonRouterScriptEvent);
  system12.afterEvents.scriptEventReceive.unsubscribe(Kairo.handleAddonListScriptEvent);
  Kairo.unsubscribeEvents();
};
Kairo.onScriptEvent = async (command) => {
  return Kairo.handleOnScriptEvent(command);
};
Kairo.onTick = () => {
};
main();
