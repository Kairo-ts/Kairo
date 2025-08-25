export const SCRIPT_EVENT_IDS = {
    BEHAVIOR_INITIALIZE_REQUEST: "kairo:initializeRequest",
    BEHAVIOR_INITIALIZE_RESPONSE: "kairo:initializeResponse",
    UNSUBSCRIBE_INITIALIZE: "kairo:unsubscribeInitialize",
    REQUEST_RESEED_SESSION_ID: "kairo:reseedSessionId",
    SHOW_ADDON_LIST: "kairo:showAddonList"
}

export const SCRIPT_EVENT_MESSAGES = {
    ACTIVE_REQUEST: "active request",
    DEACTIVE_REQUEST: "deactive request"
}

export const KAIRO_TRANSLATE_IDS = {
    ADDON_LIST_TITLE: "kairo.addonList.title",
    ADDON_LIST_ACTIVE: "kairo.addonList.active",
    ADDON_LIST_INACTIVE: "kairo.addonList.inactive",
    ADDON_SETTING_LATEST_VERSION: "kairo.addonSetting.latestVersion",
    ADDON_SETTING_REQUIRED: "kairo.addonSetting.required",
    ADDON_SETTING_NONE_REQUIRED: "kairo.addonSetting.noneRequired",
    ADDON_SETTING_ACTIVE: "kairo.addonSetting.active",
    ADDON_SETTING_UNINSTALLED: "kairo.addonSetting.uninstalled",
    ADDON_SETTING_REGISTERED_ADDON_LIST: "kairo.addonSetting.registeredAddonList",
    ADDON_SETTING_SELECT_VERSION: "kairo.addonSetting.selectVersion",
    ADDON_SETTING_ACTIVATE: "kairo.addonSetting.activate",
    ADDON_SETTING_SUBMIT: "kairo.addonSetting.submit",
    ADDON_SETTING_REQUIRED_TITLE: "kairo.addonSetting.required.title",
    ADDON_SETTING_REQUIRED_BODY: "kairo.addonSetting.required.body",
    ADDON_SETTING_REQUIRED_ACTIVE: "kairo.addonSetting.required.active",
    ADDON_SETTING_REQUIRED_CANCEL: "kairo.addonSetting.required.cancel",
    ERROR_FORM_TITLE: "kairo.errorForm.title",
    ERROR_FORM_HEADER: "kairo.errorForm.header",
    ERROR_FORM_FOOTER: "kairo.errorForm.footer"
}

export const VERSION_KEYWORDS = {
    LATEST: "latest version",
    UNREGISTERED: "unregistered"
}

export const SCOREBOARD_NAMES = {
    ADDON_COUNTER: "AddonCounter"
}

interface ErrorDetail {
    errorMessageId: string;
    errorHintId: string;
    errorCode: string;
}

export const ErrorDetails: Record<string, ErrorDetail> = {
    "kairo_error_not_found": {
        errorMessageId: "kairo.error.not.found.message",
        errorHintId: "kairo.error.not.found.hint",
        errorCode: "E000001"
    },
    "kairo_resolve_for_activation_error": {
        errorMessageId: "kairo.error.resolve.for.activation.message",
        errorHintId: "kairo.error.resolve.for.activation.hint",
        errorCode: "E100001"
    }
}