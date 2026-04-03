import { VideoModelOption } from '../types';

export const klingModels: VideoModelOption[] = [
  {
    label: 'Kling 3.0',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-3-0',
    baseCredits: {
      'text-to-video': 42,
      'image-to-video': 42,
    },
    maxImages: 2,
    sceneValues: {
      'text-to-video': 'kling-3-0-text-to-video',
      'image-to-video': 'kling-3-0-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      mode: 'std',
      duration: '5',
      audio: false,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'duration', 'mode', 'audio'],
    },
    customOptions: {
      aspectRatio: [
        { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
        { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
        { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
      ],
      mode: [
        { value: 'std', label: 'advanced_options.mode_options.standard' },
        {
          value: 'pro',
          label: 'advanced_options.mode_options.professional',
        },
      ],
    },
    discount: {
      rate: 0.5,
      label: '-50% OFF',
    },
    creditRules: [
      // pro 模式基础积分
      {
        conditions: { mode: 'pro' },
        credits: 12,
      },
      // std 模式 + 时长：每秒 14 积分
      {
        conditions: { mode: 'std' },
        credits: 14,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      // pro 模式 + 时长：每秒 18 积分
      {
        conditions: { mode: 'pro' },
        credits: 18,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      // std 模式 + 声音开启基础分
      {
        conditions: { mode: 'std', audio: true },
        credits: 18,
      },
      // pro 模式 + 声音开启基础分
      {
        conditions: { mode: 'pro', audio: true },
        credits: 27,
      },
      // std 模式 + 声音时长积分
      {
        conditions: { mode: 'std', audio: true },
        credits: 6,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      // pro 模式 + 声音时长积分
      {
        conditions: { mode: 'pro', audio: true },
        credits: 9,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
    ],
  },
  {
    label: 'Kling 3.0 Motion Control',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-3-0-motion-control',
    baseCredits: {
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
      motionStrength: [
        { value: 'low', label: 'advanced_options.motion_strength_options.low' },
        {
          value: 'medium',
          label: 'advanced_options.motion_strength_options.medium',
        },
        {
          value: 'high',
          label: 'advanced_options.motion_strength_options.high',
        },
      ],
    },
    creditRules: [
      // 1080p 基础积分
      {
        conditions: { resolution: '1080' },
        credits: 10,
      },
      // 视频时长积分（从第4秒开始）
      {
        conditions: { resolution: '720' },
        credits: 10,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      {
        conditions: { resolution: '1080' },
        credits: 20,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      // 声音开启基础分
      {
        conditions: { resolution: '720', audio: true },
        credits: 5,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 10,
      },
      // 声音时长积分（从第4秒开始）
      {
        conditions: { resolution: '720', audio: true },
        credits: 2,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 3,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
    ],
    sceneValues: {
      'image-to-video': 'kling-3-0-motion-control',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '720',
      duration: '5',
      motion_strength: 'medium',
      audio: false,
    },
    advancedOptions: {
      supportedTypes: [
        'aspectRatio',
        'resolution',
        'duration',
        'motionStrength',
        'audio',
      ],
    },
  },
  {
    label: 'Kling 2.6',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-2-6',
    baseCredits: {
      'text-to-video': 55,
      'image-to-video': 55,
    },
    maxImages: 1,
    customOptions: {
      aspectRatio: [
        { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
        { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
        { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
      ],
      duration: [
        { value: '5', label: 'advanced_options.duration_options.5s' },
        { value: '10', label: 'advanced_options.duration_options.10s' },
      ],
    },
    creditRules: [
      {
        conditions: { duration: '10' },
        credits: 55,
      },
      {
        conditions: { duration: '5', audio: true },
        credits: 55,
      },
      {
        conditions: { duration: '10', audio: true },
        credits: 110,
      },
    ],
    sceneValues: {
      'text-to-video': 'kling-2.6/text-to-video ',
      'image-to-video': 'kling-2.6/image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      duration: '5',
      audio: false,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'duration', 'audio'],
    },
  },
  {
    label: 'Kling 2.6 Motion Control',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-2-6-motion-control',
    baseCredits: {
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
      motionStrength: [
        { value: 'low', label: 'advanced_options.motion_strength_options.low' },
        {
          value: 'medium',
          label: 'advanced_options.motion_strength_options.medium',
        },
        {
          value: 'high',
          label: 'advanced_options.motion_strength_options.high',
        },
      ],
    },
    creditRules: [
      // 1080p 基础积分
      {
        conditions: { resolution: '1080' },
        credits: 10,
      },
      // 视频时长积分（从第4秒开始）
      {
        conditions: { resolution: '720' },
        credits: 10,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      {
        conditions: { resolution: '1080' },
        credits: 20,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      // 声音开启基础分
      {
        conditions: { resolution: '720', audio: true },
        credits: 5,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 10,
      },
      // 声音时长积分（从第4秒开始）
      {
        conditions: { resolution: '720', audio: true },
        credits: 2,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 3,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4,
      },
    ],
    sceneValues: {
      'image-to-video': 'kling-2-6-motion-control',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '720',
      duration: '5',
      motion_strength: 'medium',
      audio: false,
    },
    advancedOptions: {
      supportedTypes: [
        'aspectRatio',
        'resolution',
        'duration',
        'motionStrength',
        'audio',
      ],
    },
  },
];
