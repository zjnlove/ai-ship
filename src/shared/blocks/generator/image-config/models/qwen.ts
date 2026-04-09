import { ImageModelOption } from '../types';

export const qwenModels: ImageModelOption[] = [
  {
    label: 'Qwen Image 2',
    provider: 'kie',
    brand: 'qwen',
    modelPath: 'qwen-image-2',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'qwen2/text-to-image',
        credits: 6,
      },
      'image-to-image': {
        id: 'qwen2/image-edit',
        credits: 8,
        customFields: [
          {
            type: 'image',
            fieldName: 'image_url',
            isArray: true,
          },
        ],
      },
    },
    defaultOptions: {
      image_size: '16:9',
      output_format: 'png',
    },
    customFields: [
      { type: 'string', fieldName: 'image_size', optionType: 'aspectRatio' },
      {
        type: 'string',
        fieldName: 'output_format',
        optionType: 'outputFormat',
      },
    ],
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'outputFormat'],
    },
  },
  {
    label: 'Qwen Image',
    provider: 'kie',
    brand: 'qwen',
    modelPath: 'qwen-image',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'qwen/text-to-image',
        credits: 4,
      },
      'image-to-image': {
        id: 'qwen/image-to-image',
        credits: 6,
        customFields: [
          {
            type: 'image',
            fieldName: 'image_url',
            isArray: true,
          },
        ],
      },
    },
    defaultOptions: {
      image_size: '16:9',
      output_format: 'png',
    },
    customFields: [
      { type: 'string', fieldName: 'image_size', optionType: 'aspectRatio' },
      {
        type: 'string',
        fieldName: 'output_format',
        optionType: 'outputFormat',
      },
    ],
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'outputFormat'],
    },
  },
];
