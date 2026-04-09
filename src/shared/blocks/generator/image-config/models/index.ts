import { ImageModelOption } from '../types';
import { fluxModels } from './flux';
import { googleModels } from './google';
import { grokModels } from './grok';
import { openaiModels } from './openai';
import { qwenModels } from './qwen';
import { recraftModels } from './recraft';

export const MODEL_OPTIONS: ImageModelOption[] = [
  ...qwenModels,
  ...googleModels,
  ...openaiModels,
  ...fluxModels,
  ...grokModels,
  ...recraftModels,
];

export { qwenModels } from './qwen';
export { googleModels } from './google';
export { openaiModels } from './openai';
export { fluxModels } from './flux';
export { grokModels } from './grok';
export { recraftModels } from './recraft';
