import { VideoModelOption } from '../types';

export const wanModels: VideoModelOption[] = [
  {
    label: 'Wan 2.6',
    provider: 'kie',
    brand: 'wan',
    modelPath: 'wan-2-6',
    baseCredits: {
      'text-to-video': 70,
      'image-to-video': 70,
      'video-to-video': 70,
    },
    maxImages: 1,
    customOptions: {
      resolution: [
        { value: '720p', label: 'advanced_options.resolution_options.720p' },
        { value: '1080p', label: 'advanced_options.resolution_options.1080p' },
      ],
      duration: [
        { value: '5', label: 'advanced_options.duration_options.5s' },
        { value: '10', label: 'advanced_options.duration_options.10s' },
        { value: '15', label: 'advanced_options.duration_options.15s' },
      ],
    },
    creditRules: [
      {
        conditions: { resolution: '1080p' },
        credits: 35,
      },
      {
        conditions: { resolution: '720p' },
        credits: 70,
        perUnit: true,
        unitField: 'duration',
        startFrom: 6,
        unitStep: 5,
      },
      {
        conditions: { resolution: '1080p' },
        credits: 105,
        perUnit: true,
        unitField: 'duration',
        startFrom: 6,
        unitStep: 5,
      },
    ],
    sceneValues: {
      'text-to-video': {
        id: 'wan/2-6-text-to-video',
        maxImages: 0,
        maxVideos: 0,
        showImageUploader: false,
        defaultOptions: {
          resolution: '720p',
          duration: '10',
        },
      },
      'image-to-video': {
        id: 'wan/2-6-image-to-video',
        maxImages: 1,
        maxVideos: 0,
        showImageUploader: true,
      },
      'video-to-video': {
        id: 'wan/2-6-video-to-video',
        maxImages: 0,
        maxVideos: 1,
        showImageUploader: false,
      },
    },
    defaultOptions: {
      resolution: '720p',
      duration: '5',
    },
    advancedOptions: {
      supportedTypes: ['duration', 'resolution'],
    },
  },
  {
    label: 'Wan 2.5',
    provider: 'kie',
    brand: 'wan',
    modelPath: 'wan-2-5',
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
      'text-to-video': 'wan-2-5-text-to-video',
      'image-to-video': 'wan-2-5-image-to-video',
      'video-to-video': 'wan-2-5-video-to-video',
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
