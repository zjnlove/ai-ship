import { ImageModelOption } from '../types';

export const openaiModels: ImageModelOption[] = [
  {
    label: 'gpt-image-1.5',
    provider: 'kie',
    brand: 'openai',
    modelPath: 'gpt-image-1-5',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'gpt-image/1.5-text-to-image',
        credits: '4',
      },
      'image-to-image': {
        id: 'gpt-image/1.5-image-to-image',
        credits: '6',
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
      quality: 'medium',
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'quality'],
    },
  },
];
