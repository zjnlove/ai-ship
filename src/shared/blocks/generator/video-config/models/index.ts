import { VideoModelOption } from '../types';
import { googleModels } from './google';
import { grokModels } from './grok';
import { hailuoModels } from './hailuo';
import { klingModels } from './kling';
import { runwayModels } from './runway';
import { seedanceModels } from './seedance';
import { wanModels } from './wan';

// 合并所有模型
export const MODEL_OPTIONS: VideoModelOption[] = [
  ...googleModels,
  ...klingModels,
  ...wanModels,
  ...grokModels,
  ...seedanceModels,
  ...runwayModels,
  ...hailuoModels,
];

// 按品牌导出模型
export { googleModels } from './google';
export { klingModels } from './kling';
export { wanModels } from './wan';
export { grokModels } from './grok';
export { seedanceModels } from './seedance';
export { runwayModels } from './runway';
export { hailuoModels } from './hailuo';
