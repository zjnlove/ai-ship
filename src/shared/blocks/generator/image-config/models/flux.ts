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
        credits: 14,
        maxImages: 4,
        inputValidation: {
          image: {
            maxFileSize: 10,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'image',
            fieldName: 'input_urls',
            isArray: true,
          },
        ],
      },
    },
    customOptions: {
      aspectRatio: [
        { value: '1:1', label: '1:1' },
        { value: '2:3', label: '2:3' },
        { value: '3:2', label: '3:2' },
        { value: '3:4', label: '3:4' },
        { value: '4:3', label: '4:3' },
        { value: '9:16', label: '9:16' },
        { value: '16:9', label: '16:9' },
      ],
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      resolution: '1K',
      nsfw_checker: true,
    },
    customFields: [],
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution'],
    },
    creditRules: [
      {
        conditions: { resolution: '2K' },
        credits: 10,
      },
    ],
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
        credits: 5,
      },
      'image-to-image': {
        id: 'flux-2/pro-image-to-image',
        credits: 5,
        maxImages: 4,
        inputValidation: {
          image: {
            maxFileSize: 10,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'image',
            fieldName: 'input_urls',
            isArray: true,
          },
        ],
      },
    },
    customOptions: {
      aspectRatio: [
        { value: '1:1', label: '1:1' },
        { value: '2:3', label: '2:3' },
        { value: '3:2', label: '3:2' },
        { value: '3:4', label: '3:4' },
        { value: '4:3', label: '4:3' },
        { value: '9:16', label: '9:16' },
        { value: '16:9', label: '16:9' },
      ],
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      resolution: '1K',
      nsfw_checker: true,
    },
    customFields: [],
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution'],
    },
    creditRules: [
      {
        conditions: { resolution: '2K' },
        credits: 8,
      },
    ],
  },
];
