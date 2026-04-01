// 通用选项集
export const IMAGE_SIZE_OPTIONS = [
  { value: '1:1', label: '1:1' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
];

export const ASPECT_RATIO_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  ...IMAGE_SIZE_OPTIONS,
];

export const OUTPUT_FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
];

export const QUALITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const RESOLUTION_OPTIONS = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
];

export type OptionType =
  | 'imageSize'
  | 'aspectRatio'
  | 'outputFormat'
  | 'quality'
  | 'resolution';

// 工具函数
export function getOptionsForType(type: OptionType) {
  const optionsMap = {
    imageSize: IMAGE_SIZE_OPTIONS,
    aspectRatio: ASPECT_RATIO_OPTIONS,
    outputFormat: OUTPUT_FORMAT_OPTIONS,
    quality: QUALITY_OPTIONS,
    resolution: RESOLUTION_OPTIONS,
  };
  return optionsMap[type] || [];
}

export function getOptionLabel(type: OptionType): string {
  const labelMap = {
    imageSize: 'Size',
    aspectRatio: 'Size',
    outputFormat: 'Format',
    quality: 'Quality',
    resolution: 'Resolution',
  };
  return labelMap[type] || '';
}

export interface AdvancedOptions {
  imageSizeField?: 'image_size' | 'aspect_ratio';
  supportedTypes: OptionType[];
}

