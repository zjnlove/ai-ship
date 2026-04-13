import { ImageModelOption } from '../types';

export const wanModels: ImageModelOption[] = [
  {
    label: 'Wan 2.7 Image',
    provider: 'kie',
    brand: 'wan',
    modelPath: 'wan-2-7',
    credits: {
      'text-to-image': 5,
      'image-to-image': 5,
    },
    sceneValues: {
      'text-to-image': {
        id: 'wan/2-7-image',
        customFields: [
          {
            type: 'number',
            fieldName: 'n',
            optionType: 'outputs',
          },
        ],
      },
      'image-to-image': {
        id: 'wan/2-7-image',
        maxImages: 9,
        inputValidation: {
          image: {
            maxFileSize: 5,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'image',
            fieldName: 'input_urls',
            isArray: false,
          },
          {
            type: 'number',
            fieldName: 'n',
            optionType: 'outputs',
          },
        ],
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
      outputs: {
        type: 'range',
        min: 1,
        max: 4,
        step: 1,
      },
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      outputs: 1,
      nsfw_checker: true,
      enable_sequential: false,
      resolution: '1K',
      watermark: false,
      thinking_mode: false,
      seed: 0,
    },
    advancedOptions: {
      supportedTypes: [
        'aspectRatio',
        'outputs',
        'resolution',
        'seed',
        'switch',
      ],
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
          updateOptions: {
            outputs: {
              max: 12,
            },
          },
        },
      },
    ],
    creditRules: [
      {
        conditions: { resolution: '2K' },
        credits: 5,
      },
      {
        conditions: {},
        credits: 5,
        perUnit: true,
        unitField: 'outputs',
        startFrom: 2,
      },
    ],
  },
  {
    label: 'Wan 2.7 Image Pro',
    provider: 'kie',
    brand: 'wan',
    modelPath: 'wan-2-7-pro',
    credits: {
      'text-to-image': 12,
      'image-to-image': 12,
    },
    sceneValues: {
      'text-to-image': {
        id: 'wan/2-7-image-pro',
        customFields: [
          {
            type: 'number',
            fieldName: 'n',
            optionType: 'outputs',
          },
        ],
      },
      'image-to-image': {
        id: 'wan/2-7-image-pro',
        maxImages: 9,
        inputValidation: {
          image: {
            maxFileSize: 5,
            supportedFormats: ['jpeg', 'png', 'webp'],
          },
        },
        customFields: [
          {
            type: 'image',
            fieldName: 'input_urls',
            isArray: false,
          },
          {
            type: 'number',
            fieldName: 'n',
            optionType: 'outputs',
          },
        ],
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
      outputs: {
        type: 'range',
        min: 1,
        max: 4,
        step: 1,
      },
      resolution: [
        { value: '1K', label: '1K' },
        { value: '2K', label: '2K' },
        { value: '4K', label: '4K' },
      ],
    },
    defaultOptions: {
      aspect_ratio: '1:1',
      outputs: 1,
      nsfw_checker: true,
      resolution: '1K',
      enable_sequential: false,
      watermark: false,
      thinking_mode: false,
      seed: 0,
    },
    advancedOptions: {
      supportedTypes: [
        'aspectRatio',
        'outputs',
        'resolution',
        'seed',
        'switch',
      ],
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
          updateOptions: {
            outputs: {
              max: 12,
            },
          },
        },
      },
    ],
    creditRules: [
      {
        conditions: { resolution: '2K' },
        credits: 12,
      },
      {
        conditions: { resolution: '4K' },
        credits: 24,
      },
      {
        conditions: {},
        credits: 12,
        perUnit: true,
        unitField: 'outputs',
        startFrom: 2,
      },
    ],
  },
];
