import { VideoModelOption } from '../types';

export const hailuoModels: VideoModelOption[] = [
  {
    label: 'Hailuo 2.3',
    provider: 'kie',
    brand: 'hailuo',
    modelPath: 'hailuo-2-3',
    baseCredits: {
      'text-to-video': 5,
      'image-to-video': 7,
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
        credits: 10,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '1080' },
        credits: 20,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '720', audio: true },
        credits: 5,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 10,
      },
    ],
    sceneValues: {
      'text-to-video': 'hailuo-2-3-text-to-video',
      'image-to-video': 'hailuo-2-3-image-to-video',
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
