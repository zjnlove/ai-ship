export type ImageScene = 'text-to-image' | 'image-to-image';

export type ImageBrand =
  | 'google'
  | 'qwen'
  | 'wan'
  | 'openai'
  | 'flux'
  | 'grok'
  | 'recraft';

export type ImageApiProvider = 'kie';

export type ImageOptionType =
  | 'aspectRatio'
  | 'outputFormat'
  | 'quality'
  | 'resolution'
  | 'seed'
  | 'enable_sequential';

export interface ImageOptionValue {
  value: string | boolean | number;
  label: string;
  credits?: number;
}

export interface ImageOptionRange {
  type: 'range';
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface ImageProviderOption {
  value: ImageBrand;
  label: string;
}

export interface CreditRule {
  conditions: Record<string, string | boolean>;
  credits?: number;
  multiplier?: number;
}

export interface DiscountConfig {
  rate: number;
  label?: string;
  startDate?: string;
  endDate?: string;
}

export interface DependencyRule {
  when: Record<string, string | boolean>;
  then: {
    disabled?: string[];
    autoSelect?: Record<string, string>;
    message?: string;
  };
}

export interface CustomFieldConfig {
  type: 'image' | 'boolean' | 'string' | 'number';
  fieldName: string;
  optionType?: ImageOptionType;
  isArray?: boolean;
  defaultValue?: string | boolean | number;
  required?: boolean;
}

export interface ImageAdvancedOptions {
  supportedTypes: ImageOptionType[];
}

export interface CustomImageOptions {
  aspectRatio?: ImageOptionValue[] | ImageOptionRange;
  outputFormat?: ImageOptionValue[] | ImageOptionRange;
  quality?: ImageOptionValue[] | ImageOptionRange;
  resolution?: ImageOptionValue[] | ImageOptionRange;
  seed?: ImageOptionValue[] | ImageOptionRange;
  enable_sequential?: ImageOptionValue[];
}

export interface ImageDefaultOptions {
  image_size?: string;
  aspect_ratio?: string;
  output_format?: string;
  quality?: string;
  resolution?: string;
  seed?: number;
  nsfw_checker?: boolean;
  enable_sequential?: boolean;
  [key: string]: string | boolean | number | undefined;
}

export interface ImageSceneConfig {
  id: string;
  credits?: number;
  maxImages?: number;
  defaultOptions?: ImageDefaultOptions;
  advancedOptions?: ImageAdvancedOptions;
  customOptions?: CustomImageOptions;
  customFields?: CustomFieldConfig[];
  discount?: DiscountConfig;
  creditRules?: CreditRule[];
  dependencyRules?: DependencyRule[];
  inputValidation?: ImageInputValidationRules;
  [key: string]: unknown;
}

export type ImageSceneValue = string | ImageSceneConfig;

export interface ImageInputValidationRules {
  image?: {
    maxFileSize?: number;
    supportedFormats?: string[];
  };
}

export interface ImageModelOption {
  label: string;
  provider: ImageApiProvider;
  brand: ImageBrand;
  modelPath: string;
  credits: Partial<Record<ImageScene, number>>;
  maxImages?: number;
  sceneValues: Partial<Record<ImageScene, ImageSceneValue>>;
  customFields?: CustomFieldConfig[];
  customOptions?: CustomImageOptions;
  discount?: DiscountConfig;
  creditRules?: CreditRule[];
  dependencyRules?: DependencyRule[];
  defaultOptions: ImageDefaultOptions;
  advancedOptions?: ImageAdvancedOptions;
  inputValidation?: ImageInputValidationRules;
}

export type ImageAdvancedOptionValues = Partial<
  Record<ImageOptionType, string | number | boolean>
>;

export type ImageDefaultCreditMap = Record<ImageScene, number>;

export interface CreditCalculationResult {
  original: number;
  discounted: number;
  discountRate: number;
}
