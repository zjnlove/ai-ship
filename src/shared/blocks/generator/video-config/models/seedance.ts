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
      'text-to-video': 6,
      'image-to-video': 8,
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
      'text-to-video': 'seedance-1-5-pro-text-to-video',
      'image-to-video': 'seedance-1-5-pro-image-to-video',
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
