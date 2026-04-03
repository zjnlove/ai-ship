import { VideoModelOption } from '../types';

export const googleModels: VideoModelOption[] = [
  {
    label: 'Veo 3.1',
    provider: 'kie',
    brand: 'google',
    modelPath: 'veo-3-1',
    baseCredits: {
      'text-to-video': 30,
      'image-to-video': 30,
    },
    customOptions: {
      aspectRatio: [
        { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
        { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
        { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
      ],
    },
    sceneValues: {
      'text-to-video': 'veo3_fast',
      'image-to-video': 'veo3_fast',
    },
    imageField: {
      fieldName: 'imageUrls',
      isArray: true,
    },
    defaultOptions: {
      imageUrls: [],
      aspect_ratio: '16:9',
      seeds: 62845,
      enableTranslation: true,
      generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'refFrameMode'],
    },
  },
];
