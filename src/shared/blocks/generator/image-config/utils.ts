import { MODEL_OPTIONS } from './models';
import {
  ASPECT_RATIO_OPTIONS,
  DEFAULT_CREDITS,
  IMAGE_OPTION_LABELS,
  IMAGE_SIZE_OPTIONS,
  OUTPUT_FORMAT_OPTIONS,
  PROVIDER_OPTIONS,
  QUALITY_OPTIONS,
  RESOLUTION_OPTIONS,
} from './options';
import {
  CreditCalculationResult,
  CustomImageOptions,
  DiscountConfig,
  ImageAdvancedOptionValues,
  ImageBrand,
  ImageDefaultCreditMap,
  ImageDefaultOptions,
  ImageModelOption,
  ImageOptionType,
  ImageOptionValue,
  ImageScene,
  ImageSceneConfig,
} from './types';

export function getOptionsForType(type: ImageOptionType): ImageOptionValue[] {
  const optionsMap: Record<ImageOptionType, ImageOptionValue[]> = {
    aspectRatio: ASPECT_RATIO_OPTIONS,
    outputFormat: OUTPUT_FORMAT_OPTIONS,
    quality: QUALITY_OPTIONS,
    resolution: RESOLUTION_OPTIONS,
  };

  return optionsMap[type] ?? [];
}

export function getOptionLabel(type: ImageOptionType): string {
  return IMAGE_OPTION_LABELS[type] ?? '';
}

export function getModelSceneConfig(
  modelConfig: ImageModelOption | null | undefined,
  scene: ImageScene
): ImageSceneConfig | null {
  if (!modelConfig) return null;

  const sceneValue = modelConfig.sceneValues?.[scene];
  if (!sceneValue || typeof sceneValue === 'string') return null;

  return sceneValue;
}

export function getModelSceneId(
  modelConfig: ImageModelOption | null | undefined,
  scene: ImageScene
) {
  if (!modelConfig) return '';

  const sceneValue = modelConfig.sceneValues?.[scene];
  if (!sceneValue) return '';

  return typeof sceneValue === 'string' ? sceneValue : sceneValue.id;
}

export function getOptionsForModel(
  modelConfig: ImageModelOption | null | undefined,
  type: ImageOptionType,
  scene?: ImageScene
): ImageOptionValue[] {
  const customOptions = getModelCustomOptions(modelConfig, scene)?.[type];

  if (
    customOptions &&
    'type' in customOptions &&
    customOptions.type === 'range'
  ) {
    const options: ImageOptionValue[] = [];
    for (
      let value = customOptions.min;
      value <= customOptions.max;
      value += customOptions.step
    ) {
      options.push({
        value: String(value),
        label: customOptions.unit
          ? `${value}${customOptions.unit}`
          : `${value}`,
      });
    }
    return options;
  }

  if (
    customOptions &&
    Array.isArray(customOptions) &&
    customOptions.length > 0
  ) {
    return customOptions;
  }

  return getOptionsForType(type);
}

export function getModelCustomOptions(
  modelConfig: ImageModelOption | null | undefined,
  scene?: ImageScene
) {
  const sceneOptions =
    scene && getModelSceneConfig(modelConfig, scene)?.customOptions;
  return sceneOptions ?? modelConfig?.customOptions;
}

export function getModelCreditRules(
  modelConfig: ImageModelOption | null | undefined,
  scene?: ImageScene
) {
  const sceneRules =
    scene && getModelSceneConfig(modelConfig, scene)?.creditRules;
  return sceneRules ?? modelConfig?.creditRules ?? [];
}

export function getModelDiscount(
  modelConfig: ImageModelOption | null | undefined,
  scene?: ImageScene
) {
  const sceneDiscount =
    scene && getModelSceneConfig(modelConfig, scene)?.discount;
  return sceneDiscount ?? modelConfig?.discount;
}

export function isDiscountValid(discount: DiscountConfig): boolean {
  const now = new Date();

  if (discount.startDate) {
    const start = new Date(discount.startDate);
    if (now < start) return false;
  }

  if (discount.endDate) {
    const end = new Date(discount.endDate);
    if (now > end) return false;
  }

  return true;
}

export function getDiscountLabel(
  modelConfig: ImageModelOption | null | undefined,
  scene?: ImageScene
) {
  const discount = getModelDiscount(modelConfig, scene);

  if (discount && isDiscountValid(discount)) {
    const rate = Math.round(discount.rate * 10);
    return discount.label || `${rate}% OFF`;
  }

  return null;
}

export function getAvailableProviders(tab: ImageScene) {
  return PROVIDER_OPTIONS.filter((provider) =>
    MODEL_OPTIONS.some(
      (model) =>
        Boolean(getModelSceneId(model, tab)) && model.brand === provider.value
    )
  );
}

export function getAvailableModels(tab: ImageScene, provider: ImageBrand) {
  return MODEL_OPTIONS.filter(
    (option) =>
      Boolean(getModelSceneId(option, tab)) && option.brand === provider
  );
}

export function getModelDefaultOptions(
  modelConfig?: ImageModelOption | null,
  scene?: ImageScene
): ImageDefaultOptions {
  if (!modelConfig) return {};

  const sceneDefaults =
    scene && getModelSceneConfig(modelConfig, scene)?.defaultOptions;

  return {
    ...modelConfig.defaultOptions,
    ...sceneDefaults,
  };
}

