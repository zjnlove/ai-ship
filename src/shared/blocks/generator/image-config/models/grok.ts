import { ImageModelOption } from '../types';

export const grokModels: ImageModelOption[] = [
  {
    label: 'Grok Imagine',
    provider: 'kie',
    brand: 'grok',
    modelPath: 'grok-imagine',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'grok-imagine/text-to-image',
        credits: 4,
      },
      'image-to-image': {
        id: 'grok-imagine/image-to-image',
        credits: 6,
        customFields: [
          {
            type: 'image',
            fieldName: 'image_input',
            isArray: true,
          },
        ],
      },
    },
    defaultOptions: {},
    advancedOptions: {
      supportedTypes: [],
    },
  },
];
