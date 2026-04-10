import { ImageModelOption } from '../types';

export const qwenModels: ImageModelOption[] = [
  {
    label: 'Qwen Image 2',
    provider: 'kie',
    brand: 'qwen',
    modelPath: 'qwen-image-2',
    credits: {
      'text-to-image': 6,
      'image-to-image': 6,
    },
    sceneValues: {
      'text-to-image': {
        id: 'qwen2/text-to-image',
        customFields: [
          {
            type: 'string',
            fieldName: 'image_size',
            optionType: 'aspectRatio',
          },
        ],
      },
      'image-to-image': {
        id: 'qwen2/image-edit',
        maxImages: 3,
        inputValidation: {
          image: {
            maxFileSize: 10,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'image',
            fieldName: 'image_url',
            isArray: true,
          },
          {
            type: 'string',
            fieldName: 'image_size',
            optionType: 'aspectRatio',
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
        { value: '21:9', label: '21:9' },
      ],
      outputFormat: [
        { value: 'png', label: 'PNG' },
        { value: 'jpeg', label: 'JPEG' },
      ],
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      output_format: 'png',
      seed: 0,
      nsfw_checker: true,
    },

    advancedOptions: {
      supportedTypes: ['aspectRatio', 'outputFormat', 'seed'],
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