export function getDefaultAdvancedOptions(
  modelConfig?: ImageModelOption | null,
  scene?: ImageScene
): ImageAdvancedOptionValues {
  if (!modelConfig) return {};

  const defaults = getModelDefaultOptions(modelConfig, scene);
  const next: ImageAdvancedOptionValues = {};

  if (defaults.image_size || defaults.aspect_ratio) {
    next.aspectRatio = defaults.aspect_ratio ?? defaults.image_size;
  }
  if (defaults.output_format) next.outputFormat = defaults.output_format;
  if (defaults.quality) next.quality = defaults.quality;
  if (defaults.resolution) next.resolution = defaults.resolution;

  return next;
}

export function getModelCustomFields(
  modelConfig: ImageModelOption | null | undefined,
  scene?: ImageScene
) {
  const sceneFields =
    scene && getModelSceneConfig(modelConfig, scene)?.customFields;
  return sceneFields ?? modelConfig?.customFields ?? [];
}

export function getAdvancedOptionValue(
  type: ImageOptionType,
  advancedOptions: ImageAdvancedOptionValues,
  modelConfig?: ImageModelOption | null,
  scene?: ImageScene
) {
  const defaults = getDefaultAdvancedOptions(modelConfig, scene);
  return (
    advancedOptions[type] ??
    defaults[type] ??
    getOptionsForModel(modelConfig, type, scene)[0]?.value ??
    ''
  );
}

export function getModelCredits(
  modelConfig: ImageModelOption | null | undefined,
  scene: ImageScene,
  fallbackCredits: ImageDefaultCreditMap = DEFAULT_CREDITS
) {
  const sceneCredits = getModelSceneConfig(modelConfig, scene)?.credits;
  const value = sceneCredits ?? modelConfig?.credits?.[scene];
  return value ?? fallbackCredits[scene];
}

export function getModelAdvancedOptions(
  modelConfig: ImageModelOption | null | undefined,
  scene?: ImageScene
) {
  const sceneAdvancedOptions =
    scene && getModelSceneConfig(modelConfig, scene)?.advancedOptions;

  return sceneAdvancedOptions ?? modelConfig?.advancedOptions;
}

export function getModelImageFieldName(
  modelConfig: ImageModelOption | null | undefined,
  scene?: ImageScene
) {
  return (
    getModelCustomFields(modelConfig, scene).find(
      (field) => field.type === 'image'
    )?.fieldName ?? 'image_input'
  );
}

export function getModelOptionFieldName(
  type: ImageOptionType,
  modelConfig: ImageModelOption | null | undefined,
  scene?: ImageScene
) {
  const customField = getModelCustomFields(modelConfig, scene).find(
    (field) => field.optionType === type
  );

  if (customField?.fieldName) {
    return customField.fieldName;
  }

  const fieldMap: Record<ImageOptionType, string> = {
    aspectRatio: 'aspect_ratio',
    outputFormat: 'output_format',
    quality: 'quality',
    resolution: 'resolution',
  };

  return fieldMap[type];
}

export function calculateOriginalCredits(
  modelConfig: ImageModelOption,
  scene: ImageScene,
  selectedOptions: Record<string, string | boolean>
) {
  let totalCredits = getModelCredits(modelConfig, scene);
  const creditRules = getModelCreditRules(modelConfig, scene);
  const customOptions = getModelCustomOptions(modelConfig, scene);
  const isConditionValueMatch = (
    selectedValue: string | boolean | undefined,
    expectedValue: string | boolean
  ) => {
    if (
      typeof selectedValue === 'string' &&
      typeof expectedValue === 'string'
    ) {
      return selectedValue.toLowerCase() === expectedValue.toLowerCase();
    }

    return selectedValue === expectedValue;
  };

  if (creditRules.length > 0) {
    for (const rule of creditRules) {
      const isMatch = Object.entries(rule.conditions).every(([key, value]) =>
        isConditionValueMatch(selectedOptions[key], value)
      );

      if (!isMatch) continue;

      if (rule.credits !== undefined) {
        totalCredits += rule.credits;
      }

      if (rule.multiplier !== undefined) {
        totalCredits = Math.ceil(totalCredits * rule.multiplier);
      }
    }
  }

  Object.entries(selectedOptions).forEach(([type, value]) => {
    const options = customOptions?.[type as keyof CustomImageOptions];
    if (!options || !Array.isArray(options) || typeof value !== 'string') {
      return;
    }

    const option = options.find((item) => item.value === value);
    if (option?.credits) {
      totalCredits += option.credits;
    }
  });

  return totalCredits;
}

export function calculateDiscountedCredits(
  modelConfig: ImageModelOption,
  scene: ImageScene,
  selectedOptions: Record<string, string | boolean>
): CreditCalculationResult {
  const original = calculateOriginalCredits(
    modelConfig,
    scene,
    selectedOptions
  );
  const discount = getModelDiscount(modelConfig, scene);

  if (discount && isDiscountValid(discount)) {
    const discounted = Math.ceil(original * discount.rate);
    return { original, discounted, discountRate: discount.rate };
  }

  return { original, discounted: original, discountRate: 1 };
}
