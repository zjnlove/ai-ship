// 视频选项类型
export type VideoOptionType =
  | 'aspectRatio'
  | 'resolution'
  | 'mode'
  | 'duration'
  | 'fps'
  | 'motionStrength'
  | 'refFrameMode'
  | 'audio'
  | 'fix_camera';

// 单个选项值及其积分
export interface VideoOptionValue {
  value: string | boolean;
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
  unitStep?: number; // ✅ 单位间隔步长，每多少个值为一个计费单位
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
  audio?: VideoOptionValue[];
  fix_camera?: VideoOptionValue[];
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
  // ✅ 选项依赖约束规则
  dependencyRules?: DependencyRule[];
  // 场景配置，支持字符串ID 或 完整配置对象
  sceneValues: Record<
    string,
    | string
    | {
        id: string;
        maxImages?: number;
        maxVideos?: number;
        showImageUploader?: boolean;
        baseCredits?: number;
        creditRules?: CreditRule[];
        defaultOptions?: Record<string, any>;
        advancedOptions?: VideoAdvancedOptions;
        customOptions?: CustomVideoOptions;
        discount?: DiscountConfig;
        [key: string]: any;
      }
  >;
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
  type:
    | 'image'
    | 'video'
    | 'audio'
    | 'fix_camera'
    | 'boolean'
    | 'string'
    | 'number';
  fieldName: string; // 实际发送到 API 的字段名
  isArray?: boolean; // 是否为数组
  defaultValue?: any; // 默认值
  required?: boolean; // 是否必须
}

// ✅ 选项依赖约束规则
export interface DependencyRule {
  when: Record<string, string | boolean>; // 触发条件
  then: {
    disabled?: string[]; // 禁用的选项 "type:value"
    autoSelect?: Record<string, string>; // 自动切换的选项
    message?: string; // 提示消息
  };
}

// 积分计算结果
export interface CreditCalculationResult {
  original: number;
  discounted: number;
  discountRate: number;
}
