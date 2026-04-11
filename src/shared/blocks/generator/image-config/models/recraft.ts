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
        credits: 1,
        maxImages: 1,
        customFields: [
          {
            type: 'image',
            fieldName: 'image',
            isArray: false,
          },
        ],
        inputValidation: {
          image: {
            maxFileSize: 5,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
      },
    },
    defaultOptions: { nsfw_checker: true },
    customFields: [],
    advancedOptions: {
      supportedTypes: [],
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
        credits: 1,
        maxImages: 1,
        customFields: [
          {
            type: 'image',
            fieldName: 'image',
            isArray: false,
          },
        ],
        inputValidation: {
          image: {
            maxFileSize: 10,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
      },
    },
    defaultOptions: { nsfw_checker: true },
    customFields: [],
    advancedOptions: {
      supportedTypes: [],
    },
  },
];
