// 视频选项类型
export type VideoOptionType =
  | 'aspectRatio'
  | 'resolution'
  | 'mode'
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

// 积分计算结果
export interface CreditCalculationResult {
  original: number;
  discounted: number;
  discountRate: number;
}
