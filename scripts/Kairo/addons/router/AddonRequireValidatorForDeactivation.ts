import type { AddonRequireValidator } from "./AddonRequireValidator";

export class AddonRequireValidatorForDeactivation {
    private constructor(private readonly requireValidator: AddonRequireValidator) {}
    
    public static create(requireValidator: AddonRequireValidator): AddonRequireValidatorForDeactivation {
        return new AddonRequireValidatorForDeactivation(requireValidator);
    }
}