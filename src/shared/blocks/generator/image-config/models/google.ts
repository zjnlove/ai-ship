import { ImageModelOption } from '../types';

export const googleModels: ImageModelOption[] = [
  {
    label: 'Nano Banana 2',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana-2',
    credits: {
      'text-to-image': 4,
      'image-to-image': 4,
    },
    sceneValues: {
      'text-to-image': {
        id: 'nano-banana-2',
      },
      'image-to-image': {
        id: 'nano-banana-2',
        maxImages: 14,
        inputValidation: {
          image: {
            maxFileSize: 30,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'image',
            fieldName: 'image_input',
            isArray: true,
          },
        ],
      },
    },
    customOptions: {
      resolution: [
        { value: '1K', label: '1K' },
        { value: '2K', label: '2K' },
        { value: '4K', label: '4K' },
      ],
    },
    defaultOptions: {
      aspect_ratio: 'auto',
      resolution: '1K',
      output_format: 'png',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'outputFormat', 'resolution'],
    },
    creditRules: [
      {
        conditions: { resolution: '2K' },
        credits: 4,
      },
      {
        conditions: { resolution: '4K' },
        credits: 8,
      },
    ],
  },
  {
    label: 'Nano Banana Pro',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana-pro',
    credits: {
      'text-to-image': 8,
      'image-to-image': 8,
    },
    sceneValues: {
      'text-to-image': {
        id: 'nano-banana-pro',
      },
      'image-to-image': {
        id: 'nano-banana-pro',
        maxImages: 8,
        inputValidation: {
          image: {
            maxFileSize: 30,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'image',
            fieldName: 'image_input',
            isArray: true,
          },
        ],
      },
    },
    customOptions: {
      resolution: [
        { value: '1K', label: '1K' },
        { value: '2K', label: '2K' },
        { value: '4K', label: '4K' },
      ],
    },
    defaultOptions: {
      aspect_ratio: 'auto',
      resolution: '1K',
      output_format: 'png',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'outputFormat', 'resolution'],
    },
    creditRules: [
      {
        conditions: { resolution: '2K' },
        credits: 2,
      },
      {
        conditions: { resolution: '4K' },
        credits: 6,
      },
    ],
  },
  {
    label: 'Nano Banana Edit',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana-edit',
    credits: {
      'image-to-image': 4,
    },
    sceneValues: {
      'image-to-image': {
        id: 'google/nano-banana-edit',
        maxImages: 10,
        inputValidation: {
          image: {
            maxFileSize: 10,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'string',
            fieldName: 'image_size',
            optionType: 'aspectRatio',
          },
          {
            type: 'image',
            fieldName: 'image_urls',
            isArray: true,
          },
        ],
      },
    },
    customOptions: {},
    defaultOptions: {
      output_format: 'png',
      nsfw_checker: true,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'outputFormat'],
    },
    creditRules: [],
  },
  {
    label: 'Nano Banana',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana',
    credits: {
      'text-to-image': 4,
    },
    sceneValues: {
      'text-to-image': {
        id: 'google/nano-banana',
        customFields: [
          {
            type: 'string',
            fieldName: 'image_size',
            optionType: 'aspectRatio',
          },
        ],
      },
    },
    customOptions: {
      resolution: [],
    },
    defaultOptions: {
      output_format: 'png',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'outputFormat'],
    },
    creditRules: [],
  },
  {
    label: 'Imagen 4',
    provider: 'kie',
    brand: 'google',
    modelPath: 'imagen-4',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'google/imagen4',
        credits: 8,
      },
      'image-to-image': {
        id: 'google/imagen4',
        customFields: [
          {
            type: 'image',
            fieldName: 'image_input',
            isArray: true,
          },
        ],
      },
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      output_format: 'png',
    },
    customFields: [
      { type: 'string', fieldName: 'aspect_ratio', optionType: 'aspectRatio' },
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
