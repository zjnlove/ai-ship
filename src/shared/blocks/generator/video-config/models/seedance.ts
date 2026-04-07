import { VideoModelOption } from '../types';

export const seedanceModels: VideoModelOption[] = [
  {
    label: 'Seedance 2.0',
    provider: 'kie',
    brand: 'seedance',
    modelPath: 'seedance-2-0',
    baseCredits: {
      'text-to-video': 8,
      'image-to-video': 10,
    },
    customOptions: {
      aspectRatio: [
        { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
        { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
        { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
      ],
      resolution: [
        { value: '720', label: 'advanced_options.resolution_options.720p' },
        { value: '1080', label: 'advanced_options.resolution_options.1080p' },
      ],
      duration: [
        { value: '5', label: 'advanced_options.duration_options.5s' },
        { value: '10', label: 'advanced_options.duration_options.10s' },
        { value: '15', label: 'advanced_options.duration_options.15s' },
      ],
    },
    creditRules: [
      {
        conditions: { resolution: '720' },
        credits: 12,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '1080' },
        credits: 25,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '720', audio: true },
        credits: 6,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 12,
      },
    ],
    sceneValues: {
      'text-to-video': 'seedance-2-0-text-to-video',
      'image-to-video': 'seedance-2-0-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '720',
      duration: '5',
      audio: false,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration', 'audio'],
    },
  },
  {
    label: 'Seedance 1.5 Pro',
    provider: 'kie',
    brand: 'seedance',
    modelPath: 'seedance-1-5-pro',
    baseCredits: {
      'text-to-video': 7,
      'image-to-video': 7,
    },
    maxImages: 2,
    inputValidation: {
      image: {
        maxFileSize: 10,
        supportedFormats: ['webp', 'jpeg', 'png'],
      },
    },
    customOptions: {
      aspectRatio: [
        { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
        { value: '21:9', label: 'advanced_options.aspect_ratio_options.21_9' },
        { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
        { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
        { value: '4:3', label: 'advanced_options.aspect_ratio_options.4_3' },
        { value: '3:4', label: 'advanced_options.aspect_ratio_options.3_4' },
      ],
      resolution: [
        { value: '480p', label: 'advanced_options.resolution_options.480p' },
        { value: '720p', label: 'advanced_options.resolution_options.720p' },
        { value: '1080p', label: 'advanced_options.resolution_options.1080p' },
      ],
      duration: [
        { value: '4', label: 'advanced_options.duration_options.4s' },
        { value: '8', label: 'advanced_options.duration_options.8s' },
        { value: '12', label: 'advanced_options.duration_options.12s' },
      ],
    },
    creditRules: [
      {
        conditions: { resolution: '720p' },
        credits: 7,
      },
      {
        conditions: { resolution: '1080p' },
        credits: 23,
      },
      {
        conditions: { resolution: '480p' },
        credits: 7,
        perUnit: true,
        unitField: 'duration',
        startFrom: 5,
        unitStep: 4,
      },
      {
        conditions: { resolution: '720p' },
        credits: 14,
        perUnit: true,
        unitField: 'duration',
        startFrom: 5,
        unitStep: 4,
      },
      {
        conditions: { resolution: '1080p' },
        credits: 30,
        perUnit: true,
        unitField: 'duration',
        startFrom: 5,
        unitStep: 4,
      },
      {
        conditions: { audio: true },
        multiplier: 2,
      },
    ],
    sceneValues: {
      'image-to-video': 'bytedance/seedance-1.5-pro',
    },
    customFields: [
      {
        type: 'image',
        fieldName: 'input_urls',
        isArray: true,
      },
      {
        type: 'audio',
        fieldName: 'generate_audio',
        defaultValue: false,
      },
      {
        type: 'fix_camera',
        fieldName: 'fixed_lens',
        defaultValue: false,
      },
    ],
    defaultOptions: {
      aspect_ratio: '1:1',
      resolution: '720p',
      duration: '8',
      generate_audio: false,
      fixed_lens: false,
      nsfw_checker: false,
    },
    advancedOptions: {
      supportedTypes: [
        'aspectRatio',
        'resolution',
        'duration',
        'audio',
        'fix_camera',
      ],
    },
  },
  {
    label: 'Seedance 1.0 Pro Fast',
    provider: 'kie',
    brand: 'seedance',
    modelPath: 'seedance-1-0-pro-fast',
    baseCredits: {
      'text-to-video': 3,
      'image-to-video': 5,
    },
    customOptions: {
      aspectRatio: [
        { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
        { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
        { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
      ],
      resolution: [
        { value: '720', label: 'advanced_options.resolution_options.720p' },
      ],
      duration: [
        { value: '5', label: 'advanced_options.duration_options.5s' },
        { value: '10', label: 'advanced_options.duration_options.10s' },
      ],
    },
    creditRules: [
      {
        conditions: { resolution: '720' },
        credits: 6,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '720', audio: true },
        credits: 3,
      },
    ],
    sceneValues: {
      'text-to-video': 'seedance-1-0-pro-fast-text-to-video',
      'image-to-video': 'seedance-1-0-pro-fast-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '720',
      duration: '5',
      audio: false,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration', 'audio'],
    },
  },
];
