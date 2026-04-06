import { d } from 'node_modules/drizzle-kit/index-BAUrj6Ib.mjs';
import { tr } from 'zod/v4/locales';

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
      'image-to-video': 12,
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
        { value: '512p', label: 'advanced_options.resolution_options.512p' },
        { value: '768p', label: 'advanced_options.resolution_options.768p' },
      ],
      duration: [
        { value: '6', label: 'advanced_options.duration_options.6s' },
        { value: '10', label: 'advanced_options.duration_options.10s' },
      ],
    },
    creditRules: [
      {
        conditions: { resolution: '768p' },
        credits: 18,
      },
      {
        conditions: { resolution: '512p', duration: '10' },
        credits: 8,
      },
      {
        conditions: { resolution: '768p', duration: '10' },
        credits: 20,
      },
    ],
    sceneValues: {
      'image-to-video': 'hailuo-02-image-to-video',
    },
    defaultOptions: {
      resolution: '512p',
      duration: '6',
      prompt_optimizer: true,
    },
    advancedOptions: {
      supportedTypes: ['resolution', 'duration'],
    },
  },
];
