export type ImageScene = 'text-to-image' | 'image-to-image';

export type ImageBrand =
  | 'google'
  | 'qwen'
  | 'openai'
  | 'flux'
  | 'grok'
  | 'recraft';

export type ImageApiProvider = 'kie';

export type ImageOptionType =
  | 'imageSize'
  | 'aspectRatio'
  | 'outputFormat'
  | 'quality'
  | 'resolution';

export interface ImageOptionValue {
  value: string;
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
  isArray?: boolean;
  defaultValue?: string | boolean | number;
  required?: boolean;
}

export interface ImageAdvancedOptions {
  imageSizeField?: 'image_size' | 'aspect_ratio';
  supportedTypes: ImageOptionType[];
}

export interface CustomImageOptions {
  imageSize?: ImageOptionValue[] | ImageOptionRange;
  aspectRatio?: ImageOptionValue[] | ImageOptionRange;
  outputFormat?: ImageOptionValue[] | ImageOptionRange;
  quality?: ImageOptionValue[] | ImageOptionRange;
  resolution?: ImageOptionValue[] | ImageOptionRange;
}

export interface ImageDefaultOptions {
  image_size?: string;
  aspect_ratio?: string;
  output_format?: string;
  quality?: string;
  resolution?: string;
  nsfw_checker?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface ImageSceneConfig {
  id: string;
  credits?: string;
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
  credits: Partial<Record<ImageScene, string>>;
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
  Record<ImageOptionType, string>
>;

export type ImageDefaultCreditMap = Record<ImageScene, number>;

export interface CreditCalculationResult {
  original: number;
  discounted: number;
  discountRate: number;
}
