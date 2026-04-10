import { ImageModelOption } from '../types';

export const openaiModels: ImageModelOption[] = [
  {
    label: 'gpt-image-1.5',
    provider: 'kie',
    brand: 'openai',
    modelPath: 'gpt-image-1-5',
    credits: {
      'text-to-image': 4,
      'image-to-image': 4,
    },
    sceneValues: {
      'text-to-image': {
        id: 'gpt-image/1.5-text-to-image',
      },
      'image-to-image': {
        id: 'gpt-image/1.5-image-to-image',
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
      ],
      quality: [
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      quality: 'medium',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'quality'],
    },
    creditRules: [
      {
        conditions: { quality: 'high' },
        credits: 16,
      },
    ],
  },
];
