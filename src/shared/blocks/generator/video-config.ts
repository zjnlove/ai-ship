// 视频宽高比选项
export const VIDEO_ASPECT_RATIO_OPTIONS = [
  { value: 'auto', label: 'advanced_options.aspect_ratio_options.auto' },
  { value: '16:9', label: 'advanced_options.aspect_ratio_options.16_9' },
  { value: '9:16', label: 'advanced_options.aspect_ratio_options.9_16' },
  { value: '1:1', label: 'advanced_options.aspect_ratio_options.1_1' },
];

// 视频分辨率选项
export const VIDEO_RESOLUTION_OPTIONS = [
  { value: '720', label: 'advanced_options.resolution_options.720p' },
  { value: '1080', label: 'advanced_options.resolution_options.1080p' },
  { value: '4k', label: 'advanced_options.resolution_options.4k' },
];

// 视频时长选项
export const VIDEO_DURATION_OPTIONS = [
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
  | 'imageToVideoMode'
  | 'audio';

// 单个选项值及其积分
export interface VideoOptionValue {
  value: string;
  label: string;
  credits?: number; // 该选项值的额外积分消耗
}

// 关联积分规则
export interface CreditRule {
  conditions: Record<string, string | boolean>; // 触发条件
  credits: number; // 积分消耗
  perUnit?: boolean; // 是否按单位计算
  unitField?: string; // 按哪个字段计算单位
  startFrom?: number; // 从第几个单位开始计算（默认 1）
}

// 折扣配置
export interface DiscountConfig {
  rate: number; // 折扣率，如 0.8 表示 8 折
  label?: string; // 折扣标签，如 "限时优惠"
  startDate?: string; // 折扣开始时间
  endDate?: string; // 折扣结束时间
}

// 自定义选项配置
export interface CustomVideoOptions {
  aspectRatio?: VideoOptionValue[];
  resolution?: VideoOptionValue[];
  duration?: VideoOptionValue[];
  fps?: VideoOptionValue[];
  motionStrength?: VideoOptionValue[];
  imageToVideoMode?: VideoOptionValue[];
}

// 工具函数：获取公共选项
export function getVideoOptionsForType(
  type: VideoOptionType
): VideoOptionValue[] {
  const optionsMap: Record<VideoOptionType, VideoOptionValue[]> = {
    aspectRatio: VIDEO_ASPECT_RATIO_OPTIONS,
    resolution: VIDEO_RESOLUTION_OPTIONS,
    duration: VIDEO_DURATION_OPTIONS,
    fps: VIDEO_FPS_OPTIONS,
    motionStrength: MOTION_STRENGTH_OPTIONS,
    imageToVideoMode: IMAGE_TO_VIDEO_MODE_OPTIONS,
    audio: [], // audio 是布尔类型，不需要选项列表
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
    audio: 'advanced_options.audio',
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
  baseCredits: {
    'text-to-video'?: number;
    'image-to-video'?: number;
  };
  // 自定义选项（每个模型可配置不同的选项值）
  customOptions: CustomVideoOptions;
  // 折扣配置（可选）
  discount?: DiscountConfig;
  // 关联积分规则
  creditRules?: CreditRule[];
  sceneValues: Record<string, string>;
  defaultOptions: Record<string, any>;
  advancedOptions?: VideoAdvancedOptions;
}

// 检查折扣是否在有效期内
export function isDiscountValid(discount: DiscountConfig): boolean {
  const now = new Date();

  if (discount.startDate) {
    const start = new Date(discount.startDate);
    if (now < start) return false;
  }

  if (discount.endDate) {
    const end = new Date(discount.endDate);
    if (now > end) return false;
  }

  return true;
}

// 获取折扣标签
export function getDiscountLabel(model: VideoModelOption): string | null {
  if (model.discount && isDiscountValid(model.discount)) {
    const rate = Math.round(model.discount.rate * 10);
    return model.discount.label || `${rate}折`;
  }
  return null;
}

// 计算原始积分
export function calculateOriginalCredits(
  model: VideoModelOption,
  scene: string,
  selectedOptions: Record<string, string | boolean>
): number {
  let totalCredits =
    model.baseCredits[scene as keyof typeof model.baseCredits] || 0;

  // 匹配关联规则（所有匹配的规则都生效）
  if (model.creditRules) {
    for (const rule of model.creditRules) {
      const isMatch = Object.entries(rule.conditions).every(
        ([key, value]) => selectedOptions[key] === value
      );

      if (isMatch) {
        if (rule.perUnit && rule.unitField) {
          const units = parseInt(
            String(selectedOptions[rule.unitField]) || '0'
          );
          const startFrom = rule.startFrom || 1;
          const effectiveUnits = Math.max(0, units - startFrom + 1);
          totalCredits += rule.credits * effectiveUnits;
        } else {
          totalCredits += rule.credits;
        }
      }
    }
  }

  // 累加各选项的固定积分
  Object.entries(selectedOptions).forEach(([type, value]) => {
    if (type === 'audio') return; // audio 通过规则计算

    const options = model.customOptions[type as keyof CustomVideoOptions];
    if (options && typeof value === 'string') {
      const option = options.find((opt) => opt.value === value);
      if (option?.credits) {
        totalCredits += option.credits;
      }
    }
  });

  return totalCredits;
}

// 计算折扣后积分
export function calculateDiscountedCredits(
  model: VideoModelOption,
  scene: string,
  selectedOptions: Record<string, string | boolean>
): { original: number; discounted: number; discountRate: number } {
  const original = calculateOriginalCredits(model, scene, selectedOptions);

  if (model.discount && isDiscountValid(model.discount)) {
    const discounted = Math.ceil(original * model.discount.rate);
    return { original, discounted, discountRate: model.discount.rate };
  }

  return { original, discounted: original, discountRate: 1 };
}

// 获取模型支持的选项（优先使用自定义选项，否则使用公共选项）
export function getOptionsForModel(
  model: VideoModelOption,
  type: VideoOptionType
): VideoOptionValue[] {
  const customOptions = model.customOptions[type as keyof CustomVideoOptions];
  if (customOptions && customOptions.length > 0) {
    return customOptions;
  }
  return getVideoOptionsForType(type);
}

export const MODEL_OPTIONS: VideoModelOption[] = [
  // Google DeepMind models
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
    defaultOptions: {
      imageUrls: [],
      aspect_ratio: '16:9',
      seeds: 62845,
      enableTranslation: true,
      generationType: 'REFERENCE_2_VIDEO',
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'imageToVideoMode'],
    },
  },
  // Kling AI models
  {
    label: 'Kling 3.0',
    provider: 'kie',
    brand: 'kling',
    modelPath: 'kling-3-0',
    baseCredits: {
      'text-to-video': 42,
      'image-to-video': 42,
    },
    sceneValues: {
      'text-to-video': 'kling-3-0-text-to-video',
      'image-to-video': 'kling-3-0-image-to-video',
    },
    defaultOptions: {
      aspect_ratio: '16:9',
      resolution: '720',
      mode: 'std',
      duration: '5',
      audio: false,
    },
    advancedOptions: {
      supportedTypes: ['aspectRatio', 'resolution', 'duration', 'audio'],
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
    },
    discount: {
      rate: 0.5,
      label: '-50% OFF',
    },
    creditRules: [
      // 1080p 基础积分
      {
        conditions: { resolution: '1080' },
        credits: 12,
      },
      // 720p + 时长：每秒 14 积分
      {
        conditions: { resolution: '720' },
        credits: 14,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4, // 从第4秒开始计算
      },
      // 1080p + 时长：每秒 20 积分
      {
        conditions: { resolution: '1080' },
        credits: 18,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4, // 从第4秒开始计算
      },

      // 声音开启基础分
      {
        conditions: { resolution: '720', audio: true },
        credits: 18,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 27,
      },

      // 720p + 有声音：5 积分
      {
        conditions: { resolution: '720', audio: true },
        credits: 6,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4, // 从第4秒开始计算
      },
      // 1080p + 有声音：10 积分
      {
        conditions: { resolution: '1080', audio: true },
        credits: 9,
        perUnit: true,
        unitField: 'duration',
        startFrom: 4, // 从第4秒开始计算
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
      'text-to-video': 4,
      'image-to-video': 6,
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
        credits: 8,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '1080' },
        credits: 15,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '720', audio: true },
        credits: 4,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 8,
      },
    ],
    sceneValues: {
      'text-to-video': 'kling-2-6-text-to-video',
      'image-to-video': 'kling-2-6-image-to-video',
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
  // Alibaba Wan models
  {
    label: 'Wan 2.6',
    provider: 'kie',
    brand: 'wan',
    modelPath: 'wan-2-6',
    baseCredits: {
      'text-to-video': 4,
      'image-to-video': 6,
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
        credits: 8,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '1080' },
        credits: 15,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '720', audio: true },
        credits: 4,
      },
      {
        conditions: { resolution: '1080', audio: true },
        credits: 8,
      },
    ],
    sceneValues: {
      'text-to-video': 'wan-2-6-text-to-video',
      'image-to-video': 'wan-2-6-image-to-video',
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
  // xAI Grok models
  {
    label: 'Grok Imagine',
    provider: 'kie',
    brand: 'grok',
    modelPath: 'grok-imagine',
    baseCredits: {
      'text-to-video': 5,
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
      'text-to-video': 'grok-imagine-text-to-video',
      'image-to-video': 'grok-imagine-image-to-video',
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
  // ByteDance Seedance models
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
  // Runway AI models
  {
    label: 'Runway',
    provider: 'kie',
    brand: 'runway',
    modelPath: 'runway-video-generation',
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
      'text-to-video': 'runway-video-generation-text-to-video',
      'image-to-video': 'runway-video-generation-image-to-video',
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
  // MiniMax Hailuo models
  {
    label: 'Hailuo 2.3',
    provider: 'kie',
    brand: 'hailuo',
    modelPath: 'hailuo-2-3',
    baseCredits: {
      'text-to-video': 5,
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
      'text-to-video': 'hailuo-2-3-text-to-video',
      'image-to-video': 'hailuo-2-3-image-to-video',
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
    label: 'Hailuo 02',
    provider: 'kie',
    brand: 'hailuo',
    modelPath: 'hailuo-02',
    baseCredits: {
      'text-to-video': 4,
      'image-to-video': 6,
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
        credits: 8,
        perUnit: true,
        unitField: 'duration',
      },
      {
        conditions: { resolution: '720', audio: true },
        credits: 4,
      },
    ],
    sceneValues: {
      'text-to-video': 'hailuo-02-text-to-video',
      'image-to-video': 'hailuo-02-image-to-video',
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
