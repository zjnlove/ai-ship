import {
  ImageDefaultCreditMap,
  ImageOptionType,
  ImageOptionValue,
  ImageProviderOption,
} from './types';

export const IMAGE_SIZE_OPTIONS: ImageOptionValue[] = [
  { value: '1:1', label: '1:1' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
];

export const ASPECT_RATIO_OPTIONS: ImageOptionValue[] = [
  { value: 'auto', label: 'Auto' },
  ...IMAGE_SIZE_OPTIONS,
];

export const OUTPUT_FORMAT_OPTIONS: ImageOptionValue[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
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

export const PROVIDER_OPTIONS: ImageProviderOption[] = [
  { value: 'google', label: 'Google' },
  { value: 'qwen', label: 'Qwen' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'flux', label: 'Flux' },
  { value: 'grok', label: 'Grok' },
  { value: 'recraft', label: 'Recraft' },
];

export const IMAGE_OPTION_LABELS: Record<ImageOptionType, string> = {
  imageSize: 'Size',
  aspectRatio: 'Size',
  outputFormat: 'Format',
  quality: 'Quality',
  resolution: 'Resolution',
};

export const DEFAULT_CREDITS: ImageDefaultCreditMap = {
  'text-to-image': 2,
  'image-to-image': 4,
};
