import { VideoOptionValue } from './types';

// 视频宽高比选项
export const VIDEO_ASPECT_RATIO_OPTIONS: VideoOptionValue[] = [
  { value: 'auto', label: 'advanced_options.aspect_ratio_options.auto' },
  { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
  { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
  { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
];

// 视频分辨率选项
export const VIDEO_RESOLUTION_OPTIONS: VideoOptionValue[] = [
  { value: '720', label: 'advanced_options.resolution_options.720p' },
  { value: '1080', label: 'advanced_options.resolution_options.1080p' },
  { value: '4k', label: 'advanced_options.resolution_options.4k' },
];

// 视频时长选项
export const VIDEO_DURATION_OPTIONS: VideoOptionValue[] = [
  { value: '3', label: 'advanced_options.duration_options.3s' },
  { value: '4', label: 'advanced_options.duration_options.4s' },
  { value: '5', label: 'advanced_options.duration_options.5s' },
  { value: '6', label: 'advanced_options.duration_options.6s' },
  { value: '7', label: 'advanced_options.duration_options.7s' },
  { value: '8', label: 'advanced_options.duration_options.8s' },
  { value: '9', label: 'advanced_options.duration_options.9s' },
  { value: '10', label: 'advanced_options.duration_options.10s' },
  { value: '11', label: 'advanced_options.duration_options.11s' },
  { value: '12', label: 'advanced_options.duration_options.12s' },
  { value: '13', label: 'advanced_options.duration_options.13s' },
  { value: '14', label: 'advanced_options.duration_options.14s' },
  { value: '15', label: 'advanced_options.duration_options.15s' },
];

// 视频帧率选项
export const VIDEO_FPS_OPTIONS: VideoOptionValue[] = [
  { value: '24', label: 'advanced_options.fps_options.24fps' },
  { value: '30', label: 'advanced_options.fps_options.30fps' },
  { value: '60', label: 'advanced_options.fps_options.60fps' },
];

// 运动强度选项
export const MOTION_STRENGTH_OPTIONS: VideoOptionValue[] = [
  { value: 'low', label: 'advanced_options.motion_strength_options.low' },
  { value: 'medium', label: 'advanced_options.motion_strength_options.medium' },
  { value: 'high', label: 'advanced_options.motion_strength_options.high' },
];

// 参考帧模式选项
export const REF_FRAME_MODE_OPTIONS: VideoOptionValue[] = [
  {
    value: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
    label: 'advanced_options.ref_frame_mode_options.first_and_last',
  },
  {
    value: 'REFERENCE_2_VIDEO',
    label: 'advanced_options.ref_frame_mode_options.reference',
  },
];

// 视频模式选项
export const VIDEO_MODE_OPTIONS: VideoOptionValue[] = [
  { value: 'std', label: 'advanced_options.mode_options.standard' },
  { value: 'pro', label: 'advanced_options.mode_options.professional' },
];

// 提供商选项
export const PROVIDER_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'kling', label: 'Kling AI' },
  { value: 'wan', label: 'Alibaba' },
  { value: 'grok', label: 'xAI' },
  { value: 'seedance', label: 'ByteDance' },
  // { value: 'runway', label: 'Runway' },
  { value: 'hailuo', label: 'Hailuo' },
];
