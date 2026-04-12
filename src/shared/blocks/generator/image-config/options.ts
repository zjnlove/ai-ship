import {
  ImageDefaultCreditMap,
  ImageOptionType,
  ImageOptionValue,
  ImageProviderOption,
} from './types';

export const IMAGE_SIZE_OPTIONS: ImageOptionValue[] = [
  { value: '1:1', label: '1:1' },
  { value: '2:3', label: '2:3' },
  { value: '3:2', label: '3:2' },
  { value: '3:4', label: '3:4' },
  { value: '4:3', label: '4:3' },
  { value: '4:5', label: '4:5' },
  { value: '5:4', label: '5:4' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
  { value: '21:9', label: '21:9' },
];

export const ASPECT_RATIO_OPTIONS: ImageOptionValue[] = [
  { value: 'auto', label: 'Auto' },
  ...IMAGE_SIZE_OPTIONS,
];

export const OUTPUT_FORMAT_OPTIONS: ImageOptionValue[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
];

export const QUALITY_OPTIONS: ImageOptionValue[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const RESOLUTION_OPTIONS: ImageOptionValue[] = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
];

export const SEED_OPTIONS: ImageOptionValue[] = [];

export const PROVIDER_OPTIONS: ImageProviderOption[] = [
  { value: 'google', label: 'Google' },
  { value: 'qwen', label: 'Qwen' },
  { value: 'wan', label: 'Wan' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'flux', label: 'Flux' },
  { value: 'grok', label: 'Grok' },
  { value: 'recraft', label: 'Recraft' },
];

export const IMAGE_OPTION_LABELS: Record<ImageOptionType, string> = {
  aspectRatio: 'advanced_options.aspect_ratio',
  outputFormat: 'advanced_options.output_format',
  quality: 'advanced_options.quality',
  resolution: 'advanced_options.resolution',
  seed: 'advanced_options.seed',
};

export const DEFAULT_CREDITS: ImageDefaultCreditMap = {
  'text-to-image': 2,
  'image-to-image': 4,
};
