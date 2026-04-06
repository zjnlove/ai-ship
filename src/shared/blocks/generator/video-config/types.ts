// 视频选项类型
export type VideoOptionType =
  | 'aspectRatio'
  | 'resolution'
  | 'mode'
  | 'duration'
  | 'fps'
  | 'motionStrength'
  | 'refFrameMode'
  | 'audio';

// 单个选项值及其积分
export interface VideoOptionValue {
  value: string;
  label: string;
  credits?: number; // 该选项值的额外积分消耗
}

// 范围选项配置
export interface VideoOptionRange {
  type: 'range';
  min: number;
  max: number;
  step: number;
  unit?: string;
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
  duration?: VideoOptionValue[] | VideoOptionRange;
  fps?: VideoOptionValue[] | VideoOptionRange;
  motionStrength?: VideoOptionValue[] | VideoOptionRange;
  refFrameMode?: VideoOptionValue[];
  mode?: VideoOptionValue[];
}

// 视频高级选项
export interface VideoAdvancedOptions {
  supportedTypes: VideoOptionType[];
}

// 视频模型选项
export interface VideoModelOption {
  label: string;
  provider: string;
  brand: string;
  modelPath: string;
  baseCredits: {
    'text-to-video'?: number;
    'image-to-video'?: number;
    'video-to-video'?: number;
  };
  maxImages?: number; // 模型支持的最大图片数量（如果适用）
  // 自定义字段配置
  customFields?: CustomFieldConfig[];
  // 自定义选项（每个模型可配置不同的选项值）
  customOptions: CustomVideoOptions;
  // 折扣配置（可选）
  discount?: DiscountConfig;
  // 关联积分规则
  creditRules?: CreditRule[];
  sceneValues: Record<string, string>;
  imageField?: {
    fieldName: string; // 字段名称，如 'imageUrls', 'image', 'images'
    isArray: boolean; // 是否为数组
  };
  defaultOptions: Record<string, any>;
  advancedOptions?: VideoAdvancedOptions;
  // 输入验证规则
  inputValidation?: InputValidationRules;
}

// 输入验证规则
export interface InputValidationRules {
  video?: {
    minDuration?: number; // 最小时长 单位:秒
    maxDuration?: number; // 最大时长 单位:秒
    maxFileSize?: number; // 最大文件大小 单位:MB
    supportedFormats?: string[]; // 支持的文件格式
  };
  image?: {
    maxFileSize?: number; // 最大文件大小 单位:MB
    supportedFormats?: string[]; // 支持的文件格式
  };
}

// 自定义字段配置
export interface CustomFieldConfig {
  type: 'image' | 'video' | 'audio' | 'boolean' | 'string' | 'number';
  fieldName: string; // 实际发送到 API 的字段名
  isArray?: boolean; // 是否为数组
  defaultValue?: any; // 默认值
  required?: boolean; // 是否必须
}

// 积分计算结果
export interface CreditCalculationResult {
  original: number;
  discounted: number;
  discountRate: number;
}
