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
    inputValidation: {
      image: {
        maxFileSize: 10,
        supportedFormats: ['webp', 'jpeg', 'png'],
      },
      video: {
        maxFileSize: 10,
        supportedFormats: ['mp4', 'quicktime'],
      },
    },
    customFields: [
      {
        type: 'image',
        fieldName: 'image_urls',
        isArray: true,
      },
      {
        type: 'video',
        fieldName: 'video_urls',
        isArray: true,
      },
    ],
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
        customOptions: {
          resolution: [
            {
              value: '720p',
              label: 'advanced_options.resolution_options.720p',
            },
            {
              value: '1080p',
              label: 'advanced_options.resolution_options.1080p',
            },
          ],
          duration: [
            { value: '5', label: 'advanced_options.duration_options.5s' },
            { value: '10', label: 'advanced_options.duration_options.10s' },
          ],
        },
      },
    },
    defaultOptions: {
      resolution: '720p',
      duration: '5',
      nsfw_checker: false,
    },
    advancedOptions: {
      supportedTypes: ['duration', 'resolution'],
    },
  },
];
