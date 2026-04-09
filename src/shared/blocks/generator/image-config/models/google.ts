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
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'nano-banana-pro',
        credits: 12,
      },
      'image-to-image': {
        id: 'nano-banana-pro',
        credits: 14,
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
      aspect_ratio: 'auto',
      resolution: '1K',
      output_format: 'png',
    },
    customFields: [
      { type: 'string', fieldName: 'aspect_ratio', optionType: 'aspectRatio' },
      {
        type: 'string',
        fieldName: 'output_format',
        optionType: 'outputFormat',
      },
      { type: 'string', fieldName: 'resolution', optionType: 'resolution' },
    ],
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'outputFormat', 'resolution'],
    },
    discount: {
      rate: 0.5,
      label: '-50% OFF',
    },
  },
  {
    label: 'Nano Banana',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'google/nano-banana',
        credits: 4,
      },
      'image-to-image': {
        id: 'google/nano-banana-edit',
        credits: 6,
        customFields: [
          {
            type: 'image',
            fieldName: 'image_urls',
            isArray: true,
          },
        ],
      },
    },
    defaultOptions: {
      image_size: '1:1',
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
