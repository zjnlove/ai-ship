// 视频宽高比选项
export const VIDEO_ASPECT_RATIO_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
];

// 视频分辨率选项
export const VIDEO_RESOLUTION_OPTIONS = [
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
  { value: '4k', label: '4K' },
];

// 视频时长选项
export const VIDEO_DURATION_OPTIONS = [
  { value: '5', label: '5秒' },
  { value: '10', label: '10秒' },
  { value: '15', label: '15秒' },
];

// 视频帧率选项
export const VIDEO_FPS_OPTIONS = [
  { value: '24', label: '24fps' },
  { value: '30', label: '30fps' },
  { value: '60', label: '60fps' },
];

// 运动强度选项
export const MOTION_STRENGTH_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// 图生视频模式选项
export const IMAGE_TO_VIDEO_MODE_OPTIONS = [
  { value: 'FIRST_AND_LAST_FRAMES_2_VIDEO', label: '首尾帧模式' },
  { value: 'REFERENCE_2_VIDEO', label: '参考图模式' },
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
    aspectRatio: 'Aspect Ratio',
    resolution: 'Resolution',
    duration: 'Duration',
    fps: 'Frame Rate',
    motionStrength: 'Motion Strength',
    imageToVideoMode: 'Image to Video Mode',
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
      supportedTypes: ['aspectRatio'],
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
