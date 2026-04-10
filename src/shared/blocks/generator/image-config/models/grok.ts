import { ImageModelOption } from '../types';

export const grokModels: ImageModelOption[] = [
  {
    label: 'Grok Imagine',
    provider: 'kie',
    brand: 'grok',
    modelPath: 'grok-imagine',
    credits: {
      'text-to-image': 4,
      'image-to-image': 4,
    },
    sceneValues: {
      'text-to-image': {
        id: 'grok-imagine/text-to-image',
      },
      'image-to-image': {
        id: 'grok-imagine/image-to-image',
        maxImages: 5,
        inputValidation: {
          image: {
            maxFileSize: 10,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'image',
            fieldName: 'image_urls',
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
        { value: '9:16', label: '9:16' },
        { value: '16:9', label: '16:9' },
      ],
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      enable_pro: false,
      nsfw_checker: true,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio'],
    },
  },
];
