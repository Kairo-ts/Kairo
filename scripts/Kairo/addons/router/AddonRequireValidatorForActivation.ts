import type { AddonRequireValidator } from "./AddonRequireValidator";

export class AddonRequireValidatorForActivation {
    private constructor(private readonly requireValidator: AddonRequireValidator) {}

    public static create(requireValidator: AddonRequireValidator): AddonRequireValidatorForActivation {
        return new AddonRequireValidatorForActivation(requireValidator);
    }
}