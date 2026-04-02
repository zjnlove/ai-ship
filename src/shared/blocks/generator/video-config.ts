// 视频宽高比选项
export const VIDEO_ASPECT_RATIO_OPTIONS = [
  { value: 'auto', label: 'advanced_options.aspect_ratio_options.auto' },
  { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
  { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
  { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
  { value: '4:3', label: 'advanced_options.aspect_ratio_options.4_3' },
];

// 视频分辨率选项
export const VIDEO_RESOLUTION_OPTIONS = [
  { value: '720', label: 'advanced_options.resolution_options.720p' },
  { value: '1080', label: 'advanced_options.resolution_options.1080p' },
  { value: '4k', label: 'advanced_options.resolution_options.4k' },
];

// 视频时长选项
export const VIDEO_DURATION_OPTIONS = [
  { value: '5', label: 'advanced_options.duration_options.5s' },
  { value: '10', label: 'advanced_options.duration_options.10s' },
  { value: '15', label: 'advanced_options.duration_options.15s' },
];

// 视频帧率选项
export const VIDEO_FPS_OPTIONS = [
  { value: '24', label: 'advanced_options.fps_options.24fps' },
  { value: '30', label: 'advanced_options.fps_options.30fps' },
  { value: '60', label: 'advanced_options.fps_options.60fps' },
];

// 运动强度选项
export const MOTION_STRENGTH_OPTIONS = [
  { value: 'low', label: 'advanced_options.motion_strength_options.low' },
  { value: 'medium', label: 'advanced_options.motion_strength_options.medium' },
  { value: 'high', label: 'advanced_options.motion_strength_options.high' },
];

// 图生视频模式选项
export const IMAGE_TO_VIDEO_MODE_OPTIONS = [
  {
    value: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
    label: 'advanced_options.image_to_video_mode_options.first_and_last',
  },
  {
    value: 'REFERENCE_2_VIDEO',
    label: 'advanced_options.image_to_video_mode_options.reference',
  },
];

export type VideoOptionType =
  | 'aspectRatio'
  | 'resolution'
  | 'duration'
  | 'fps'
  | 'motionStrength'
  | 'imageToVideoMode';

// 工具函数
export function getVideoOptionsForType(type: VideoOptionType) {
  const optionsMap: Record<VideoOptionType, any[]> = {
    aspectRatio: VIDEO_ASPECT_RATIO_OPTIONS,
    resolution: VIDEO_RESOLUTION_OPTIONS,
    duration: VIDEO_DURATION_OPTIONS,
    fps: VIDEO_FPS_OPTIONS,
    motionStrength: MOTION_STRENGTH_OPTIONS,
    imageToVideoMode: IMAGE_TO_VIDEO_MODE_OPTIONS,
  };
  return optionsMap[type] || [];
}

export function getVideoOptionLabel(type: VideoOptionType): string {
  const labelMap: Record<VideoOptionType, string> = {
    aspectRatio: 'advanced_options.aspect_ratio',
    resolution: 'advanced_options.resolution',
    duration: 'advanced_options.duration',
    fps: 'advanced_options.fps',
    motionStrength: 'advanced_options.motion_strength',
    imageToVideoMode: 'advanced_options.image_to_video_mode',
  };
  return labelMap[type] || '';
}

export interface VideoAdvancedOptions {
  supportedTypes: VideoOptionType[];
}

export interface VideoModelOption {
  label: string;
  provider: string;
  brand: string;
  modelPath: string;
  credits: Record<string, string>;
  sceneValues: Record<string, string>;
  defaultOptions: Record<string, any>;
  advancedOptions?: VideoAdvancedOptions;
}

export const MODEL_OPTIONS: VideoModelOption[] = [
  // Google DeepMind models
  {
    label: 'Veo 3.1',
    provider: 'kie',
    brand: 'google',
    modelPath: 'veo-3-1',
    credits: {
      'text-to-video': '8',
      'image-to-video': '10',
    },
    sceneValues: {
      'text-to-video': 'veo3_fast',
      'image-to-video': 'veo3_fast',
    },
    defaultOptions: {
      imageUrls: [],
      aspect_ratio: '16:9',
      seeds: 62845,
      enableTranslation: true,
      generationType: 'REFERENCE_2_VIDEO',
    },
    advancedOptions: {
      supportedTypes: [
        'aspectRatio',
        'imageToVideoMode',
        'duration',
        'resolution',
        'fps',
        'motionStrength',
      ],
    },
  },
  // Kling AI models
  {
    label: 'Kling 3.0',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-3-0',
    credits: {
      'text-to-video': '10',
      'image-to-video': '12',
    },
    sceneValues: {
      'text-to-video': 'kling-3-0-text-to-video',
      'image-to-video': 'kling-3-0-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  {
    label: 'Kling 3.0 Motion Control',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-3-0-motion-control',
    credits: {
      'image-to-video': '14',
    },
    sceneValues: {
      'image-to-video': 'kling-3-0-motion-control',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
      motion_strength: 'medium',
    },
    advancedOptions: {
      supportedTypes: [
        'aspectRatio',
        'resolution',
        'duration',
        'motionStrength',
      ],
    },
  },
  {
    label: 'Kling 2.6',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-2-6',
    credits: {
      'text-to-video': '8',
      'image-to-video': '10',
    },
    sceneValues: {
      'text-to-video': 'kling-2-6-text-to-video',
      'image-to-video': 'kling-2-6-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  {
    label: 'Kling 2.6 Motion Control',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-2-6-motion-control',
    credits: {
      'image-to-video': '12',
    },
    sceneValues: {
      'image-to-video': 'kling-2-6-motion-control',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
      motion_strength: 'medium',
    },
    advancedOptions: {
      supportedTypes: [
        'aspectRatio',
        'resolution',
        'duration',
        'motionStrength',
      ],
    },
  },
  // Alibaba Wan models
  {
    label: 'Wan 2.6',
    provider: 'kie',
    brand: 'wan',
    modelPath: 'wan-2-6',
    credits: {
      'text-to-video': '6',
      'image-to-video': '8',
    },
    sceneValues: {
      'text-to-video': 'wan-2-6-text-to-video',
      'image-to-video': 'wan-2-6-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  {
    label: 'Wan 2.5',
    provider: 'kie',
    brand: 'wan',
    modelPath: 'wan-2-5',
    credits: {
      'text-to-video': '5',
      'image-to-video': '7',
    },
    sceneValues: {
      'text-to-video': 'wan-2-5-text-to-video',
      'image-to-video': 'wan-2-5-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  // xAI Grok models
  {
    label: 'Grok Imagine',
    provider: 'kie',
    brand: 'grok',
    modelPath: 'grok-imagine',
    credits: {
      'text-to-video': '7',
      'image-to-video': '9',
    },
    sceneValues: {
      'text-to-video': 'grok-imagine-text-to-video',
      'image-to-video': 'grok-imagine-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  // ByteDance Seedance models
  {
    label: 'Seedance 2.0',
    provider: 'kie',
    brand: 'seedance',
    modelPath: 'seedance-2-0',
    credits: {
      'text-to-video': '12',
      'image-to-video': '14',
    },
    sceneValues: {
      'text-to-video': 'seedance-2-0-text-to-video',
      'image-to-video': 'seedance-2-0-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  {
    label: 'Seedance 1.5 Pro',
    provider: 'kie',
    brand: 'seedance',
    modelPath: 'seedance-1-5-pro',
    credits: {
      'text-to-video': '10',
      'image-to-video': '12',
    },
    sceneValues: {
      'text-to-video': 'seedance-1-5-pro-text-to-video',
      'image-to-video': 'seedance-1-5-pro-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  {
    label: 'Seedance 1.0 Pro Fast',
    provider: 'kie',
    brand: 'seedance',
    modelPath: 'seedance-1-0-pro-fast',
    credits: {
      'text-to-video': '6',
      'image-to-video': '8',
    },
    sceneValues: {
      'text-to-video': 'seedance-1-0-pro-fast-text-to-video',
      'image-to-video': 'seedance-1-0-pro-fast-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  // Runway AI models
  {
    label: 'Runway',
    provider: 'kie',
    brand: 'runway',
    modelPath: 'runway-video-generation',
    credits: {
      'text-to-video': '9',
      'image-to-video': '11',
    },
    sceneValues: {
      'text-to-video': 'runway-video-generation-text-to-video',
      'image-to-video': 'runway-video-generation-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  // MiniMax Hailuo models
  {
    label: 'Hailuo 2.3',
    provider: 'kie',
    brand: 'hailuo',
    modelPath: 'hailuo-2-3',
    credits: {
      'text-to-video': '8',
      'image-to-video': '10',
    },
    sceneValues: {
      'text-to-video': 'hailuo-2-3-text-to-video',
      'image-to-video': 'hailuo-2-3-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
  {
    label: 'Hailuo 02',
    provider: 'kie',
    brand: 'hailuo',
    modelPath: 'hailuo-02',
    credits: {
      'text-to-video': '7',
      'image-to-video': '9',
    },
    sceneValues: {
      'text-to-video': 'hailuo-02-text-to-video',
      'image-to-video': 'hailuo-02-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: '10',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration'],
    },
  },
];

export const PROVIDER_OPTIONS = [
  {
    value: 'google',
    label: 'Google',
  },
  {
    value: 'kling',
    label: 'Kling AI',
  },
  {
    value: 'wan',
    label: 'Alibaba',
  },
  {
    value: 'grok',
    label: 'xAI',
  },
  {
    value: 'seedance',
    label: 'ByteDance',
  },
  {
    value: 'runway',
    label: 'Runway',
  },
  {
    value: 'hailuo',
    label: 'MiniMax',
  },
];
