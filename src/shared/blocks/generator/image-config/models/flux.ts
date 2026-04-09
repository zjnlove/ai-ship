import { ImageModelOption } from '../types';

export const fluxModels: ImageModelOption[] = [
  {
    label: 'FLUX.2 Flex',
    provider: 'kie',
    brand: 'flux',
    modelPath: 'flux-2-flex',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'flux-2/flex-text-to-image',
        credits: 14,
      },
      'image-to-image': {
        id: 'flux-2/flex-image-to-image',
        credits: 16,
        customFields: [
          {
            type: 'image',
            fieldName: 'input_urls',
            isArray: true,
          },
        ],
      },
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      resolution: '1K',
      nsfw_checker: true,
    },
    customFields: [
      { type: 'string', fieldName: 'aspect_ratio', optionType: 'aspectRatio' },
      { type: 'string', fieldName: 'resolution', optionType: 'resolution' },
    ],
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution'],
    },
  },
  {
    label: 'FLUX.2 Pro',
    provider: 'kie',
    brand: 'flux',
    modelPath: 'flux-2-pro',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'flux-2/pro-text-to-image',
        credits: 6,
      },
      'image-to-image': {
        id: 'flux-2/pro-image-to-image',
        credits: 8,
        customFields: [
          {
            type: 'image',
            fieldName: 'input_urls',
            isArray: true,
          },
        ],
      },
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      resolution: '1K',
      nsfw_checker: true,
    },
    customFields: [
      { type: 'string', fieldName: 'aspect_ratio', optionType: 'aspectRatio' },
      { type: 'string', fieldName: 'resolution', optionType: 'resolution' },
    ],
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution'],
    },
  },
];