export interface ModelOption {
  label: string;
  provider: string;
  brand: string;
  modelPath: string;
  credits: Record<string, string>;
  sceneValues: Record<string, string>;
  imageField: string;
  defaultOptions: Record<string, any>;
  advancedOptions?: AdvancedOptions;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    label: 'Qwen Image 2',
    provider: 'kie',
    brand: 'qwen',
    modelPath: 'qwen-image-2',
    credits: {
      'text-to-image': '6',
      'image-to-image': '8',
    },
    sceneValues: {
      'text-to-image': 'qwen2/text-to-image',
      'image-to-image': 'qwen2/image-edit',
    },
    imageField: 'image_url',
    defaultOptions: {
      image_size: '16:9',
      output_format: 'png',
    },
    advancedOptions: {
      imageSizeField: 'image_size',
      supportedTypes: ['imageSize', 'outputFormat'],
    },
  },
  {
    label: 'Qwen Image',
    provider: 'kie',
    brand: 'qwen',
    modelPath: 'qwen-image',
    credits: {
      'text-to-image': '4',
      'image-to-image': '6',
    },
    sceneValues: {
      'text-to-image': 'qwen/text-to-image',
      'image-to-image': 'qwen/image-to-image',
    },
    imageField: 'image_url',
    defaultOptions: {
      image_size: '16:9',
      output_format: 'png',
    },
    advancedOptions: {
      imageSizeField: 'image_size',
      supportedTypes: ['imageSize', 'outputFormat'],
    },
  },
  {
    label: 'Nano Banana 2',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana-2',
    credits: {
      'text-to-image': '10',
      'image-to-image': '12',
    },
    sceneValues: {
      'text-to-image': 'nano-banana-2',
      'image-to-image': 'nano-banana-2',
    },
    imageField: 'image_input',
    defaultOptions: {
      aspect_ratio: 'auto',
      resolution: '1K',
      output_format: 'png',
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'outputFormat', 'resolution'],
    },
  },
  {
    label: 'Nano Banana Pro',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana-pro',
    credits: {
      'text-to-image': '12',
      'image-to-image': '14',
    },
    sceneValues: {
      'text-to-image': 'nano-banana-pro',
      'image-to-image': 'nano-banana-pro',
    },
    imageField: 'image_input',
    defaultOptions: {
      aspect_ratio: 'auto',
      resolution: '1K',
      output_format: 'png',
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'outputFormat', 'resolution'],
    },
  },
  {
    label: 'Nano Banana',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana',
    credits: {
      'text-to-image': '4',
      'image-to-image': '6',
    },
    sceneValues: {
      'text-to-image': 'google/nano-banana',
      'image-to-image': 'google/nano-banana-edit',
    },
    imageField: 'image_urls',
    defaultOptions: {
      image_size: '1:1',
      output_format: 'png',
    },
    advancedOptions: {
      imageSizeField: 'image_size',
      supportedTypes: ['imageSize', 'outputFormat'],
    },
  },
  {
    label: 'Imagen 4',
    provider: 'kie',
    brand: 'google',
    modelPath: 'imagen-4',
    credits: {
      'text-to-image': '8',
    },
    sceneValues: {
      'text-to-image': 'google/imagen4',
    },
    imageField: 'image_input',
    defaultOptions: {
      aspect_ratio: '1:1',
      output_format: 'png',
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'outputFormat'],
    },
  },
  {
    label: 'gpt-image-1.5',
    provider: 'kie',
    brand: 'openai',
    modelPath: 'gpt-image-1-5',
    credits: {
      'text-to-image': '4',
      'image-to-image': '6',
    },
    sceneValues: {
      'text-to-image': 'gpt-image/1.5-text-to-image',
      'image-to-image': 'gpt-image/1.5-image-to-image',
    },
    imageField: 'input_urls',
    defaultOptions: {
      aspect_ratio: '1:1',
      quality: 'medium',
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'quality'],
    },
  },
  {
    label: 'FLUX.2 Flex',
    provider: 'kie',
    brand: 'flux',
    modelPath: 'flux-2-flex',
    credits: {
      'text-to-image': '14',
      'image-to-image': '16',
    },
    sceneValues: {
      'text-to-image': 'flux-2/flex-text-to-image',
      'image-to-image': 'flux-2/flex-image-to-image',
    },
    imageField: 'input_urls',
    defaultOptions: {
      aspect_ratio: '1:1',
      resolution: '1K',
      nsfw_checker: true,
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'resolution'],
    },
  },
  {
    label: 'FLUX.2 Pro',
    provider: 'kie',
    brand: 'flux',
    modelPath: 'flux-2-pro',
    credits: {
      'text-to-image': '6',
      'image-to-image': '8',
    },
    sceneValues: {
      'text-to-image': 'flux-2/pro-text-to-image',
      'image-to-image': 'flux-2/pro-image-to-image',
    },
    imageField: 'input_urls',
    defaultOptions: {
      aspect_ratio: '1:1',
      resolution: '1K',
      nsfw_checker: true,
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'resolution'],
    },
  },
  {
    label: 'Grok Imagine',
    provider: 'kie',
    brand: 'grok',
    modelPath: 'grok-imagine',
    credits: {
      'text-to-image': '4',
      'image-to-image': '6',
    },
    sceneValues: {
      'text-to-image': 'grok-imagine/text-to-image',
      'image-to-image': 'grok-imagine/image-to-image',
    },
    imageField: 'image_input',
    defaultOptions: {},
    advancedOptions: {
      supportedTypes: [],
    },
  },
  {
    label: 'Recraft Remove Background',
    provider: 'kie',
    brand: 'recraft',
    modelPath: 'recraft-remove-background',
    credits: {
      'image-to-image': '2',
    },
    sceneValues: {
      'image-to-image': 'recraft/remove-background',
    },
    imageField: 'image',
    defaultOptions: {
      aspect_ratio: 'auto',
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio'],
    },
  },
  {
    label: 'Recraft Crisp Upscale',
    provider: 'kie',
    brand: 'recraft',
    modelPath: 'recraft-crisp-upscale',
    credits: {
      'image-to-image': '2',
    },
    sceneValues: {
      'image-to-image': 'recraft/crisp-upscale',
    },
    imageField: 'image',
    defaultOptions: {
      aspect_ratio: 'auto',
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio'],
    },
  },
];

export const PROVIDER_OPTIONS = [
  {
    value: 'qwen',
    label: 'Qwen',
  },
  {
    value: 'google',
    label: 'Google',
  },
  {
    value: 'openai',
    label: 'OpenAI',
  },
  {
    value: 'flux',
    label: 'Flux',
  },
  {
    value: 'grok',
    label: 'Grok',
  },
  {
    value: 'recraft',
    label: 'Recraft',
  },
];
