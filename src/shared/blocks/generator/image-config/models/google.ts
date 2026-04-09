import { ImageModelOption } from '../types';

export const googleModels: ImageModelOption[] = [
  {
    label: 'Nano Banana 2',
    provider: 'kie',
    brand: 'google',
    modelPath: 'nano-banana-2',
    credits: {},
    sceneValues: {
      'text-to-image': {
        id: 'nano-banana-2',
        credits: '10',
      },
      'image-to-image': {
        id: 'nano-banana-2',
        credits: '12',
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
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'outputFormat', 'resolution'],
    },
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
        credits: '12',
      },
      'image-to-image': {
        id: 'nano-banana-pro',
        credits: '14',
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
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
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
        credits: '4',
      },
      'image-to-image': {
        id: 'google/nano-banana-edit',
        credits: '6',
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
    advancedOptions: {
      imageSizeField: 'image_size',
      supportedTypes: ['imageSize', 'outputFormat'],
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
        credits: '8',
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
    advancedOptions: {
      imageSizeField: 'aspect_ratio',
      supportedTypes: ['aspectRatio', 'outputFormat'],
    },
  },
];
