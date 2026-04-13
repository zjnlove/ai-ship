import { index } from 'drizzle-orm/gel-core';

import { VideoModelOption } from '../types';

export const grokModels: VideoModelOption[] = [
  {
    label: 'Grok Imagine',
    provider: 'kie',
    brand: 'grok',
    modelPath: 'grok-imagine',
    baseCredits: {
      'text-to-video': 20,
      'image-to-video': 20,
    },
    maxImages: 7,
    inputValidation: {
      image: {
        maxFileSize: 10,
        supportedFormats: ['webp', 'jpeg', 'png'],
      },
    },
    customOptions: {
      aspectRatio: [
        { value: '2:3', label: 'advanced_options.aspect_ratio_options.2_3' },
        { value: '3:2', label: 'advanced_options.aspect_ratio_options.3_2' },
        { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
        { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
        { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
      ],
      resolution: [
        { value: '480p', label: 'advanced_options.resolution_options.480p' },
        { value: '720p', label: 'advanced_options.resolution_options.720p' },
      ],
      mode: [
        { value: 'fun', label: 'advanced_options.mode_options.fun' },
        { value: 'normal', label: 'advanced_options.mode_options.normal' },
        { value: 'spicy', label: 'advanced_options.mode_options.spicy' },
      ],
      duration: {
        type: 'range',
        min: 6,
        max: 30,
        step: 1,
        unit: 's',
      },
    },
    sceneValues: {
      'text-to-video': 'grok-imagine-text-to-video',
      'image-to-video': 'grok-imagine-image-to-video',
    },
    customFields: [
      {
        type: 'image',
        fieldName: 'image_urls',
        isArray: true,
      },
    ],
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '480p',
      duration: '6',
      audio: false,
      mode: 'normal',
      index: 0,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration', 'mode'],
    },
    creditRules: [
      {
        conditions: { resolution: '480p' },
        credits: 2,
        perUnit: true,
        unitField: 'duration',
        startFrom: 7,
      },
      {
        conditions: { resolution: '720p' },
        credits: 4,
        perUnit: true,
        unitField: 'duration',
        startFrom: 7,
      },
    ],
  },
];
