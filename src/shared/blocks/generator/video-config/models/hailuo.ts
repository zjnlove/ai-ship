import { VideoModelOption } from '../types';

export const hailuoModels: VideoModelOption[] = [
  {
    label: 'Hailuo 2.3',
    provider: 'kie',
    brand: 'hailuo',
    modelPath: 'hailuo-2-3',
    baseCredits: {
      'image-to-video': 25,
    },
    maxImages: 1,
    inputValidation: {
      image: {
        maxFileSize: 10,
        supportedFormats: ['webp', 'jpeg', 'png'],
      },
    },
    customOptions: {
      resolution: [
        { value: '768p', label: 'advanced_options.resolution_options.768p' },
        { value: '1080p', label: 'advanced_options.resolution_options.1080p' },
      ],
      duration: [
        { value: '6', label: 'advanced_options.duration_options.6s' },
        { value: '10', label: 'advanced_options.duration_options.10s' },
      ],
    },
    creditRules: [
      {
        conditions: { duration: '10' },
        credits: 20,
      },
      {
        conditions: { resolution: '1080p' },
        credits: 20,
      },
    ],
    // ✅ 参数依赖约束
    dependencyRules: [
      {
        when: { resolution: '1080p' },
        then: {
          disabled: ['duration:10'],
          autoSelect: { duration: '6' },
          message: '1080p 仅支持 6 秒时长',
        },
      },
      {
        when: { duration: '10' },
        then: {
          disabled: ['resolution:1080p'],
          message: '10 秒时长仅支持 768p',
        },
      },
    ],
    sceneValues: {
      'image-to-video': 'hailuo/2-3-image-to-video-standard',
    },
    customFields: [
      {
        type: 'image',
        fieldName: 'image_url',
        isArray: false,
      },
    ],
    defaultOptions: {
      resolution: '768p',
      duration: '6',
    },
    advancedOptions: {
      supportedTypes: ['resolution', 'duration'],
    },
  },
  {
    label: 'Hailuo 02',
    provider: 'kie',
    brand: 'hailuo',
    modelPath: 'hailuo-02',
    baseCredits: {
      'text-to-video': 4,
      'image-to-video': 6,
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
        credits: 8,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '720', audio: true },
        credits: 4,
      },
    ],
    sceneValues: {
      'text-to-video': 'hailuo-02-text-to-video',
      'image-to-video': 'hailuo-02-image-to-video',
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
