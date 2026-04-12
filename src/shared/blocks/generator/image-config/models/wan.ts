import { ImageModelOption } from '../types';

export const wanModels: ImageModelOption[] = [
  {
    label: 'Wan 2.7 Image',
    provider: 'kie',
    brand: 'wan',
    modelPath: 'wan-2-7-image',
    credits: {
      'text-to-image': 5,
      'image-to-image': 5,
    },
    sceneValues: {
      'text-to-image': {
        id: 'wan/2-7-image',
      },
      'image-to-image': {
        id: 'wan/2-7-image',
        maxImages: 9,
        customFields: [
          {
            type: 'image',
            fieldName: 'input_urls',
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
    customOptions: {
      aspectRatio: [
        { value: '1:1', label: '1:1' },
        { value: '3:4', label: '3:4' },
        { value: '4:3', label: '4:3' },
        { value: '1:8', label: '1:8' },
        { value: '8:1', label: '8:1' },
        { value: '9:16', label: '9:16' },
        { value: '16:9', label: '16:9' },
        { value: '21:9', label: '21:9' },
      ],
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      nsfw_checker: true,
      enable_sequential: false,
      thinking_mode: false,
      seed: 0,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'seed', 'switch'],
      switches: [
        {
          id: 'enable_sequential',
          label: 'advanced_options.enable_sequential',
          defaultValue: false,
        },
        {
          id: 'thinking_mode',
          label: 'advanced_options.thinking_mode',
          defaultValue: false,
        },
      ],
    },
    dependencyRules: [
      {
        when: {
          enable_sequential: true,
        },
        then: {
          disabled: ['thinking_mode'],
          autoSelect: {
            thinking_mode: false,
          },
        },
      },
    ],
  },
];
