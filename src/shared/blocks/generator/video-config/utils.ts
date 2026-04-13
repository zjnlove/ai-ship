import {
  MOTION_STRENGTH_OPTIONS,
  REF_FRAME_MODE_OPTIONS,
  VIDEO_ASPECT_RATIO_OPTIONS,
  VIDEO_DURATION_OPTIONS,
  VIDEO_FPS_OPTIONS,
  VIDEO_MODE_OPTIONS,
  VIDEO_RESOLUTION_OPTIONS,
} from './options';
import {
  CreditCalculationResult,
  CustomVideoOptions,
  DiscountConfig,
  VideoModelOption,
  VideoOptionType,
  VideoOptionValue,
} from './types';

// 工具函数：获取公共选项
export function getVideoOptionsForType(
  type: VideoOptionType
): VideoOptionValue[] {
  const optionsMap: Record<VideoOptionType, VideoOptionValue[]> = {
    aspectRatio: VIDEO_ASPECT_RATIO_OPTIONS,
    resolution: VIDEO_RESOLUTION_OPTIONS,
    mode: VIDEO_MODE_OPTIONS,
    duration: VIDEO_DURATION_OPTIONS,
    fps: VIDEO_FPS_OPTIONS,
    motionStrength: MOTION_STRENGTH_OPTIONS,
    refFrameMode: REF_FRAME_MODE_OPTIONS,
    audio: [], // audio 是布尔类型，不需要选项列表
    fix_camera: [], // fix_camera 是布尔类型，不需要选项列表
  };
  return optionsMap[type] || [];
}

// 获取选项标签
export function getVideoOptionLabel(type: VideoOptionType): string {
  const labelMap: Record<VideoOptionType, string> = {
    aspectRatio: 'advanced_options.aspect_ratio',
    resolution: 'advanced_options.resolution',
    mode: 'advanced_options.mode',
    duration: 'advanced_options.duration',
    fps: 'advanced_options.fps',
    motionStrength: 'advanced_options.motion_strength',
    refFrameMode: 'advanced_options.ref_frame_mode',
    audio: 'advanced_options.audio',
    fix_camera: 'advanced_options.fix_camera',
  };
  return labelMap[type] || '';
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
    // 第一阶段：计算所有基础规则
    for (const rule of model.creditRules) {
      const isMatch = Object.entries(rule.conditions).every(
        ([key, value]) => selectedOptions[key] === value
      );

      if (isMatch && rule.credits !== undefined) {
        if (rule.perUnit && rule.unitField) {
          const units = parseInt(
            String(selectedOptions[rule.unitField]) || '0'
          );
          const startFrom = rule.startFrom || 1;
          const unitStep = rule.unitStep || 1;

          let effectiveUnits = Math.max(0, units - startFrom + 1);

          // ✅ 按间隔步长计算单位
          if (unitStep > 1) {
            effectiveUnits = Math.ceil(effectiveUnits / unitStep);
          }

          totalCredits += rule.credits * effectiveUnits;
        } else {
          totalCredits += rule.credits;
        }
      }
    }

    // 第二阶段：计算所有乘数规则（最后执行，全部相乘）
    for (const rule of model.creditRules) {
      const isMatch = Object.entries(rule.conditions).every(
        ([key, value]) => selectedOptions[key] === value
      );

      if (isMatch && rule.multiplier !== undefined) {
        totalCredits = Math.ceil(totalCredits * rule.multiplier);
      }
    }
  }

  // 累加各选项的固定积分
  Object.entries(selectedOptions).forEach(([type, value]) => {
    if (type === 'audio') return; // audio 通过规则计算

    const options = model.customOptions[type as keyof CustomVideoOptions];
    if (options && Array.isArray(options) && typeof value === 'string') {
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
): CreditCalculationResult {
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

  // 支持范围模式，自动生成选项数组
  if (
    customOptions &&
    'type' in customOptions &&
    customOptions.type === 'range'
  ) {
    const options: VideoOptionValue[] = [];
    for (
      let val = customOptions.min;
      val <= customOptions.max;
      val += customOptions.step
    ) {
      options.push({
        value: String(val),
        label: `advanced_options.duration_options.${val}s`,
      });
    }
    return options;
  }

  if (
    customOptions &&
    Array.isArray(customOptions) &&
    customOptions.length > 0
  ) {
    return customOptions;
  }
  return getVideoOptionsForType(type);
}
