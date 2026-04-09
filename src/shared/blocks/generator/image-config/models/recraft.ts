import { ImageModelOption } from '../types';

export const recraftModels: ImageModelOption[] = [
  {
    label: 'Recraft Remove Background',
    provider: 'kie',
    brand: 'recraft',
    modelPath: 'recraft-remove-background',
    credits: {},
    sceneValues: {
      'image-to-image': {
        id: 'recraft/remove-background',
        credits: '2',
        customFields: [
          {
            type: 'image',
            fieldName: 'image',
            isArray: false,
          },
        ],
      },
    },
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
    credits: {},
    sceneValues: {
      'image-to-image': {
        id: 'recraft/crisp-upscale',
        credits: '2',
        customFields: [
          {
            type: 'image',
            fieldName: 'image',
            isArray: false,
          },
        ],
      },
    },
    defaultOptions: {
      aspect_ratio: 'auto',
    },
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio'],
    },
  },
];
